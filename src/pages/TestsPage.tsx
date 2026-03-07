import React from 'react';
import { FlaskConical, Scan, Syringe, CheckCircle2, ClipboardList, Stethoscope, FileText } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const TestsPage: React.FC = () => (
  <div className="min-h-screen bg-background">
    <PublicNav />
    <div className="pt-16">
      <div className="bg-gradient-hero py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Tests &amp; Diagnosis</h1>
          <p className="text-white/80 max-w-xl mx-auto">Understanding the tests your doctor may order to evaluate your thyroid health.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Blood tests */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Blood Tests</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'TSH (Thyroid-Stimulating Hormone)', range: '0.4–4.0 mIU/L', description: 'The first-line test. High TSH often signals hypothyroidism; low TSH suggests hyperthyroidism. Produced by the pituitary to control the thyroid.', importance: 'Critical' },
              { name: 'Free T4 (Thyroxine)', range: '0.8–1.8 ng/dL', description: 'Measures the main thyroid hormone. Low levels confirm hypothyroidism; elevated levels indicate hyperthyroidism.', importance: 'Primary' },
              { name: 'Free T3 (Triiodothyronine)', range: '2.3–4.2 pg/mL', description: 'The active thyroid hormone. Particularly useful in diagnosing hyperthyroidism and monitoring treatment.', importance: 'Secondary' },
              { name: 'TPO Antibodies (Anti-TPOAb)', range: '< 35 IU/mL', description: 'Elevated in autoimmune thyroid diseases like Hashimoto\'s thyroiditis and Graves\' disease.', importance: 'Autoimmune' },
              { name: 'Thyroglobulin Antibodies (TgAb)', range: '< 20 IU/mL', description: 'Another marker for autoimmune thyroid disease, and used in monitoring thyroid cancer after treatment.', importance: 'Cancer monitor' },
              { name: 'Calcitonin', range: '< 10 pg/mL', description: 'Measured when medullary thyroid cancer is suspected or for follow-up after treatment.', importance: 'Cancer screen' },
            ].map((test) => (
              <div key={test.name} className="medical-card">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display font-bold text-foreground text-sm leading-tight flex-1 pr-2">{test.name}</h3>
                  <span className="text-xs bg-accent text-primary px-2 py-0.5 rounded-full shrink-0 font-medium">{test.importance}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{test.description}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">Normal range:</span>
                  <span className="font-mono font-semibold text-secondary">{test.range}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Imaging */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Scan className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Imaging Studies</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: 'Thyroid Ultrasound', icon: '🔊', desc: 'Uses sound waves to create images of the thyroid. Excellent for detecting nodules, evaluating their size/characteristics, and guiding biopsies. No radiation involved.' },
              { title: 'Radioiodine Uptake Scan', icon: '☢️', desc: 'Shows how actively the thyroid absorbs iodine. Helps differentiate causes of hyperthyroidism and assess thyroid function after cancer treatment.' },
              { title: 'CT / MRI Scan', icon: '🧲', desc: 'Used when cancer is suspected or to evaluate the extent of thyroid disease affecting surrounding neck structures or when ultrasound is inconclusive.' },
            ].map((img) => (
              <div key={img.title} className="medical-card">
                <div className="text-3xl mb-3">{img.icon}</div>
                <h3 className="font-display font-bold text-foreground mb-2">{img.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{img.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Biopsy */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
              <Syringe className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Biopsy (FNA)</h2>
          </div>
          <div className="medical-card border-l-4 border-l-primary">
            <h3 className="font-semibold text-foreground mb-3">Fine-Needle Aspiration Biopsy</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              A thin needle is used to extract a small sample of cells from a thyroid nodule, guided by ultrasound. Cells are then examined under a microscope to determine if they are benign, suspicious, or malignant. This is the most accurate way to evaluate thyroid nodules.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              {[
                { label: 'Duration', value: '20–30 minutes' },
                { label: 'Anesthesia', value: 'Local (numbing)' },
                { label: 'Results', value: '3–7 business days' },
              ].map((d) => (
                <div key={d.label} className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-muted-foreground text-xs mb-1">{d.label}</div>
                  <div className="font-semibold text-foreground">{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diagnosis flow */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">Diagnostic Process</h2>
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden md:block" />
            <div className="space-y-4">
              {[
                { icon: <Stethoscope className="w-5 h-5 text-primary-foreground" />, title: 'Medical History & Physical Exam', desc: 'Doctor reviews symptoms, family history, and examines the neck for thyroid enlargement or nodules.' },
                { icon: <FlaskConical className="w-5 h-5 text-primary-foreground" />, title: 'Laboratory Tests Ordered', desc: 'TSH is usually the first test. Additional tests (T3, T4, antibodies) ordered based on results.' },
                { icon: <Scan className="w-5 h-5 text-primary-foreground" />, title: 'Imaging if Needed', desc: 'Ultrasound or other imaging if physical exam or blood tests suggest structural abnormalities.' },
                { icon: <FileText className="w-5 h-5 text-primary-foreground" />, title: 'Results Interpreted', desc: 'Doctor reviews all results together and may consult an endocrinologist for complex cases.' },
                { icon: <CheckCircle2 className="w-5 h-5 text-primary-foreground" />, title: 'Diagnosis & Treatment Plan', desc: 'Confirmed diagnosis, treatment options discussed — may include medication, radioiodine therapy, or surgery.' },
              ].map((step, i) => (
                <div key={step.title} className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0 relative z-10">
                    {step.icon}
                  </div>
                  <div className="medical-card flex-1 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-medium">Step {i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Test prep checklist */}
        <section>
          <div className="medical-card bg-gradient-blue-soft">
            <div className="flex items-center gap-3 mb-5">
              <ClipboardList className="w-6 h-6 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">How to Prepare for Tests</h2>
            </div>
            <ul className="space-y-3">
              {[
                { tip: 'Ask if you need to fast — some thyroid tests do not require fasting, but your doctor may request it.' },
                { tip: 'List all medications and supplements you take, including vitamins containing iodine (biotin can interfere with some tests).' },
                { tip: 'Tell your doctor if you are pregnant or breastfeeding — certain tests (like radioiodine scans) are contraindicated.' },
                { tip: 'Bring previous thyroid test reports and imaging results to compare trends.' },
                { tip: 'Avoid biotin supplements for 48 hours before testing if advised by your doctor.' },
                { tip: 'Take thyroid medication at the same time of day, unless instructed otherwise before a test.' },
              ].map((item) => (
                <li key={item.tip} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{item.tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
    <PublicFooter />
  </div>
);

export default TestsPage;
