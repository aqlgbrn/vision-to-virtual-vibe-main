import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Loader2, ArrowLeft, Search, Filter } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  order_items?: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    selected_size?: string;
  }>;
}

function AdminOrders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          created_at,
          customer:customers (
            first_name,
            last_name,
            email,
            phone
          ),
          order_items (
            product_name,
            quantity,
            unit_price,
            selected_size
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        console.log('Orders fetched:', data);
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      
      // Use raw supabase client to avoid TypeScript issues
      const supabaseClient = supabase as any;
      const { error } = await supabaseClient
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating status:', error);
        alert('Gagal mengupdate status pesanan');
        return;
      }

      // Refresh orders
      await fetchOrders();
      alert('Status pesanan berhasil diupdate!');
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      
      // Use raw supabase client to avoid TypeScript issues
      const supabaseClient = supabase as any;
      const { error } = await supabaseClient
        .from('orders')
        .update({ 
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
        alert('Gagal mengupdate status pembayaran');
        return;
      }

      // Refresh orders
      await fetchOrders();
      alert('Status pembayaran berhasil diupdate!');
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu Pembayaran' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Sudah Dibayar' },
      processing: { color: 'bg-purple-100 text-purple-800', text: 'Diproses' },
      shipped: { color: 'bg-orange-100 text-orange-800', text: 'Dikirim' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Selesai' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Dibatalkan' }
    };
    
    const config = variants[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-gray-100 text-gray-800', text: 'Menunggu' },
      paid: { color: 'bg-green-100 text-green-800', text: 'Sudah Dibayar' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Gagal' },
      refunded: { color: 'bg-orange-100 text-orange-800', text: 'Dikembalikan' }
    };
    
    const config = variants[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Memuat pesanan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Kelola Pesanan</h1>
            <p className="text-muted-foreground">Kelola semua pesanan pelanggan</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor pesanan, nama pelanggan, atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                <SelectItem value="confirmed">Sudah Dibayar</SelectItem>
                <SelectItem value="processing">Diproses</SelectItem>
                <SelectItem value="shipped">Dikirim</SelectItem>
                <SelectItem value="delivered">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm || statusFilter !== 'all' ? 'Tidak ada pesanan yang cocok dengan filter' : 'Belum ada pesanan'}
              </p>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-6 space-y-4">
                  {/* Order Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{order.order_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.first_name} {order.customer?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
                      <p className="text-sm text-muted-foreground">{order.customer?.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(order.total_amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Items Pesanan:</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{item.product_name}</span>
                              {item.selected_size && (
                                <span className="text-muted-foreground ml-2">(Ukuran: {item.selected_size})</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span>{item.quantity}x {formatCurrency(item.unit_price)}</span>
                              <span className="ml-4 font-medium">
                                {formatCurrency(item.quantity * item.unit_price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Controls */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Status Pesanan:</label>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                            disabled={updatingOrder === order.id}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                              <SelectItem value="confirmed">Sudah Dibayar</SelectItem>
                              <SelectItem value="processing">Diproses</SelectItem>
                              <SelectItem value="shipped">Dikirim</SelectItem>
                              <SelectItem value="delivered">Selesai</SelectItem>
                              <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingOrder === order.id && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Status Pembayaran:</label>
                        <div className="flex items-center gap-2">
                          {getPaymentStatusBadge(order.payment_status)}
                          <Select 
                            value={order.payment_status} 
                            onValueChange={(value) => updatePaymentStatus(order.id, value)}
                            disabled={updatingOrder === order.id}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu</SelectItem>
                              <SelectItem value="paid">Sudah Dibayar</SelectItem>
                              <SelectItem value="failed">Gagal</SelectItem>
                              <SelectItem value="refunded">Dikembalikan</SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingOrder === order.id && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminOrders;
