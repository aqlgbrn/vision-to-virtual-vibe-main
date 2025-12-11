import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_size?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  shipping_address: any;
  billing_address: any;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  order_items: OrderItem[];
}

const statusConfig = {
  pending: { label: "Menunggu Konfirmasi", icon: Clock, color: "bg-yellow-500" },
  confirmed: { label: "Dikonfirmasi", icon: CheckCircle, color: "bg-blue-500" },
  processing: { label: "Diproses", icon: Package, color: "bg-purple-500" },
  shipped: { label: "Dikirim", icon: Truck, color: "bg-orange-500" },
  delivered: { label: "Terkirim", icon: CheckCircle, color: "bg-green-500" },
  cancelled: { label: "Dibatalkan", icon: AlertCircle, color: "bg-red-500" },
  refunded: { label: "Dikembalikan", icon: AlertCircle, color: "bg-gray-500" }
};

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && session) {
      fetchOrder();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel(`order_${id}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'orders',
            filter: `id=eq.${id}`
          },
          (payload) => {
            console.log('Order updated:', payload);
            fetchOrder(); // Refresh order data
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id, session]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          order_items(*)
        `)
        .eq('id', id)
        .eq('user_id', session?.user.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
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

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Pesanan tidak ditemukan</div>
        </div>
      </Layout>
    );
  }

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = currentStatus.icon;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          
          <h1 className="text-3xl font-bold">Tracking Pesanan</h1>
          <p className="text-muted-foreground">Nomor Pesanan: {order.order_number}</p>
        </div>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 text-white p-1 rounded-full ${currentStatus.color}`} />
              Status: {currentStatus.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Tanggal Pesanan:</span>
              <span>{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Status Pembayaran:</span>
              <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                {order.payment_status === 'paid' ? 'Dibayar' : 'Menunggu Pembayaran'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-semibold">Rp {order.total_amount.toLocaleString('id-ID')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detail Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.product_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Ukuran: {item.selected_size || 'Default'} | Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rp {item.total_price.toLocaleString('id-ID')}</p>
                    <p className="text-sm text-muted-foreground">
                      Rp {item.unit_price.toLocaleString('id-ID')} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">Rp {order.total_amount.toLocaleString('id-ID')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card>
          <CardHeader>
            <CardTitle>Alamat Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            {order.shipping_address ? (
              <div className="space-y-2">
                <p><strong>Nama:</strong> {order.customer.first_name} {order.customer.last_name}</p>
                <p><strong>Alamat:</strong> {order.shipping_address.street}</p>
                <p><strong>Kota:</strong> {order.shipping_address.city}</p>
                <p><strong>Kode Pos:</strong> {order.shipping_address.postal_code}</p>
                <p><strong>Telepon:</strong> {order.shipping_address.phone}</p>
              </div>
            ) : (
              <p>Alamat tidak tersedia</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
