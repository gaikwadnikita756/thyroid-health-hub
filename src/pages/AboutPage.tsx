import React from 'react';
import thyroidDiagram from '@/assets/thyroid-diagram.png';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-background">
    <PublicNav />
    <div className="pt-16">
      <div className="bg-gradient-hero py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-3">About the Thyroid Gland</h1>
          <p className="text-white/80 max-w-xl mx-auto">Understanding the butterfly-shaped gland that regulates your entire metabolism.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">What is the Thyroid Gland?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The thyroid is a small, butterfly-shaped gland located at the front of your neck, just below the Adam's apple. Despite its small size — roughly 25–30 grams — it plays an enormous role in regulating how every cell in your body uses energy.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              It is part of the endocrine system and works closely with the pituitary gland (in the brain), which monitors thyroid hormone levels and tells the thyroid how much to produce using a signal called Thyroid-Stimulating Hormone (TSH).
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { hormone: 'T3', name: 'Triiodothyronine', desc: 'The active form — directly affects cell metabolism' },
                { hormone: 'T4', name: 'Thyroxine', desc: 'The main hormone produced; converted to T3 in body tissues' },
                { hormone: 'TSH', name: 'Pituitary signal', desc: 'Tells the thyroid how much hormone to make' },
              ].map((h) => (
                <div key={h.hormone} className="bg-accent rounded-xl p-4 text-center">
                  <div className="font-display font-bold text-2xl text-primary mb-1">{h.hormone}</div>
                  <div className="text-xs font-semibold text-foreground mb-1">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-hover">
              <img src={thyroidDiagram} alt="Thyroid gland anatomy diagram" className="w-full" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary rounded-xl px-4 py-2 text-primary-foreground text-sm font-semibold shadow-lg">
              Located in the anterior neck
            </div>
          </div>
        </div>

        {/* Why thyroid health matters */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">Why Thyroid Health Matters</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '⚡', title: 'Metabolism', desc: 'Controls how fast your body converts food into energy — affecting weight, energy, and body temperature.' },
              { icon: '❤️', title: 'Heart Rate', desc: 'Thyroid hormones directly influence heart rate and the strength of each heartbeat.' },
              { icon: '🧠', title: 'Brain & Mood', desc: 'Affects cognitive function, memory, concentration, and emotional wellbeing. Low levels cause brain fog and depression.' },
              { icon: '💪', title: 'Muscles & Bones', desc: 'Controls muscle protein synthesis and bone metabolism — important for growth in children and bone density in adults.' },
              { icon: '🌡️', title: 'Body Temperature', desc: 'Helps regulate internal body temperature through thermogenesis.' },
              { icon: '👶', title: 'Growth & Development', desc: 'Absolutely essential for brain development in fetuses and children. Untreated congenital hypothyroidism causes irreversible damage.' },
            ].map((item) => (
              <div key={item.title} className="medical-card">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="medical-card bg-gradient-blue-soft">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">The Thyroid Feedback Loop</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: 1, title: 'Hypothalamus detects low T3/T4', icon: '🧠' },
              { step: 2, title: 'Releases TRH to pituitary gland', icon: '📡' },
              { step: 3, title: 'Pituitary releases TSH', icon: '💉' },
              { step: 4, title: 'Thyroid produces T3 & T4', icon: '🦋' },
            ].map((s) => (
              <div key={s.step} className="text-center p-4 bg-card rounded-xl">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center mx-auto mb-2">
                  {s.step}
                </div>
                <p className="text-xs font-medium text-foreground">{s.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <PublicFooter />
  </div>
);

export default AboutPage;
