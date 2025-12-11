import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Sparkles, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Chatbot from '@/components/Chatbot';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Anda telah logout.",
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat logout.",
        variant: "destructive",
      });
    }
  };

  // Fetch featured products dari database
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) throw error;
        if (data) setFeaturedProducts(data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Swipe navigation
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, Math.ceil(featuredProducts.length / 3)));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, Math.ceil(featuredProducts.length / 3))) % Math.max(1, Math.ceil(featuredProducts.length / 3)));
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Outfit
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/products">Produk</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>

      <main>{children}</main>
      
      {/* Featured Products Section */}
      <section className="py-16 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Produk Unggulan</h2>
            <p className="text-zinc-400">Koleksi terbaik untuk gaya Anda</p>
          </div>
          {/* Featured Products dengan Swipe */}
          <div className="relative">
            {featuredProducts.length > 0 ? (
              <>
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(featuredProducts.length / 3) }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredProducts.slice(slideIndex * 3, (slideIndex + 1) * 3).map((product) => (
                          <div key={product.id} className="bg-zinc-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
                            <div className="h-48 bg-zinc-700 flex items-center justify-center">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-zinc-500">No Image</span>
                              )}
                            </div>
                            <div className="p-6">
                              <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                              <p className="text-zinc-400 mb-4 line-clamp-2">{product.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-white">
                                  Rp {product.price.toLocaleString('id-ID')}
                                </span>
                                <Button asChild className="bg-zinc-700 hover:bg-zinc-600">
                                  <Link to={`/products/${product.id}`}>View</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation Buttons */}
                {Math.ceil(featuredProducts.length / 3) > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Dots Indicator */}
                {Math.ceil(featuredProducts.length / 3) > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: Math.ceil(featuredProducts.length / 3) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-primary' : 'bg-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-zinc-400">Belum ada produk tersedia</p>
              </div>
            )}
          </div>
          <div className="text-center mt-12">
            <Button asChild className="bg-zinc-700 hover:bg-zinc-600">
              <Link to="/products">Lihat Semua Produk</Link>
            </Button>
          </div>
        </div>
      </section>
      <Chatbot />

      <footer className="border-t border-zinc-800 bg-zinc-900/50 py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Outfit - Chatbot Rekomendasi Fashion
          </p>
        </div>
      </footer>
    </div>
  );
};
