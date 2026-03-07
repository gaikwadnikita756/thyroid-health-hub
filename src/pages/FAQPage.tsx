import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const faqs = [
  {
    q: 'What is the difference between hypothyroidism and hyperthyroidism?',
    a: 'Hypothyroidism means the thyroid is underactive — it does not make enough thyroid hormones. This slows down body functions, causing fatigue, weight gain, feeling cold, and depression. Hyperthyroidism means the thyroid is overactive — it makes too many hormones. This speeds things up, causing weight loss, anxiety, rapid heartbeat, and heat intolerance. Both are treatable conditions.',
  },
  {
    q: 'What is TSH and why is it important?',
    a: 'TSH stands for Thyroid-Stimulating Hormone. It is produced by the pituitary gland in the brain to tell the thyroid how much hormone to make. A high TSH usually means the thyroid is underperforming (hypothyroidism), while a low TSH usually means the thyroid is overproducing (hyperthyroidism). TSH is the most sensitive and widely used screening test for thyroid disorders.',
  },
  {
    q: 'Can thyroid problems cause weight change or mood changes?',
    a: 'Yes, absolutely. The thyroid controls metabolism, which is directly linked to weight. Hypothyroidism commonly causes unexplained weight gain and may cause depression, fatigue, and brain fog. Hyperthyroidism can cause unexplained weight loss and may cause anxiety, irritability, and mood swings. Treating the underlying thyroid condition often improves these symptoms.',
  },
  {
    q: 'Is thyroid disease lifelong?',
    a: 'It depends on the type. Hypothyroidism caused by Hashimoto\'s disease is usually a lifelong condition requiring ongoing thyroid hormone replacement. However, some forms of thyroiditis (e.g., postpartum thyroiditis) are temporary. Hyperthyroidism from Graves\' disease may resolve or be cured with treatment. Thyroid cancer is often curable, especially when caught early, but long-term monitoring is necessary.',
  },
  {
    q: 'Can children or teenagers get thyroid problems?',
    a: 'Yes. Congenital hypothyroidism (present at birth) is one of the most common preventable causes of intellectual disability — which is why most countries screen newborns for it. Hashimoto\'s thyroiditis is the most common cause of hypothyroidism in children and teenagers. Graves\' disease can affect young people too. Children with Down syndrome or Turner syndrome have a higher risk of thyroid disease.',
  },
  {
    q: 'Are thyroid problems always serious?',
    a: 'Not always. Many thyroid conditions (especially hypothyroidism) are very manageable with proper medication and monitoring. Most thyroid nodules are benign. Even thyroid cancer, when caught early (as papillary thyroid cancer, the most common type), has a cure rate exceeding 98% with appropriate treatment. Early detection and consistent management are key.',
  },
  {
    q: 'Can I take thyroid medication during pregnancy?',
    a: 'Yes, and it is often essential. Uncontrolled hypothyroidism during pregnancy increases the risk of miscarriage, premature birth, preeclampsia, and developmental problems in the baby. Levothyroxine is safe during pregnancy. Your dose may need to be adjusted — your doctor will monitor TSH levels closely. Never stop thyroid medication during pregnancy without medical guidance.',
  },
  {
    q: 'What does a "normal" thyroid feel like?',
    a: 'A healthy thyroid is not visible or easily felt on the outside of the neck. If you can see or feel a lump, swelling, or nodule in your neck, this should be evaluated by a doctor. This does not necessarily mean something serious is wrong — most nodules are benign — but it always warrants professional assessment.',
  },
  {
    q: 'Does diet affect thyroid function?',
    a: 'Yes, to some extent. Iodine is essential for thyroid hormone production — severe deficiency causes goiter. However, excessive iodine can also disrupt thyroid function. Selenium is important for converting T4 to the active T3. Certain foods (soy, raw cruciferous vegetables) can mildly interfere with thyroid function in very large amounts. A balanced diet is generally sufficient; supplements should only be taken on medical advice.',
  },
  {
    q: 'How is thyroid disease treated?',
    a: 'Treatment depends on the condition. Hypothyroidism is treated with synthetic thyroid hormone (levothyroxine), taken daily. Hyperthyroidism may be treated with anti-thyroid medicines (methimazole, propylthiouracil), radioiodine therapy, or surgery. Thyroid cancer treatment often involves surgery (thyroidectomy), sometimes followed by radioiodine therapy and/or hormone therapy. Regular follow-up is essential for all conditions.',
  },
];

const FAQPage: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-16">
        <div className="bg-gradient-hero py-14">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl font-bold text-white mb-3">Frequently Asked Questions</h1>
            <p className="text-white/80 max-w-xl mx-auto">Straightforward answers to common questions about thyroid health and diagnosis.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="flex items-center gap-2 mb-8 p-4 bg-accent rounded-xl">
            <HelpCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">These answers are for educational purposes only. Always consult a healthcare professional for personal medical advice.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="medical-card overflow-hidden p-0">
                <button
                  className="w-full flex items-center justify-between p-5 text-left gap-3 hover:bg-muted/30 transition-colors"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="font-semibold text-foreground text-sm leading-snug pr-2">{faq.q}</span>
                  {open === i ? (
                    <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {open === i && (
                  <div className="px-5 pb-5 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default FAQPage;
