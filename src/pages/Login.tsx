import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { BarChart, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isConfigured } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    if (!isConfigured) {
      // Demo mode - just navigate
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(from);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      throw new Error(error.message);
    }
    navigate(from);
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality - check your Supabase dashboard');
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Background with logo overlay */}
      <div className="absolute inset-0">
        {/* Logo as subtle background pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url('/lovable-uploads/a241716c-49eb-4ca9-9a4a-715d42266f19.png')`,
            backgroundSize: '300px',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            filter: 'blur(1px)',
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-glow" />
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-card to-background flex items-center justify-center p-3 ring-1 ring-border/50 shadow-2xl">
                <img 
                  src="/lovable-uploads/a241716c-49eb-4ca9-9a4a-715d42266f19.png" 
                  alt="20 Point" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">20 Point</h1>
            <BarChart className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Trade Journal
            <Sparkles className="w-4 h-4" />
          </p>
        </div>

        {/* Login card */}
        <div className="glass-card p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground text-sm">Sign in to access your trading dashboard</p>
          </div>

          <LoginForm
            onLogin={handleLogin}
            onForgotPassword={handleForgotPassword}
            onCreateAccount={handleCreateAccount}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground/50 text-xs mt-8">
          © 2026 20 Point Fund Managers. All rights reserved.
        </p>
      </div>
    </div>
  );
}
