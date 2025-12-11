import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Mail, Lock, Eye, EyeOff, Github, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<"user" | "admin">("user");
  const navigate = useNavigate();
  const { session } = useAuth();

  // Simple admin password check
  const ADMIN_PASSWORD = "admin123";

  useEffect(() => {
    if (session && loginType === "user") {
      navigate('/');
    }
  }, [session, navigate, loginType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginType === "admin") {
      // Admin login logic
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("adminAuthenticated", "true");
        toast.success("Login admin berhasil!");
        // Force reload to ensure localStorage is read
        window.location.href = "/admin";
        return;
      } else {
        toast.error("Password admin salah!");
      }
      return;
    }
    
    // User login logic
    if (!email || !password) {
      toast.error("Mohon isi semua field");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Login berhasil!");
      // Navigasi akan ditangani oleh useEffect
    } catch (error: any) {
      toast.error(error.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                loginType === "admin" 
                  ? "bg-gradient-to-r from-red-600 to-orange-500" 
                  : "bg-gradient-to-r from-purple-600 to-blue-500"
              }`}>
                {loginType === "admin" ? (
                  <Shield className="h-8 w-8 text-white" />
                ) : (
                  <Sparkles className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              {loginType === "admin" ? "Login Admin" : "Selamat Datang Kembali"}
            </h1>
            <p className="text-zinc-400">
              {loginType === "admin" 
                ? "Masuk sebagai admin untuk mengelola toko" 
                : "Masuk untuk melanjutkan ke akun Anda"
              }
            </p>
          </div>

          {/* Login Type Toggle */}
          <div className="flex bg-zinc-800 rounded-lg p-1">
            <Button
              type="button"
              variant={loginType === "user" ? "default" : "ghost"}
              className={`flex-1 ${
                loginType === "user" 
                  ? "bg-purple-600 text-white" 
                  : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => setLoginType("user")}
            >
              Pengguna
            </Button>
            <Button
              type="button"
              variant={loginType === "admin" ? "default" : "ghost"}
              className={`flex-1 ${
                loginType === "admin" 
                  ? "bg-red-600 text-white" 
                  : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => setLoginType("admin")}
            >
              Admin
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginType === "user" && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-500" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                {loginType === "user" && (
                  <Button 
                    variant="link" 
                    className="text-xs p-0 h-auto text-zinc-400 hover:text-purple-400"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Lupa password?
                  </Button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={loginType === "admin" ? "Password admin" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-zinc-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>

            {loginType === "user" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-zinc-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal text-zinc-400 cursor-pointer">
                    Ingat saya
                  </Label>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full h-12 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                loginType === "admin"
                  ? "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
                  : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              } text-white`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                <span>{loginType === "admin" ? "Masuk Admin" : "Masuk"}</span>
              )}
            </Button>
          </form>

          {loginType === "user" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-zinc-900/80 text-zinc-500">Atau lanjutkan dengan</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12 border-zinc-700 text-white hover:bg-zinc-800/50 hover:text-white"
                  onClick={() => {
                    // Tambahkan logika login dengan Google di sini
                    toast.info("Fitur login dengan Google akan segera hadir!");
                  }}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="currentColor"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="currentColor"
                    />
                  </svg>
                  Lanjutkan dengan Google
                </Button>
              </div>
            </>
          )}

          {loginType === "user" && (
            <div className="text-center text-sm pt-2">
              <span className="text-zinc-500">Belum punya akun? </span>
              <Link 
                to="/register" 
                className="font-medium text-purple-400 hover:underline"
              >
                Daftar Sekarang
              </Link>
            </div>
          )}

          {loginType === "admin" && (
            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500">
                Demo: Gunakan password <code className="bg-zinc-800 px-2 py-1 rounded">admin123</code>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500">
            {new Date().getFullYear()} Outfit. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
