-- User Orders Schema - Connect User Purchases to Admin Dashboard
-- This schema connects the existing cart system to admin order management

-- Update existing products table to match current system
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS material VARCHAR(100),
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS occasion TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS style VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update carts to connect to orders
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned'));

-- Create order statuses table for tracking
CREATE TABLE IF NOT EXISTS order_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT 'gray',
  sequence_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default order statuses
INSERT INTO order_statuses (name, display_name, description, color, sequence_order, is_default) VALUES
('pending', 'Menunggu Pembayaran', 'Menunggu konfirmasi pembayaran dari customer', 'gray', 1, true),
('paid', 'Sudah Dibayar', 'Pembayaran telah dikonfirmasi', 'blue', 2, false),
('confirmed', 'Dikonfirmasi', 'Pesanan telah dikonfirmasi oleh admin', 'blue', 3, false),
('processing', 'Diproses', 'Pesanan sedang diproses', 'yellow', 4, false),
('shipped', 'Dikirim', 'Pesanan telah dikirim ke alamat customer', 'orange', 5, false),
('delivered', 'Diterima', 'Pesanan telah diterima customer', 'green', 6, false),
('cancelled', 'Dibatalkan', 'Pesanan dibatalkan oleh customer atau admin', 'red', 7, false),
('refunded', 'Dikembalikan', 'Pembayaran dikembalikan', 'red', 8, false)
ON CONFLICT (name) DO NOTHING;

-- Update orders table to better track user purchases
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
ADD COLUMN IF NOT EXISTS actual_delivery DATE,
ADD COLUMN IF NOT EXISTS notes_admin TEXT,
ADD COLUMN IF NOT EXISTS notes_customer TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create order status history table for tracking changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_type VARCHAR(20) DEFAULT 'admin' CHECK (changed_by_type IN ('admin', 'customer', 'system')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create order from cart
CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id UUID,
  p_session_id VARCHAR,
  p_customer_data JSONB,
  p_shipping_address JSONB,
  p_billing_address JSONB,
  p_payment_method VARCHAR,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  cart_item RECORD;
  new_order_item_id UUID;
BEGIN
  -- Create the order
  INSERT INTO orders (
    user_id,
    session_id,
    customer_id,
    status,
    payment_status,
    payment_method,
    subtotal,
    tax,
    shipping_cost,
    discount_amount,
    total_amount,
    notes,
    shipping_address,
    billing_address
  )
  SELECT
    p_user_id,
    p_session_id,
    (SELECT id FROM customers WHERE email = p_customer_data->>'email' LIMIT 1),
    'pending',
    'pending',
    p_payment_method,
    COALESCE(SUM(ci.quantity * p.price), 0),
    COALESCE(SUM(ci.quantity * p.price) * 0.1, 0), -- 10% tax
    15000, -- fixed shipping cost
    0,
    COALESCE(SUM(ci.quantity * p.price), 0) + COALESCE(SUM(ci.quantity * p.price) * 0.1, 0) + 15000,
    p_notes,
    p_shipping_address,
    p_billing_address
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.user_id = p_user_id OR ci.session_id = p_session_id
  RETURNING id INTO new_order_id;
  
  -- Create order items
  FOR cart_item IN
    SELECT ci.*, p.name as product_name, p.sku as product_sku, p.price as unit_price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id OR ci.session_id = p_session_id
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      unit_price,
      total_price,
      product_name,
      product_sku
    ) VALUES (
      new_order_id,
      cart_item.product_id,
      cart_item.quantity,
      cart_item.unit_price,
      cart_item.quantity * cart_item.unit_price,
      cart_item.product_name,
      cart_item.product_sku
    ) RETURNING id INTO new_order_item_id;
  END LOOP;
  
  -- Update cart items status
  UPDATE cart_items 
  SET status = 'converted' 
  WHERE user_id = p_user_id OR session_id = p_session_id;
  
  -- Create initial status history
  INSERT INTO order_status_history (order_id, status, changed_by_type, notes)
  VALUES (new_order_id, 'pending', 'system', 'Order created from cart');
  
  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update order status
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status VARCHAR,
  p_changed_by UUID DEFAULT NULL,
  p_changed_by_type VARCHAR DEFAULT 'admin',
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_status VARCHAR;
BEGIN
  -- Get current status
  SELECT status INTO current_status FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update order status
  UPDATE orders 
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Add to history
  INSERT INTO order_status_history (order_id, status, changed_by, changed_by_type, notes)
  VALUES (p_order_id, p_new_status, p_changed_by, p_changed_by_type, p_notes);
  
  -- Update delivery dates if status is delivered
  IF p_new_status = 'delivered' THEN
    UPDATE orders 
    SET actual_delivery = CURRENT_DATE
    WHERE id = p_order_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

-- Enable RLS for new tables
ALTER TABLE order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Policies for order statuses
CREATE POLICY "Order statuses are viewable by everyone" ON order_statuses
    FOR SELECT USING (true);

-- Policies for order status history
CREATE POLICY "Admins can view order status history" ON order_status_history
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage order status history" ON order_status_history
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view own order status history" ON order_status_history
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM orders o 
        WHERE o.id = order_id 
        AND o.user_id = auth.uid()
      )
    );
