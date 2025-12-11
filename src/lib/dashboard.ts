import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  product_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface TopProduct {
  id: string;
  name: string;
  total_sales: number;
  total_revenue: number;
  sku: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get current month revenue
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    
    const lastMonthStart = new Date(currentMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(currentMonthStart);
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    // Current month revenue
    const { data: currentRevenue, error: currentRevenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', currentMonthStart.toISOString());

    // Last month revenue
    const { data: lastRevenue, error: lastRevenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());

    // Total orders (current month)
    const { data: currentOrders, error: currentOrdersError } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', currentMonthStart.toISOString());

    // Last month orders
    const { data: lastOrders, error: lastOrdersError } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());

    // Total products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('status', 'active');

    // Products from last month
    const { data: lastMonthProducts, error: lastMonthProductsError } = await supabase
      .from('products')
      .select('id')
      .eq('status', 'active')
      .lt('created_at', currentMonthStart.toISOString());

    // Total customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, created_at');

    // Customers from last month
    const { data: lastMonthCustomers, error: lastMonthCustomersError } = await supabase
      .from('customers')
      .select('id')
      .lt('created_at', currentMonthStart.toISOString());

    if (currentRevenueError || lastRevenueError || currentOrdersError || lastOrdersError || 
        productsError || lastMonthProductsError || customersError || lastMonthCustomersError) {
      throw new Error('Error fetching dashboard stats');
    }

    const currentRevenueTotal = currentRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const lastRevenueTotal = lastRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const currentOrdersCount = currentOrders?.length || 0;
    const lastOrdersCount = lastOrders?.length || 0;
    const currentProductsCount = products?.length || 0;
    const lastProductsCount = lastMonthProducts?.length || 0;
    const currentCustomersCount = customers?.length || 0;
    const lastCustomersCount = lastMonthCustomers?.length || 0;

    // Calculate percentage changes
    const revenueChange = lastRevenueTotal > 0 
      ? ((currentRevenueTotal - lastRevenueTotal) / lastRevenueTotal) * 100 
      : (currentRevenueTotal > 0 ? 100 : 0);
    
    const ordersChange = lastOrdersCount > 0 
      ? ((currentOrdersCount - lastOrdersCount) / lastOrdersCount) * 100 
      : (currentOrdersCount > 0 ? 100 : 0);
    
    const productsChange = lastProductsCount > 0 
      ? ((currentProductsCount - lastProductsCount) / lastProductsCount) * 100 
      : (currentProductsCount > 0 ? 100 : 0);
    
    const customersChange = lastCustomersCount > 0 
      ? ((currentCustomersCount - lastCustomersCount) / lastCustomersCount) * 100 
      : (currentCustomersCount > 0 ? 100 : 0);

    return {
      totalRevenue: currentRevenueTotal,
      totalOrders: currentOrdersCount,
      totalProducts: currentProductsCount,
      totalCustomers: currentCustomersCount,
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      ordersChange: parseFloat(ordersChange.toFixed(1)),
      productsChange: parseFloat(productsChange.toFixed(1)),
      customersChange: parseFloat(customersChange.toFixed(1))
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// Get recent orders
export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        customer:customers (
          first_name,
          last_name,
          email
        ),
        order_items (
          product_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer: order.customer || { first_name: 'Unknown', last_name: 'Customer', email: '' },
      product_name: order.order_items?.[0]?.product_name || 'Multiple items',
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at
    })) || [];
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
}

// Get top selling products
export async function getTopProducts(limit: number = 4): Promise<TopProduct[]> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price,
        orders!inner (
          payment_status,
          created_at
        ),
        product:products (
          id,
          name,
          sku
        )
      `)
      .eq('orders.payment_status', 'paid')
      .order('orders.created_at', { ascending: false });

    if (error) throw error;

    // Aggregate sales by product
    const productSales = new Map<string, {
      id: string;
      name: string;
      sku: string;
      total_sales: number;
      total_revenue: number;
    }>();

    data?.forEach(item => {
      const productId = item.product_id;
      const existing = productSales.get(productId);
      
      if (existing) {
        existing.total_sales += item.quantity;
        existing.total_revenue += item.total_price;
      } else {
        productSales.set(productId, {
          id: item.product?.id || productId,
          name: item.product_name,
          sku: item.product?.sku || '',
          total_sales: item.quantity,
          total_revenue: item.total_price
        });
      }
    });

    // Sort by total revenue and return top products
    return Array.from(productSales.values())
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
}

// Get all dashboard data
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [stats, recentOrders, topProducts] = await Promise.all([
      getDashboardStats(),
      getRecentOrders(5),
      getTopProducts(4)
    ]);

    return {
      stats,
      recentOrders,
      topProducts
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
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

// Format status
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Menunggu',
    'confirmed': 'Dikonfirmasi',
    'processing': 'Diproses',
    'shipped': 'Dikirim',
    'delivered': 'Selesai',
    'cancelled': 'Dibatalkan',
    'refunded': 'Dikembalikan'
  };
  return statusMap[status] || status;
}

// Get status color
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-yellow-100 text-yellow-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'refunded': 'bg-red-100 text-red-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
