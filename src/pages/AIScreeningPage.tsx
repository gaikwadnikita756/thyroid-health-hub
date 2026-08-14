import React, { useState } from 'react';
import { Brain, CheckCircle2, AlertTriangle, XCircle, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

interface FormData {
  age: string;
  sex: string;
  weightChange: string;
  heartRate: string;
  temperatureSensitivity: string;
  tirednessLevel: number[];
  neckSwelling: string;
  previousThyroid: string;
  hairLoss: string;
  anxiety: string;
  drySkin: string;
  constipation: string;
  diarrhea: string;
  irregularPeriods: string;
  muscleWeakness: string;
  jointPain: string;
  depression: string;
}

interface Result {
  risk: 'low' | 'moderate' | 'high';
  message: string;
  recommendation: string;
  confidence: number;
  symptoms_noted: string[];
}

const ConfidenceMeter: React.FC<{ value: number; risk: 'low' | 'moderate' | 'high' }> = ({ value, risk }) => {
  const color = risk === 'low' ? 'bg-secondary' : risk === 'moderate' ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground font-medium">AI Confidence Score</span>
        <span className="font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

const AIScreeningPage: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    age: '',
    sex: '',
    weightChange: 'none',
    heartRate: 'normal',
    temperatureSensitivity: 'none',
    tirednessLevel: [3],
    neckSwelling: 'no',
    previousThyroid: 'no',
    hairLoss: 'no',
    anxiety: 'no',
    drySkin: 'no',
    constipation: 'no',
    diarrhea: 'no',
    irregularPeriods: 'no',
    muscleWeakness: 'no',
    jointPain: 'no',
    depression: 'no',
  });
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.age || !form.sex) { setError('Please fill in age and sex.'); return; }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/symptom-screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: form }),
      });

      if (response.ok) {
        const data = await response.json();
        const normalizedData = 'risk' in data ? data : {
          ...data,
          risk: data.riskLevel?.toLowerCase() as 'low' | 'moderate' | 'high' || 'low',
          symptoms_noted: data.riskFactors || data.symptoms || [],
        };
        setResult(normalizedData);
      } else {
        throw new Error('Screening failed');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Screening failed. Please try again.';
      // Fallback to rule-based result
      const riskScore = calculateRuleBasedRisk(form);
      setResult(riskScore);
      console.error('AI screening error, using fallback:', message);
    } finally {
      setLoading(false);
    }
  };

  const calculateRuleBasedRisk = (f: FormData): Result => {
    let score = 0;
    const noted: string[] = [];
    if (f.neckSwelling === 'yes') { score += 16; noted.push('Neck swelling or lump'); }
    if (f.previousThyroid === 'yes') { score += 15; noted.push('Previous thyroid diagnosis'); }
    if (f.weightChange === 'gain' || f.weightChange === 'loss') { score += 12; noted.push(`Unexplained weight ${f.weightChange}`); }
    if (f.heartRate !== 'normal') { score += 10; noted.push(`${f.heartRate} heart rate`); }
    if (f.temperatureSensitivity !== 'none') { score += 10; noted.push(`${f.temperatureSensitivity} intolerance`); }
    if (f.tirednessLevel[0] >= 7) { score += 10; noted.push('High fatigue level'); }
    if (f.hairLoss === 'yes') { score += 8; noted.push('Hair loss'); }
    if (f.anxiety === 'yes') { score += 6; noted.push('Anxiety or nervousness'); }
    if (f.drySkin === 'yes') { score += 6; noted.push('Dry skin'); }
    if (f.constipation === 'yes') { score += 6; noted.push('Constipation'); }
    if (f.diarrhea === 'yes') { score += 6; noted.push('Diarrhea'); }
    if (f.irregularPeriods === 'yes') { score += 6; noted.push('Irregular periods'); }
    if (f.muscleWeakness === 'yes') { score += 6; noted.push('Muscle weakness'); }
    if (f.jointPain === 'yes') { score += 6; noted.push('Joint or muscle pain'); }
    if (f.depression === 'yes') { score += 6; noted.push('Depression or low mood'); }
    if (parseInt(f.age) >= 60) { score += 8; noted.push('Age 60 or older'); }

    const confidence = Math.min(95, 50 + score * 1.2);
    if (score >= 60) return { risk: 'high', confidence, symptoms_noted: noted, message: 'Your responses suggest a higher likelihood of thyroid-related symptoms.', recommendation: 'Please consult a healthcare professional soon and request thyroid function tests (TSH, T3, T4).' };
    if (score >= 30) return { risk: 'moderate', confidence, symptoms_noted: noted, message: 'Some of your responses align with symptoms associated with thyroid disorders.', recommendation: 'Consider scheduling a check-up with your doctor to discuss thyroid testing.' };
    return { risk: 'low', confidence, symptoms_noted: noted, message: 'Your current responses do not strongly suggest thyroid disorder symptoms.', recommendation: 'Maintain a healthy lifestyle and attend regular check-ups, especially if you are in a higher-risk group.' };
  };

  const riskConfig = {
    low: { icon: <CheckCircle2 className="w-8 h-8 text-secondary" />, color: 'border-secondary bg-secondary/5', badge: 'Low Risk', badgeColor: 'bg-secondary/15 text-secondary' },
    moderate: { icon: <AlertTriangle className="w-8 h-8 text-warning" />, color: 'border-warning bg-warning/5', badge: 'Moderate Risk', badgeColor: 'bg-warning/15 text-warning' },
    high: { icon: <XCircle className="w-8 h-8 text-destructive" />, color: 'border-destructive bg-destructive/5', badge: 'High Risk', badgeColor: 'bg-destructive/15 text-destructive' },
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-hero py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white animate-float" />
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-3">AI Thyroid Risk Screening</h1>
            <p className="text-white/80 max-w-xl mx-auto">Answer a few questions and our AI will assess your risk level. <strong>Educational only — not a medical diagnosis.</strong></p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Demographics */}
              <div className="medical-card">
                <h2 className="font-display font-bold text-xl mb-6 text-foreground">Basic Information</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-2 block font-medium">Age</Label>
                    <Input
                      type="number"
                      min={10}
                      max={120}
                      placeholder="Enter your age"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium">Biological Sex</Label>
                    <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="other">Other/Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="medical-card">
                <h2 className="font-display font-bold text-xl mb-6 text-foreground">Symptom Assessment</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="font-medium mb-3 block">Unexplained weight change</Label>
                    <RadioGroup value={form.weightChange} onValueChange={(v) => setForm({ ...form, weightChange: v })} className="flex gap-4">
                      <div className="flex items-center gap-2"><RadioGroupItem value="none" id="wn" /><Label htmlFor="wn">None</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="gain" id="wg" /><Label htmlFor="wg">Weight gain</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="loss" id="wl" /><Label htmlFor="wl">Weight loss</Label></div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="font-medium mb-3 block">Heart rate</Label>
                    <RadioGroup value={form.heartRate} onValueChange={(v) => setForm({ ...form, heartRate: v })} className="flex gap-4">
                      <div className="flex items-center gap-2"><RadioGroupItem value="slow" id="hs" /><Label htmlFor="hs">Slow/Low</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="normal" id="hn" /><Label htmlFor="hn">Normal</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="fast" id="hf" /><Label htmlFor="hf">Fast/Racing</Label></div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="font-medium mb-3 block">Temperature sensitivity</Label>
                    <RadioGroup value={form.temperatureSensitivity} onValueChange={(v) => setForm({ ...form, temperatureSensitivity: v })} className="flex gap-4">
                      <div className="flex items-center gap-2"><RadioGroupItem value="none" id="tn" /><Label htmlFor="tn">None</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="cold" id="tc" /><Label htmlFor="tc">Always cold</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="heat" id="th" /><Label htmlFor="th">Heat intolerance</Label></div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="font-medium mb-3 block">Fatigue level: {form.tirednessLevel[0]}/10</Label>
                    <Slider
                      value={form.tirednessLevel}
                      onValueChange={(v) => setForm({ ...form, tirednessLevel: v })}
                      min={1} max={10} step={1} className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Energetic</span><span>Extremely tired</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yes/No questions */}
              <div className="medical-card">
                <h2 className="font-display font-bold text-xl mb-6 text-foreground">Additional Symptoms</h2>
                <div className="space-y-4">
                  {[
                    { key: 'neckSwelling', label: 'Do you have neck swelling or a visible lump?' },
                    { key: 'previousThyroid', label: 'Have you been diagnosed with thyroid disease before?' },
                    { key: 'hairLoss', label: 'Are you experiencing unusual hair loss or thinning?' },
                    { key: 'anxiety', label: 'Do you experience unexplained anxiety, tremors, or nervousness?' },
                    { key: 'drySkin', label: 'Do you have dry or coarse skin?' },
                    { key: 'constipation', label: 'Are you experiencing frequent constipation?' },
                    { key: 'diarrhea', label: 'Are you having frequent diarrhea?' },
                    { key: 'irregularPeriods', label: 'Do you have irregular menstrual cycles?' },
                    { key: 'muscleWeakness', label: 'Do you feel muscle weakness or stiffness?' },
                    { key: 'jointPain', label: 'Do you have joint or muscle pain?' },
                    { key: 'depression', label: 'Do you feel more depressed or low than usual?' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex flex-col gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{label}</span>
                      <RadioGroup
                        value={form[key as keyof FormData] as string}
                        onValueChange={(v) => setForm({ ...form, [key]: v })}
                        className="flex gap-3"
                      >
                        <div className="flex items-center gap-1.5"><RadioGroupItem value="yes" id={`${key}y`} /><Label htmlFor={`${key}y`} className="text-sm">Yes</Label></div>
                        <div className="flex items-center gap-1.5"><RadioGroupItem value="no" id={`${key}n`} /><Label htmlFor={`${key}n`} className="text-sm">No</Label></div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4" /><span className="text-sm">{error}</span>
                </div>
              )}

              <Button type="submit" size="lg" disabled={loading} className="w-full gap-2 text-base">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing with AI...</> : <><Brain className="w-5 h-5" />Analyze My Risk</>}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                🔒 Your responses are private. This tool is for educational awareness only.
              </p>
            </form>
          ) : (
            <div className="animate-fade-in-up">
              <div className={`medical-card border-2 ${riskConfig[result.risk].color} mb-6`}>
                <div className="flex items-start gap-4 mb-6">
                  {riskConfig[result.risk].icon}
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${riskConfig[result.risk].badgeColor}`}>
                      {riskConfig[result.risk].badge}
                    </span>
                    <p className="text-foreground font-medium">{result.message}</p>
                  </div>
                </div>

                <ConfidenceMeter value={result.confidence} risk={result.risk} />

                {result.symptoms_noted.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Symptoms noted:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.symptoms_noted.map((s) => (
                        <span key={s} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm font-semibold text-primary mb-1">Recommendation</p>
                  <p className="text-sm text-foreground">{result.recommendation}</p>
                </div>
              </div>

              <div className="medical-card bg-warning/5 border border-warning/30 mb-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Important Disclaimer</p>
                    <p className="text-sm text-muted-foreground">
                      This tool is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for proper evaluation. AI predictions may not be accurate for all individuals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setResult(null)}>
                  Retake Assessment
                </Button>
                <Button className="flex-1" asChild>
                  <a href="/tests">Learn About Testing</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default AIScreeningPage;
