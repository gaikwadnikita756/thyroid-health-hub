import React from 'react';
import { AlertTriangle, Thermometer, Heart, Brain, Weight, ZapOff, Zap } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const hypoSymptoms = [
  'Persistent fatigue and weakness',
  'Unexplained weight gain',
  'Feeling cold all the time',
  'Dry skin and brittle nails',
  'Hair thinning or loss',
  'Slow heart rate (bradycardia)',
  'Depression and brain fog',
  'Constipation',
  'Puffy face (especially around eyes)',
  'Hoarse voice',
  'Muscle aches and stiffness',
  'Irregular or heavy menstrual periods',
];

const hyperSymptoms = [
  'Unexplained weight loss',
  'Heat intolerance and excessive sweating',
  'Anxiety, nervousness, irritability',
  'Fine hand tremors',
  'Rapid or irregular heartbeat (palpitations)',
  'Increased appetite',
  'Difficulty sleeping (insomnia)',
  'Frequent bowel movements',
  'Muscle weakness',
  'Eye problems (bulging, in Graves\' disease)',
  'Thin skin and brittle hair',
  'Light or missed menstrual periods',
];

const riskFactors = [
  { icon: '👨‍👩‍👧', label: 'Family history of thyroid disease' },
  { icon: '♀️', label: 'Being female (5–8× higher risk)' },
  { icon: '🎂', label: 'Age over 60' },
  { icon: '🫀', label: 'Personal history of autoimmune diseases (Type 1 diabetes, lupus, rheumatoid arthritis)' },
  { icon: '☢️', label: 'Previous radiation to neck or head' },
  { icon: '🧂', label: 'Iodine deficiency or excess (in diet)' },
  { icon: '🤰', label: 'Pregnancy and postpartum period' },
  { icon: '💊', label: 'Certain medicines (lithium, amiodarone, interferon)' },
  { icon: '👶', label: 'Turner syndrome or Down syndrome' },
  { icon: '🔬', label: 'Previous thyroid surgery or radioiodine therapy' },
];

const SymptomsPage: React.FC = () => (
  <div className="min-h-screen bg-background">
    <PublicNav />
    <div className="pt-16">
      <div className="bg-gradient-hero py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Symptoms &amp; Risk Factors</h1>
          <p className="text-white/80 max-w-xl mx-auto">Know the warning signs. Early recognition leads to earlier treatment and better outcomes.</p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="bg-warning/10 border-y border-warning/30 py-3">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <p className="text-sm text-foreground font-medium text-center">
            This information is for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Hypothyroidism */}
          <div className="medical-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center">
                <ZapOff className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-foreground">Hypothyroidism</h2>
                <span className="badge-hypo">Underactive thyroid</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              When the thyroid doesn't produce enough hormones, body functions slow down. Symptoms often develop gradually and may be mistaken for normal aging or stress.
            </p>
            <ul className="space-y-2.5">
              {hypoSymptoms.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hyperthyroidism */}
          <div>
            <div className="medical-card mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">Hyperthyroidism</h2>
                  <span className="badge-hyper">Overactive thyroid</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                Excess thyroid hormone accelerates the body's metabolism. Most common cause is Graves' disease — an autoimmune condition.
              </p>
              <ul className="space-y-2.5">
                {hyperSymptoms.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-warning/20 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                    </div>
                    <span className="text-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            <div className="medical-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">Risk Factors</h2>
              </div>
              <ul className="space-y-2.5">
                {riskFactors.map((r) => (
                  <li key={r.label} className="flex items-start gap-2.5 text-sm">
                    <span className="text-lg leading-none mt-0.5">{r.icon}</span>
                    <span className="text-foreground">{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="medical-card overflow-hidden">
          <h2 className="font-display font-bold text-2xl text-foreground mb-6">Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 text-muted-foreground font-semibold">Feature</th>
                  <th className="text-left py-3 px-4 text-primary font-semibold">Hypothyroidism</th>
                  <th className="text-left py-3 px-4 text-warning font-semibold">Hyperthyroidism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ['Weight', 'Gain', 'Loss'],
                  ['Heart rate', 'Slow', 'Fast'],
                  ['Energy', 'Fatigue', 'Restlessness'],
                  ['Temperature', 'Cold intolerance', 'Heat intolerance'],
                  ['Mood', 'Depression', 'Anxiety'],
                  ['Bowel habits', 'Constipation', 'Frequent movements'],
                ].map(([f, hypo, hyper]) => (
                  <tr key={f}>
                    <td className="py-3 pr-4 font-medium text-foreground">{f}</td>
                    <td className="py-3 px-4 text-primary">{hypo}</td>
                    <td className="py-3 px-4 text-warning">{hyper}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <PublicFooter />
  </div>
);

export default SymptomsPage;
