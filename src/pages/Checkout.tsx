import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CreditCard, Truck, Package } from "lucide-react";

interface CartItem {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [shippingMethod, setShippingMethod] = useState('regular');

  useEffect(() => {
    if (session) {
      fetchCartItems();
    }
  }, [session]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', session?.user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Error",
        description: "Gagal memuat keranjang",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateShipping = () => {
    return shippingMethod === 'express' ? 25000 : 10000;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      toast({
        title: "Error",
        description: "Mohon lengkapi alamat pengiriman",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      // Create customer record first
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert({
          user_id: session?.user.id || '',
          first_name: shippingAddress.name.split(' ')[0],
          last_name: shippingAddress.name.split(' ').slice(1).join(' '),
          email: session?.user.email || '',
          phone: shippingAddress.phone
        } as any)
        .select()
        .single();

      if (customerError) throw customerError;
      if (!customer) throw new Error('Failed to create customer');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session?.user.id,
          customer_id: (customer as any).id,
          order_number: 'ORD' + Date.now(),
          total_amount: calculateTotal(),
          status: 'pending',
          payment_status: 'pending',
          shipping_address: JSON.stringify({
            street: shippingAddress.address,
            city: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
            phone: shippingAddress.phone
          }),
          billing_address: JSON.stringify({
            street: shippingAddress.address,
            city: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
            phone: shippingAddress.phone
          })
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: (order as any).id,
        product_id: item.product_id,
        product_name: item.product?.name || '',
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
        total_price: (item.product?.price || 0) * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as any);

      if (itemsError) throw itemsError;

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session?.user.id);

      toast({
        title: "Berhasil",
        description: "Pesanan Anda telah dibuat",
      });

      navigate('/order-success');

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Gagal membuat pesanan",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Keranjang Kosong</h1>
            <p className="text-muted-foreground mb-4">Tambahkan produk ke keranjang terlebih dahulu</p>
            <Button onClick={() => navigate('/products')}>
              Belanja Sekarang
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Keranjang
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Alamat Pengiriman</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={shippingAddress.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </form>
            </Card>

            {/* Shipping Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Metode Pengiriman</h2>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 mr-2" />
                        <span>Regular (3-5 hari)</span>
                      </div>
                      <span className="font-medium">Rp 10.000</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="express" id="express" />
                  <Label htmlFor="express">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 mr-2" />
                        <span>Express (1-2 hari)</span>
                      </div>
                      <span className="font-medium">Rp 25.000</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>Transfer Bank</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod">Cash on Delivery (COD)</Label>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      {item.product?.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x Rp {item.product?.price?.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-medium">
                      Rp {((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Kirim</span>
                  <span>Rp {calculateShipping().toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rp {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                onClick={handleSubmit}
                disabled={processing}
              >
                {processing ? "Memproses..." : "Bayar Sekarang"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
