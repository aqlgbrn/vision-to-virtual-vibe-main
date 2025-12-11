import { supabase } from '@/integrations/supabase/client';

export async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test orders table specifically
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('count').single();
    
    if (ordersError) {
      console.error('Orders table error:', ordersError);
      return { success: false, error: ordersError.message };
    }
    
    console.log('Orders table accessible:', ordersData);
    return { success: true, data: ordersData };
  } catch (err) {
    console.error('Connection test failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getSimpleOrders() {
  try {
    console.log('Fetching orders with items...');
    
    // Simple query dulu untuk test
    const { data: simpleData, error: simpleError } = await supabase
      .from('orders')
      .select('*')
      .limit(5);
    
    console.log('Simple orders data:', simpleData);
    console.log('Simple orders error:', simpleError);
    
    // Kalau simple query berhasil, baru coba yang complex
    if (simpleData && simpleData.length > 0) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          order_number, 
          status, 
          total_amount, 
          created_at,
          customer:customers (
            first_name,
            last_name
          ),
          order_items (
            product_name,
            quantity,
            unit_price
          )
        `)
        .limit(5);

      if (error) {
        console.error('Complex query error:', error);
        // Fallback ke simple data
        return { success: true, data: simpleData };
      }

      console.log('Complex orders fetched:', JSON.stringify(data, null, 2));
      return { success: true, data: data || [] };
    }
    
    return { success: true, data: simpleData || [] };
  } catch (err) {
    console.error('Orders fetch failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getSimpleStats() {
  try {
    console.log('Fetching basic stats...');
    
    const [ordersResult, productsResult, customersResult] = await Promise.all([
      supabase.from('orders').select('id').limit(1000),
      supabase.from('products').select('id').limit(1000),
      supabase.from('customers').select('id').limit(1000)
    ]);

    if (ordersResult.error) console.error('Orders error:', ordersResult.error);
    if (productsResult.error) console.error('Products error:', productsResult.error);
    if (customersResult.error) console.error('Customers error:', customersResult.error);

    const stats = {
      totalOrders: ordersResult.data?.length || 0,
      totalProducts: productsResult.data?.length || 0,
      totalCustomers: customersResult.data?.length || 0
    };

    console.log('Basic stats:', stats);
    return { success: true, data: stats };
  } catch (err) {
    console.error('Stats fetch failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
