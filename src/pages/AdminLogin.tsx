import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Lock, ShieldCheck, Eye, EyeOff, Globe, ArrowLeft, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden p-4">
      {/* Premium Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[150px] rounded-full" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-bold group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[120px] h-8 bg-white/5 border-white/10 text-xs font-black text-slate-300">
              <Globe className="h-3 w-3 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-white/10 text-white">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ne">Nepali</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-none bg-white/[0.03] backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
          <CardHeader className="text-center pt-12 pb-4 space-y-4">
            <div className="mx-auto w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center ring-1 ring-white/10 shadow-2xl">
              <ShieldCheck className="text-blue-500 h-10 w-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-white tracking-tight uppercase">Terminal Access</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Administrative Protocol Required</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-10 pb-12 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-black uppercase tracking-wider flex items-center gap-3 animate-in slide-in-from-top-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest ml-1">Admin Email</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 transition-colors group-focus-within:text-blue-500">
                      <Key size={18} />
                    </div>
                    <Input
                      type="email"
                      placeholder="admin@terminal.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 pl-12 bg-white/[0.02] border-white/5 text-white placeholder:text-slate-700 font-bold focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Access Key</Label>
                    <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-slate-600 hover:text-blue-400 uppercase tracking-tighter">Emergency Recovery</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 transition-colors group-focus-within:text-blue-500" size={18} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-12 bg-white/[0.02] border-white/5 text-white placeholder:text-slate-700 font-bold focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    "Initialize Session"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
