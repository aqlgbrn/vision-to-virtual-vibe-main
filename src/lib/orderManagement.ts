import { supabase } from '@/integrations/supabase/client';

export interface OrderStatus {
  name: string;
  display_name: string;
  description: string;
  color: string;
  sequence_order: number;
}

export interface OrderWithDetails {
  id: string;
  order_number: string;
  user_id?: string;
  session_id?: string;
  customer?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  status: string;
  payment_status: string;
  payment_method?: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  notes_admin?: string;
  shipping_address?: any;
  billing_address?: any;
  order_items: Array<{
    id: string;
    product_id?: string;
    product_name: string;
    product_sku?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  changed_by?: string;
  changed_by_type: string;
  notes?: string;
  created_at: string;
}

// Get all order statuses
export async function getOrderStatuses(): Promise<OrderStatus[]> {
  try {
    const { data, error } = await supabase
      .from('order_statuses')
      .select('*')
      .order('sequence_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching order statuses:', error);
    throw error;
  }
}

// Get all orders with details
export async function getAllOrders(): Promise<OrderWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        order_items (
          id,
          product_id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          total_price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Get order by ID with full details
export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        order_items (
          id,
          product_id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  notes?: string,
  adminId?: string
): Promise<boolean> {
  try {
    // Update order status directly
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', orderId);

    if (error) throw error;

    // Add to status history if table exists
    try {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: newStatus,
          changed_by_type: 'admin',
          notes: notes || `Status updated to ${newStatus}`
        } as any);
    } catch (historyError) {
      // Ignore history errors for now
      console.log('History table may not exist:', historyError);
    }

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Get order status history
export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
  try {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching order status history:', error);
    throw error;
  }
}

// Update order details
export async function updateOrderDetails(
  orderId: string,
  updates: {
    tracking_number?: string;
    estimated_delivery?: string;
    notes_admin?: string;
    payment_status?: string;
  }
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating order details:', error);
    throw error;
  }
}

// Create order from cart (for checkout process)
export async function createOrderFromCart(
  userId: string | null,
  sessionId: string,
  customerData: any,
  shippingAddress: any,
  billingAddress: any,
  paymentMethod: string,
  notes?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('create_order_from_cart', {
      p_user_id: userId,
      p_session_id: sessionId,
      p_customer_data: customerData,
      p_shipping_address: shippingAddress,
      p_billing_address: billingAddress,
      p_payment_method: paymentMethod,
      p_notes: notes
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating order from cart:', error);
    throw error;
  }
}

// Get orders by status
export async function getOrdersByStatus(status: string): Promise<OrderWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        order_items (
          id,
          product_id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    throw error;
  }
}

// Get order statistics
export async function getOrderStatistics(): Promise<{
  total: number;
  pending: number;
  paid: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const orders = data || [];
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      paid: orders.filter(o => o.status === 'paid').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Get status color
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800',
    'paid': 'bg-blue-100 text-blue-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'processing': 'bg-yellow-100 text-yellow-800',
    'shipped': 'bg-orange-100 text-orange-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'refunded': 'bg-red-100 text-red-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
