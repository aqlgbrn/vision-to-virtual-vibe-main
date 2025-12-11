import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock, AlertCircle, Eye, Calendar, DollarSign } from "lucide-react";
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

const paymentStatusConfig = {
  pending: { label: "Menunggu Pembayaran", color: "bg-yellow-500" },
  paid: { label: "Dibayar", color: "bg-green-500" },
  failed: { label: "Gagal", color: "bg-red-500" },
  refunded: { label: "Dikembalikan", color: "bg-gray-500" }
};

export default function CustomerOrders() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchCustomerOrders();
  }, [session]);

  const fetchCustomerOrders = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      
      // First get customer ID by email
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', session.user.email)
        .maybeSingle();

      if (customerError) {
        console.error('Customer lookup error:', customerError);
        setOrders([]);
        return;
      }

      // Then get orders by customer ID
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers (
            first_name,
            last_name,
            email
          ),
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price,
            selected_size
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by customer if found
      if (customerData && 'id' in customerData) {
        query = query.eq('customer_id', customerData.id);
      } else {
        // If no customer record, return empty
        setOrders([]);
        return;
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="secondary">{status}</Badge>;
    
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config = paymentStatusConfig[status as keyof typeof paymentStatusConfig];
    if (!config) return <Badge variant="secondary">{status}</Badge>;
    
    return (
      <Badge className={`${config.color} text-white`}>
        <DollarSign className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (selectedOrder) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => setSelectedOrder(null)}
            className="mb-6"
          >
            ← Kembali ke Daftar Pesanan
          </Button>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Pesanan #{selectedOrder.order_number}</CardTitle>
                  <CardDescription>
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {formatDate(selectedOrder.created_at)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedOrder.status)}
                  {getPaymentStatusBadge(selectedOrder.payment_status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Items */}
              <div>
                <h3 className="font-semibold mb-4">Detail Produk</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x {formatCurrency(item.unit_price)}
                          {item.selected_size && ` • Ukuran: ${item.selected_size}`}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>

              <Separator />

              {/* Status Timeline */}
              <div>
                <h3 className="font-semibold mb-4">Status Pesanan</h3>
                <div className="space-y-3">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = key === selectedOrder.status;
                    const isPast = Object.keys(statusConfig).indexOf(key) < 
                                  Object.keys(statusConfig).indexOf(selectedOrder.status);
                    
                    return (
                      <div key={key} className={`flex items-center space-x-3 p-3 rounded-lg ${
                        isActive ? 'bg-purple-50 border border-purple-200' : 
                        isPast ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <div className={`p-2 rounded-full ${
                          isActive ? config.color : isPast ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isActive ? 'text-purple-700' : isPast ? 'text-green-700' : 'text-gray-500'}`}>
                            {config.label}
                          </p>
                          {isActive && (
                            <p className="text-sm text-purple-600">Status saat ini</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pesanan Saya</h1>
          <p className="text-gray-600">Lihat status dan detail pesanan Anda</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Pesanan</h3>
              <p className="text-gray-600 mb-6">Anda belum memiliki pesanan. Mulai belanja sekarang!</p>
              <Button onClick={() => navigate('/products')}>
                Mulai Belanja
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Pesanan #{order.order_number}</h3>
                      <p className="text-sm text-gray-600">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        {order.order_items.length} produk
                      </span>
                      <span className="font-semibold text-lg">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat Detail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/order-tracking/${order.id}`)}
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Lacak
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
