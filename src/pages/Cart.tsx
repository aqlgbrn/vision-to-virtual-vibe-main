import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  selected_size?: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    sizes: string[];
  };
}

function Cart() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart items from Supabase
  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const fetchCartItems = async () => {
      console.log('Fetching cart items for user:', session.user.id);
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('user_id', session.user.id);

        console.log('Raw cart data from database:', data);

        if (error) {
          console.error('Error fetching cart items:', error);
          toast({
            title: "Error",
            description: "Gagal memuat keranjang belanja",
            variant: "destructive"
          });
        } else {
          // Check for duplicates
          const productIds = data?.map((item: CartItem) => item.product_id) || [];
          const uniqueProductIds = [...new Set(productIds)];
          console.log('Product IDs:', productIds);
          console.log('Unique Product IDs:', uniqueProductIds);
          
          if (productIds.length !== uniqueProductIds.length) {
            console.warn('DUPLICATE ITEMS DETECTED!');
          }
          
          setCartItems(data || []);
          console.log('Final cart items state:', data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [session, toast]);

  const updateQuantity = async (id: string, delta: number) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          user_id: session?.user.id
        })
        .eq('id', id)
        .eq('user_id', session?.user.id)
        .select();

      if (error) {
        console.error('Error updating quantity:', error);
        toast({
          title: "Error",
          description: "Gagal memperbarui jumlah",
          variant: "destructive"
        });
      } else {
        setCartItems((items) =>
          items.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const removeItem = async (id: string) => {
    console.log('=== REMOVE ITEM START ===');
    console.log('Removing item with ID:', id);
    console.log('Current cart items before delete:', cartItems);
    
    try {
      const { data: deleteData, error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', session?.user.id)
        .select(); // Return deleted data

      console.log('Delete operation result:', { deleteData, error });

      if (error) {
        console.error('Error removing item:', error);
        toast({
          title: "Error",
          description: "Gagal menghapus item",
          variant: "destructive"
        });
      } else {
        console.log('Item successfully deleted from database');
        console.log('Deleted data:', deleteData);
        
        // Update local state immediately
        const updatedItems = cartItems.filter((item) => item.id !== id);
        console.log('Updated items (local):', updatedItems);
        setCartItems(updatedItems);
        
        toast({
          title: "Berhasil",
          description: "Item dihapus dari keranjang"
        });
        
        // Verify deletion by re-fetching from database
        setTimeout(() => {
          console.log('=== VERIFYING DELETION ===');
          const verifyDeletion = async () => {
            try {
              const { data: currentData, error: fetchError } = await supabase
                .from('cart_items')
                .select(`
                  *,
                  product:products(*)
                `)
                .eq('user_id', session?.user.id);

              if (!fetchError) {
                console.log('Database state after delete:', currentData);
                console.log('Item still exists?', currentData?.some((item: CartItem) => item.id === id));
                setCartItems(currentData || []);
              } else {
                console.error('Error verifying deletion:', fetchError);
              }
            } catch (error) {
              console.error('Error verifying deletion:', error);
            }
          };
          verifyDeletion();
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
    console.log('=== REMOVE ITEM END ===');
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = 10;
  const total = subtotal + shipping;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">
          Keranjang Belanja
        </h1>

        {loading ? (
          <Card className="p-12 text-center animate-scale-in">
            <p className="text-muted-foreground mb-4">Memuat keranjang...</p>
          </Card>
        ) : cartItems.length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <p className="text-muted-foreground mb-4">Keranjang Anda kosong</p>
            <Button onClick={() => navigate("/products")}>
              Mulai Belanja
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.product?.name || 'Unknown Product'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.product?.category || 'Uncategorized'}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selected_size && (
                              <Badge variant="secondary" className="text-xs">
                                Size: {item.selected_size}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xl font-bold text-primary">
                          Rp {(item.product?.price || 0) * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 animate-scale-in">
                <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">Rp {subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pengiriman</span>
                    <span className="font-medium">Rp {shipping}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    Rp {total}
                  </span>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-12 mb-3"
                  onClick={() => {
                    // Navigate with state to force refresh
                    navigate("/checkout", { state: { refresh: Date.now() } });
                  }}
                >
                  Checkout
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => navigate("/products")}
                >
                  Lanjut Belanja
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Cart;
