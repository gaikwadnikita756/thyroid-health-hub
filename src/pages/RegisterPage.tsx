import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: 'Weak password', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error, role: signedRole } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account created!' });
      if (signedRole === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Join ThyroSmart</h1>
          <p className="text-white/80 text-lg max-w-xs">Track your thyroid health, upload reports, and get AI-powered insights.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {['AI Risk Screening', 'Lab Report Tracking', 'Doctor Consultations', 'Health Timeline'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">ThyroSmart</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Create account</h2>
          <p className="text-muted-foreground mb-8">Start your thyroid health journey today.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="mb-2 block font-medium">I am registering as</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as 'patient' | 'doctor')} className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${role === 'patient' ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'}`}>
                  <RadioGroupItem value="patient" id="patient" />
                  <div>
                    <div className="font-semibold text-sm">🧑‍⚕️ Patient</div>
                    <div className="text-xs text-muted-foreground">Track health & get screened</div>
                  </div>
                </label>
                <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${role === 'doctor' ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'}`}>
                  <RadioGroupItem value="doctor" id="doctor" />
                  <div>
                    <div className="font-semibold text-sm">👨‍⚕️ Doctor</div>
                    <div className="text-xs text-muted-foreground">Manage patients & reports</div>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="fullName" className="mb-2 block font-medium">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Jane Smith" required />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password" className="mb-2 block font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className="pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating account...</> : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            <Link to="/" className="hover:underline">← Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
