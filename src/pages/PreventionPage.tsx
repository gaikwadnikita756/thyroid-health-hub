import React from 'react';
import { CheckCircle2, AlertCircle, Pill, Salad, Dumbbell, Calendar } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const PreventionPage: React.FC = () => (
  <div className="min-h-screen bg-background">
    <PublicNav />
    <div className="pt-16">
      <div className="bg-gradient-hero py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Prevention &amp; Self-Care</h1>
          <p className="text-white/80 max-w-xl mx-auto">Practical lifestyle tips to support thyroid health and manage existing conditions.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="medical-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Salad className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">Diet &amp; Nutrition</h2>
            </div>
            <ul className="space-y-3">
              {[
                'Eat a balanced diet rich in fruits, vegetables, lean proteins, and whole grains.',
                'Ensure adequate iodine through natural food sources (seaweed, fish, dairy) — avoid self-prescribing iodine supplements unless advised by a doctor.',
                'Selenium-rich foods (Brazil nuts, tuna, eggs) support thyroid enzyme function.',
                'Limit highly processed foods, which may promote inflammation.',
                'Soy and raw cruciferous vegetables (broccoli, cabbage) in very large amounts may interfere with thyroid hormone production — moderate consumption is fine for most people.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="medical-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">Exercise &amp; Lifestyle</h2>
            </div>
            <ul className="space-y-3">
              {[
                'Aim for at least 150 minutes of moderate aerobic activity per week (walking, cycling, swimming).',
                'Strength training twice a week helps maintain muscle mass, especially important in hypothyroidism.',
                'Manage stress through yoga, meditation, or breathing exercises — chronic stress can impair thyroid function.',
                'Prioritize quality sleep (7–9 hours). Sleep deprivation disrupts hormone regulation.',
                'Avoid smoking — it increases the risk of Graves\' disease and worsens thyroid eye disease.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="medical-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-warning/10 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-warning" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">Medication Adherence (For Diagnosed Patients)</h2>
            </div>
            <ul className="space-y-3">
              {[
                'Take thyroid tablets (e.g., levothyroxine) at the same time each day, usually first thing in the morning on an empty stomach.',
                'Wait 30–60 minutes before eating or taking other medications — calcium, iron, and antacids reduce absorption.',
                'Never skip doses or change your dose without consulting your doctor — even small changes affect levels.',
                'Store tablets at room temperature away from moisture and sunlight.',
                'Attend all scheduled blood tests to monitor TSH and T4 levels.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="medical-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">Regular Monitoring</h2>
            </div>
            <ul className="space-y-3">
              {[
                'People with a family history of thyroid disease should have TSH checked every 1–2 years.',
                'Women over 60 and anyone with autoimmune conditions should get regular screening.',
                'If diagnosed, follow your doctor\'s schedule for TSH monitoring — typically every 6–12 months once stable.',
                'Keep a personal health diary recording symptoms, weight, energy levels, and medication times.',
                'Report any new symptoms (neck swelling, voice changes) to your doctor promptly.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency warning */}
        <div className="medical-card border-2 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-3 mb-5">
            <AlertCircle className="w-7 h-7 text-destructive" />
            <h2 className="font-display font-bold text-xl text-foreground">When to Seek Immediate Medical Attention</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Rapidly enlarging lump or swelling in the neck',
              'Severe difficulty swallowing or breathing',
              'Very fast or irregular heartbeat (especially with chest pain)',
              'Sudden, unexplained weight loss',
              'Thyroid storm: extreme fever, rapid heart rate, agitation (medical emergency)',
              'Myxedema coma: extreme cold intolerance, very slow heart rate, altered consciousness',
              'New hoarseness or voice change lasting more than 2 weeks',
              'Symptoms of thyrotoxic crisis or adrenal crisis',
            ].map((warning) => (
              <div key={warning} className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                <span className="text-sm font-medium text-foreground">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <PublicFooter />
  </div>
);

export default PreventionPage;
