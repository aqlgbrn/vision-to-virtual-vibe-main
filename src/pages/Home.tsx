import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  is_sale: boolean;
  style: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(6)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    // TODO: Implement add to cart logic
    console.log('Added to cart:', productId);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/background.png"
            alt="Fashion Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 to-zinc-950/60" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 max-w-2xl">
            Selamat Datang di{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Outfit
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mb-6">
            Dapatkan rekomendasi outfit terbaik dengan AI chatbot kami
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="h-12 px-8">
              Mulai Belanja
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8">
              Lihat Koleksi
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl font-bold mb-4">Produk Unggulan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Koleksi terbaik kami yang sedang trending
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                      <span className="text-zinc-500">No Image</span>
                    </div>
                  )}
                  {product.is_sale && (
                    <Badge className="absolute top-4 left-4 bg-red-500">
                      Sale
                    </Badge>
                  )}
                  <div className="absolute top-4 right-4 flex gap-1">
                    <div className="flex items-center bg-black/50 text-white px-2 py-1 rounded text-xs">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                      4.5
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.sizes && product.sizes.slice(0, 3).map((size) => (
                      <Badge key={size} variant="secondary" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                    {product.sizes && product.sizes.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{product.sizes.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-primary">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}`);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Lihat Detail & Pilih Size
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" onClick={() => navigate('/products')}>
            Lihat Semua Produk
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Belanja Mudah</h3>
              <p className="text-muted-foreground">
                Proses checkout yang cepat dan aman
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kualitas Terjamin</h3>
              <p className="text-muted-foreground">
                Produk pilihan dengan kualitas terbaik
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Rekomendasi</h3>
              <p className="text-muted-foreground">
                Dapatkan outfit yang sempurna untuk Anda
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
