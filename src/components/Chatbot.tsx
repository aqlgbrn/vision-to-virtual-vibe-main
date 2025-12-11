import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Send, Bot, User, Sparkles, X, ShoppingCart, Home, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  subcategory?: string;
  sizes: string[];
  colors: string[];
  images: string[];
  material?: string;
  stock: number;
  is_sale: boolean;
  occasion: string[];
  style: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  products?: Product[];
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAddToCart = async (productId: string) => {
    try {
      console.log('Adding to cart - Product ID:', productId);
      console.log('Session:', session);
      
      // Gunakan session langsung untuk cek login
      if (!session?.user) {
        console.error('No user session found');
        toast({
          title: "Gagal",
          description: "Anda harus login untuk menambahkan produk ke keranjang.",
          variant: "destructive",
        });
        return;
      }

      console.log('User ID:', session.user.id);

      // Cek apakah item sudah ada di keranjang
      const { data: existingItem, error: selectError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_id', productId)
        .maybeSingle();

      console.log('Existing item check:', { existingItem, selectError });

      if (selectError) {
        console.error('Error checking existing item:', selectError);
        throw selectError;
      }

      if (existingItem) {
        console.log('Updating existing item:', existingItem);
        // Jika sudah ada, update quantity
        const currentQuantity = (existingItem as any).quantity || 1;
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: currentQuantity + 1 })
          .eq('id', (existingItem as any).id);
          
        if (updateError) {
          console.error('Error updating cart:', updateError);
          throw updateError;
        }
        
        console.log('Successfully updated cart');
        toast({
          title: "Berhasil!",
          description: "Jumlah produk di keranjang telah diperbarui.",
        });
      } else {
        console.log('Inserting new item');
        // Jika belum ada, insert item baru
        const { data: insertData, error: insertError } = await supabase
          .from('cart_items')
          .insert({ 
            user_id: session.user.id, 
            product_id: productId, 
            quantity: 1 
          } as any)
          .select()
          .single();
        
        console.log('Insert result:', { insertData, insertError });
        
        if (insertError) {
          console.error('Error inserting to cart:', insertError);
          throw insertError;
        }
        
        console.log('Successfully added to cart');
        toast({
          title: "Berhasil!",
          description: "Produk telah ditambahkan ke keranjang.",
        });
      }

    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menambahkan produk.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked!');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Anda telah logout.",
      });
      
      // AuthContext akan otomatis mengupdate session
      navigate('/login');
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat logout.",
        variant: "destructive",
      });
    }
  };

  const getOutfitRecommendations = async (userInput: string): Promise<Product[]> => {
    try {
      const input = userInput.toLowerCase().trim();
      console.log('Mencari rekomendasi untuk:', input);

      // Daftar kata kunci dan kategori yang sesuai
      const keywordMap = [
        {
          keywords: ['party', 'pesta', 'malam', 'clubbing'],
          searchTerms: ['party', 'pesta', 'malam', 'clubbing', 'night'],
          maleCategories: ['Kemeja', 'Blazer', 'T-Shirt', 'Pants'],
          femaleCategories: ['Dress', 'Sepatu cewe']
        },
        {
          keywords: ['nongkrong', 'hangout', 'jalan', 'kumpul'],
          searchTerms: ['nongkrong', 'casual', 'hangout', 'jalan', 'santai'],
          maleCategories: ['T-Shirt', 'Pants', 'Sepatu cowo'],
          femaleCategories: ['Dress']
        },
        {
          keywords: ['date', 'kencan', 'romantis', 'makan malam'],
          searchTerms: ['date', 'kencan', 'romantis', 'dinner', 'malam'],
          maleCategories: ['Kemeja', 'Blazer', 'Pants'],
          femaleCategories: ['Dress']
        },
        {
          keywords: ['kerja', 'kantor', 'office', 'meeting'],
          searchTerms: ['kerja', 'kantor', 'office', 'formal', 'business'],
          maleCategories: ['Kemeja', 'Blazer', 'Pants'],
          femaleCategories: ['Dress']
        },
        {
          keywords: ['olahraga', 'sport', 'gym', 'lari', 'fitness'],
          searchTerms: ['olahraga', 'sport', 'gym', 'lari', 'fitness', 'workout'],
          maleCategories: ['T-Shirt', 'Pants'],
          femaleCategories: ['Dress']
        },
        {
          keywords: ['liburan', 'traveling', 'jalan-jalan', 'wisata'],
          searchTerms: ['liburan', 'travel', 'wisata', 'jalan-jalan', 'vacation'],
          maleCategories: ['T-Shirt', 'Pants'],
          femaleCategories: ['Dress']
        }
      ];

      // Deteksi gender dari input pengguna
      const isMale = input.includes('cowo') || input.includes('pria') || input.includes('laki') || input.includes('male');
      const isFemale = input.includes('cewe') || input.includes('wanita') || input.includes('perempuan') || input.includes('female');
      
      console.log('Deteksi gender - Male:', isMale, 'Female:', isFemale);

      // Cari kategori yang cocok berdasarkan input pengguna
      const matchedCategory = keywordMap.find(item => 
        item.keywords.some(keyword => input.includes(keyword))
      );

      console.log('Kategori yang cocok:', matchedCategory?.keywords[0] || 'Tidak ada');

      // Prioritaskan pencarian berdasarkan kategori dan gender yang cocok
      if (matchedCategory) {
        // Pilih kategori berdasarkan gender
        let targetCategories;
        if (isMale) {
          targetCategories = matchedCategory.maleCategories;
        } else if (isFemale) {
          targetCategories = matchedCategory.femaleCategories;
        } else {
          // Jika tidak spesifik gender, gunakan semua kategori
          targetCategories = [...matchedCategory.maleCategories, ...matchedCategory.femaleCategories];
        }
        
        console.log('Kategori target:', targetCategories);
        
        // Cari berdasarkan kategori dan kata kunci
        const { data: categoryResults, error: categoryError } = await supabase
          .from('products')
          .select('*')
          .in('category', targetCategories)
          .eq('is_active', true)
          .gt('stock', 0)
          .limit(5);

        if (!categoryError && categoryResults && categoryResults.length > 0) {
          console.log('Ditemukan produk dari kategori:', categoryResults);
          return categoryResults;
        }
      }

      // Jika tidak ada kategori yang cocok, cari berdasarkan nama dan deskripsi
      const searchTerms = matchedCategory 
        ? [...matchedCategory.searchTerms, ...input.split(' ')]
        : input.split(' ');

      // Hapus duplikat dan filter term yang terlalu pendek
      const uniqueTerms = [...new Set(searchTerms)].filter(term => term.length > 2);
      
      console.log('Mencari dengan istilah:', uniqueTerms);

      if (uniqueTerms.length > 0) {
        const orConditions = uniqueTerms.flatMap(term => [
          `name.ilike.%${term}%`,
          `description.ilike.%${term}%`,
          `category.ilike.%${term}%`,
          `style.ilike.%${term}%`
        ]).join(',');

        const { data: searchResults, error: searchError } = await supabase
          .from('products')
          .select('*')
          .or(orConditions)
          .eq('is_active', true)
          .gt('stock', 0)
          .limit(5);

        if (searchError) {
          console.error('Supabase search error:', searchError);
        }

        if (searchResults && searchResults.length > 0) {
          console.log('Ditemukan produk dari pencarian:', searchResults);
          return searchResults;
        }
      }

      // Jika tidak ada hasil, coba cari produk dengan stok tersedia
      console.log('Mencari produk dengan stok tersedia...');
      const { data: inStockProducts, error: stockError } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .eq('is_active', true)
        .limit(5);

      if (!stockError && inStockProducts && inStockProducts.length > 0) {
        console.log('Menampilkan produk dengan stok tersedia:', inStockProducts);
        return inStockProducts;
      }

      console.log('Tidak ada produk yang ditemukan');
      return [];

    } catch (error) {
      console.error('Kesalahan saat mencari rekomendasi:', error);
      return [];
    }
  };

  const generateBotResponse = (userInput: string, products: Product[]): string => {
    const input = userInput.toLowerCase().trim();
    const isMale = input.includes('cowo') || input.includes('pria') || input.includes('laki') || input.includes('male');
    const isFemale = input.includes('cewe') || input.includes('wanita') || input.includes('perempuan') || input.includes('female');
    
    if (products.length === 0) {
      const fallbackMessages = [
        `Maaf, saya tidak menemukan outfit yang cocok untuk "${userInput}". Mungkin Anda bisa coba kata kunci lain?`,
        `Hmm, sepertinya saya belum punya rekomendasi untuk "${userInput}". Coba deskripsikan acaramu dengan lebih spesifik.`,
        `Untuk saat ini, saya belum menemukan yang pas untuk "${userInput}". Bagaimana kalau mencari untuk acara lain?`
      ];
      return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }

    // Response berdasarkan gender
    let responses;
    if (isMale) {
      responses = [
        `Tentu! Berikut rekomendasi outfit keren untuk "${userInput}" khusus untuk pria:`,
        `Saya punya beberapa pilihan outfit stylish untuk "${userInput}" buat cowok:`,
        `Ini dia beberapa pilihan terbaik untuk "${userInput}" yang maskulin dan trendy:`,
        `Oke, untuk "${userInput}", saya sarankan beberapa outfit berikut khusus untuk Anda:`
      ];
    } else if (isFemale) {
      responses = [
        `Tentu! Berikut rekomendasi outfit cantik untuk "${userInput}" khusus untuk wanita:`,
        `Saya punya beberapa pilihan outfit elegan untuk "${userInput}" buat cewek:`,
        `Ini dia beberapa pilihan terbaik untuk "${userInput}" yang feminin dan fashionable:`,
        `Oke, untuk "${userInput}", saya sarankan beberapa outfit berikut khusus untuk Anda:`
      ];
    } else {
      responses = [
        `Tentu! Berikut rekomendasi outfit yang pas untuk "${input}":`,
        `Saya punya beberapa pilihan outfit keren untuk "${input}":`,
        `Ini dia beberapa pilihan terbaik untuk "${input}". Semoga suka!`,
        `Oke, untuk "${input}", saya sarankan beberapa outfit berikut:`
      ];
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const products = await getOutfitRecommendations(input);
      const botResponse = generateBotResponse(input, products);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        products,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw]">
      <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
        <CardHeader className="bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-zinc-300" />
                AI Fashion Assistant
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-zinc-400 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-sm">Hai! Saya AI Fashion Assistant Anda.</p>
                <p className="text-xs mt-2">Tanya saya tentang outfit untuk:</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  <Badge className="bg-zinc-800 text-zinc-200 text-xs border-zinc-700">nongkrong</Badge>
                  <Badge className="bg-zinc-800 text-zinc-200 text-xs border-zinc-700">party</Badge>
                  <Badge className="bg-zinc-800 text-zinc-200 text-xs border-zinc-700">kerja</Badge>
                  <Badge className="bg-zinc-800 text-zinc-200 text-xs border-zinc-700">date</Badge>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-zinc-300" />
                      </div>
                    )}
                    <div className={`p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-800 text-zinc-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      {message.products && message.products.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.products.map((product) => (
                            <div key={product.id} className="bg-zinc-700/50 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-zinc-600 rounded flex items-center justify-center">
                                  {product.images && product.images.length > 0 ? (
                                    <img 
                                      src={product.images[0]} 
                                      alt={product.name}
                                      className="w-full h-full object-cover rounded"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const placeholder = target.nextElementSibling as HTMLElement;
                                        if (placeholder) placeholder.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <span className="text-xs text-zinc-400 hidden">Img</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{product.name}</p>
                                  <p className="text-xs text-zinc-400">Rp {product.price.toLocaleString()}</p>
                                  <div className="flex gap-1 mt-1">
                                    <Badge className="bg-zinc-600 text-zinc-200 text-xs border-zinc-500">
                                      {product.category}
                                    </Badge>
                                    <Badge className="bg-zinc-600 text-zinc-200 text-xs border-zinc-500">
                                      {product.style}
                                    </Badge>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-zinc-400 hover:text-white hover:bg-zinc-600"
                                  onClick={() => navigate(`/products/${product.id}`)}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="mt-3 pt-2 border-t border-zinc-600">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/')}
                              className="w-full bg-zinc-700/50 border-zinc-600 text-zinc-300 hover:bg-zinc-600 hover:text-white"
                            >
                              <Home className="w-4 h-4 mr-2" />
                              Kembali ke Beranda
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-zinc-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div className="bg-zinc-800 text-zinc-200 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tanya tentang outfit..."
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}