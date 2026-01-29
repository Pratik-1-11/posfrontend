import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Lock, User, Eye, EyeOff, Globe, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";


export const LoginScreen = () => {
  const [email, setEmail] = useState("admin@pos.com");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email || !password) throw new Error("Please fill in all fields");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error("Please enter a valid email address");

      const user = await login(email, password);
      const role = user.role?.toLowerCase();

      if (role === 'super_admin' || role === 'super-admin') {
        navigate("/admin");
      } else if (['admin', 'manager', 'vendor_admin', 'branch_admin', 'vendor_manager', 'inventory_manager'].includes(role)) {
        navigate("/dashboard");
      } else {
        navigate("/pos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-8">
        {/* Language Selector */}
        <div className="flex justify-end">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[130px] h-9 bg-white/5 border-white/10 text-white font-bold hover:bg-white/10 transition-colors">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ne">Nepali</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-none bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/20">
          <CardHeader className="text-center space-y-4 pb-2 pt-10">
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transform -rotate-6 hover:rotate-0 transition-transform duration-300 cursor-default">
              <Sparkles className="text-white h-8 w-8" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-white tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Securely access your POS dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-bold ml-1">Email Address</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-black/20 border-white/10 text-white placeholder:text-slate-600 font-semibold focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-slate-300 font-bold">Password</Label>
                    <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">Forgot?</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 bg-black/20 border-white/10 text-white placeholder:text-slate-600 font-semibold focus:ring-blue-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home Page
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs font-bold tracking-widest uppercase">
          &copy; 2025 Vishma POS &bull; All Rights Reserved
        </p>
      </div>
    </div>
  );
};
