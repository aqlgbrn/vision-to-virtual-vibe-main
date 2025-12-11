# Dashboard Setup Guide for Supabase Integration

## Overview
This guide will help you set up the admin dashboard with real Supabase data integration. The dashboard now connects to your Supabase database to display real-time statistics, recent orders, and top-selling products.

## Prerequisites
- Supabase project already created
- Node.js and npm installed
- Existing React application with Supabase client configured

## Step 1: Database Setup

### 1.1 Create Tables
Run the following SQL files in your Supabase SQL Editor:

1. **Schema Creation**: `supabase/migrations/20240101000001_dashboard_schema.sql`
2. **Sample Data**: `supabase/migrations/20240101000002_sample_data.sql`

### 1.2 Tables Created
- `categories` - Product categories
- `products` - Product information
- `product_variants` - Product variants (sizes/colors)
- `customers` - Customer information
- `orders` - Order data
- `order_items` - Individual order items

### 1.3 Enable Row Level Security (RLS)
The schema includes RLS policies for security. Make sure to:
1. Enable RLS on all tables
2. Configure proper admin role checking
3. Set up authentication policies

## Step 2: Environment Configuration

Your `.env` file should contain:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
```

## Step 3: Running the Application

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Start Development Server
```bash
npm run dev
```

### 3.3 Access Dashboard
Navigate to `http://localhost:5173/admin` (or your dev server URL)

## Features Implemented

### Real-Time Data
- **Statistics**: Revenue, orders, products, customers with month-over-month changes
- **Recent Orders**: Latest 5 orders with customer and product details
- **Top Products**: Best-selling products by revenue
- **Auto-refresh**: Data refreshes every 30 seconds

### Interactive Elements
- **Navigation**: Quick actions link to relevant admin pages
- **Status Indicators**: Color-coded order statuses
- **Currency Formatting**: Indonesian Rupiah (IDR) formatting
- **Loading States**: Proper loading and error handling

## API Endpoints Used

### Dashboard Statistics
```typescript
GET /dashboard/stats
- Current month revenue
- Previous month comparison
- Total orders, products, customers
- Percentage changes
```

### Recent Orders
```typescript
GET /dashboard/recent-orders
- Latest 5 orders
- Customer information
- Product details
- Order status
```

### Top Products
```typescript
GET /dashboard/top-products
- Top 4 selling products
- Total sales quantity
- Total revenue per product
```

## Database Schema Details

### Orders Table
```sql
orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR UNIQUE,
  customer_id UUID REFERENCES customers,
  status VARCHAR (pending/confirmed/processing/shipped/delivered/cancelled),
  payment_status VARCHAR (pending/paid/failed/refunded),
  total_amount DECIMAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Products Table
```sql
products (
  id UUID PRIMARY KEY,
  name VARCHAR,
  slug VARCHAR UNIQUE,
  price DECIMAL,
  category_id UUID REFERENCES categories,
  status VARCHAR (active/draft/archived),
  quantity INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Supabase project allows your development domain
2. **RLS Policies**: Check that Row Level Security policies are properly configured
3. **Authentication**: Ensure admin users have proper role assignments
4. **Data Not Loading**: Check browser console for specific error messages

### Debug Mode
Add console logging to debug:
```typescript
// In src/lib/dashboard.ts
console.log('Dashboard data:', data);
console.log('Error:', error);
```

## Customization

### Adding New Metrics
1. Update `DashboardStats` interface in `src/lib/dashboard.ts`
2. Add new query in `getDashboardStats()` function
3. Update the UI in `AdminDashboard.tsx`

### Changing Refresh Interval
```typescript
// In AdminDashboard.tsx
const interval = setInterval(fetchDashboardData, 30000); // 30 seconds
```

### Custom Status Colors
```typescript
// In src/lib/dashboard.ts
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'your_status': 'bg-your-color text-your-text-color'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
```

## Production Deployment

### Environment Variables
Make sure to set production environment variables:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-production-key"
```

### Build and Deploy
```bash
npm run build
# Deploy to your hosting provider
```

## Security Considerations

1. **Admin Authentication**: Implement proper admin role checking
2. **API Keys**: Never expose service role keys in frontend
3. **RLS Policies**: Ensure strict Row Level Security policies
4. **Input Validation**: Validate all user inputs on both client and server

## Performance Optimization

1. **Database Indexes**: Ensure proper indexes on frequently queried columns
2. **Query Optimization**: Use specific selects instead of `select('*')`
3. **Caching**: Implement caching for frequently accessed data
4. **Pagination**: Add pagination for large datasets

## Support

For issues related to:
- **Supabase**: Check Supabase documentation
- **React/TypeScript**: Check official documentation
- **UI Components**: Check shadcn/ui documentation

## Next Steps

1. **Add Charts**: Implement revenue and sales trend charts
2. **Export Features**: Add CSV/PDF export for reports
3. **Email Notifications**: Set up email alerts for new orders
4. **Advanced Filtering**: Add date range and status filters
5. **Mobile Responsiveness**: Optimize for mobile devices
