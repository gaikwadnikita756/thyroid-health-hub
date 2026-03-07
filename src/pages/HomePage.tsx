import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, Brain, FlaskConical, Heart, Shield,
  TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Stethoscope, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import heroImg from '@/assets/hero-bg.png';

const ECGLine: React.FC = () => (
  <svg className="w-full h-16 opacity-30" viewBox="0 0 400 60" fill="none">
    <path
      className="ecg-path"
      d="M0,30 L60,30 L75,30 L80,10 L85,50 L90,20 L95,40 L100,30 L160,30 L175,30 L180,5 L185,55 L190,15 L195,45 L200,30 L260,30 L275,30 L280,8 L285,52 L290,18 L295,42 L300,30 L360,30 L375,30 L380,10 L385,50 L390,20 L395,40 L400,30"
      stroke="hsl(200 94% 70%)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const OverviewCard: React.FC<{
  title: string; color: string; bgColor: string; icon: React.ReactNode; description: string; tag: string;
}> = ({ title, color, bgColor, icon, description, tag }) => (
  <div className="medical-card group cursor-default">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bgColor}`}>
      {icon}
    </div>
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color} mb-3 inline-block`}>{tag}</span>
    <h3 className="font-display font-bold text-foreground text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

const StepCard: React.FC<{ step: number; title: string; icon: React.ReactNode; color: string }> = ({ step, title, icon, color }) => (
  <div className="flex flex-col items-center text-center">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-md ${color}`}>
      {icon}
    </div>
    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mb-2">
      {step}
    </div>
    <p className="text-sm font-semibold text-foreground">{title}</p>
  </div>
);

const statItems = [
  { value: '200M+', label: 'People affected worldwide', icon: '🌍' },
  { value: '60%', label: 'Cases go undiagnosed', icon: '⚠️' },
  { value: '5-8x', label: 'More common in women', icon: '👩‍⚕️' },
  { value: 'Treatable', label: 'With early detection', icon: '✅' },
];

const HomePage: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Medical consultation" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 hero-gradient opacity-90" />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <ECGLine />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/90 mb-6 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                AI-Powered Thyroid Health Platform
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Thyroid Detection
                <br />
                <span className="text-blue-200">&amp; Diagnosis</span>
              </h1>
              <p className="text-white/85 text-xl mb-8 leading-relaxed max-w-xl">
                Early detection saves lives. Use AI-powered risk screening, access educational resources, and connect with healthcare professionals — all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/ai-screening">
                  <Button size="lg" className="gap-2 bg-white text-primary-dark font-bold hover:bg-white/90 shadow-hero">
                    <Brain className="w-5 h-5" />
                    Check Symptoms with AI
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/tests">
                  <Button size="lg" variant="outline" className="gap-2 border-white/50 text-white hover:bg-white/10">
                    <FlaskConical className="w-4 h-4" />
                    Learn About Tests
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map((s) => (
              <div key={s.label} className="text-center text-primary-foreground">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-display font-bold text-2xl">{s.value}</div>
                <div className="text-xs opacity-80 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview cards */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Understanding Thyroid Conditions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            The thyroid gland affects nearly every organ in your body. Learn about the four main conditions.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewCard
            title="Hypothyroidism"
            tag="Underactive"
            color="badge-hypo"
            bgColor="bg-accent"
            icon={<TrendingDown className="w-6 h-6 text-primary" />}
            description="The thyroid doesn't produce enough hormones, slowing down body functions. Symptoms include fatigue, weight gain, and feeling cold."
          />
          <OverviewCard
            title="Hyperthyroidism"
            tag="Overactive"
            color="badge-hyper"
            bgColor="bg-warning/10"
            icon={<TrendingUp className="w-6 h-6 text-warning" />}
            description="The thyroid produces too many hormones, speeding up metabolism. Symptoms include weight loss, anxiety, and rapid heartbeat."
          />
          <OverviewCard
            title="Thyroid Nodules"
            tag="Growths"
            color="badge-normal"
            bgColor="bg-secondary/10"
            icon={<AlertCircle className="w-6 h-6 text-secondary" />}
            description="Lumps that form in the thyroid gland. Most are benign, but some can affect hormone production or require medical attention."
          />
          <OverviewCard
            title="Thyroid Cancer"
            tag="Serious"
            color="text-destructive bg-destructive/10 text-xs font-semibold px-2.5 py-1 rounded-full"
            bgColor="bg-destructive/10"
            icon={<Shield className="w-6 h-6 text-destructive" />}
            description="Highly treatable when caught early. Regular screening and attention to neck swelling can lead to early diagnosis."
          />
        </div>
      </section>

      {/* Process flow */}
      <section className="py-16 bg-gradient-blue-soft">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">Your Path to Diagnosis</h2>
            <p className="text-muted-foreground">A simple process to understand and address thyroid concerns</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
              <div className="absolute top-8 left-1/4 right-1/4 h-0.5 bg-primary/20 hidden md:block" />
              <StepCard step={1} title="Notice Symptoms" icon={<Eye className="w-7 h-7 text-white" />} color="bg-primary" />
              <StepCard step={2} title="Get Tested" icon={<FlaskConical className="w-7 h-7 text-white" />} color="bg-secondary" />
              <StepCard step={3} title="Consult Doctor" icon={<Stethoscope className="w-7 h-7 text-white" />} color="bg-primary" />
              <StepCard step={4} title="Ongoing Monitoring" icon={<Activity className="w-7 h-7 text-white" />} color="bg-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 container mx-auto px-4">
        <div className="bg-gradient-hero rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <ECGLine />
          </div>
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white animate-float" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Try Our AI Screening Tool
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Answer a few questions about your symptoms and get an instant AI-powered risk assessment. Free, private, and educational.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/ai-screening">
                <Button size="lg" className="bg-white text-primary-dark font-bold hover:bg-white/90 gap-2">
                  <Brain className="w-5 h-5" />
                  Start Free Screening
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 gap-2">
                  <Heart className="w-4 h-4" />
                  Create Patient Account
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <p className="text-white/60 text-sm">Educational tool only — not a substitute for professional medical diagnosis</p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default HomePage;
