import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { friendlyAuthError } from "@/lib/authErrors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, CheckCircle } from "lucide-react";

/**
 * Reset password page. Supabase redirects users here after they click the
 * reset email. The recovery token in the URL hash is consumed automatically
 * by the Supabase client (detectSessionInUrl: true) so we can immediately
 * call updateUser() to set a new password.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError("The app isn't connected to a backend yet.");
      return;
    }
    // Wait until the recovery session is established.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(friendlyAuthError(error.message));
    setDone(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md glass-card p-8">
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Set a new password</h2>
        <p className="text-muted-foreground text-sm text-center mb-6">
          Choose something secure you'll remember.
        </p>

        {done ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-profit/20">
              <CheckCircle className="w-7 h-7 text-profit" />
            </div>
            <p className="text-muted-foreground text-sm">Password updated. Redirecting to sign in…</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="pw">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="pw" type="password" className="pl-10 h-11"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || !ready}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm" type="password" className="pl-10 h-11"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading || !ready}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading || !ready} className="w-full h-11">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
            </Button>
            {!ready && !error && (
              <p className="text-xs text-muted-foreground text-center">
                Verifying your reset link…
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
