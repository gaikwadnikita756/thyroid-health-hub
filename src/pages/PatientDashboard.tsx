import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity, User, FileText, Calendar, Brain, LogOut,
  Upload, TrendingUp, TrendingDown, AlertCircle, Clock, Plus, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Tab = 'overview' | 'profile' | 'reports' | 'appointments' | 'ai';

interface Report {
  id: string;
  tsh: number | null;
  t3: number | null;
  t4: number | null;
  ai_prediction: string | null;
  ai_confidence: number | null;
  ai_notes: string | null;
  status: string;
  created_at: string;
}

const PredictionBadge: React.FC<{ prediction: string | null }> = ({ prediction }) => {
  if (!prediction) return <span className="badge-normal">Pending</span>;
  if (prediction === 'Hypothyroid') return <span className="badge-hypo">Hypothyroid</span>;
  if (prediction === 'Hyperthyroid') return <span className="badge-hyper">Hyperthyroid</span>;
  return <span className="badge-normal">Normal</span>;
};

const ConfidenceBar: React.FC<{ value: number | null }> = ({ value }) => {
  if (!value) return null;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">AI Confidence</span>
        <span className="font-semibold">{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full">
        <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const PatientDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [reports, setReports] = useState<Report[]>([]);
  const [profileData, setProfileData] = useState({ full_name: '', age: '', gender: '', phone: '', medical_history: '' });
  const [labData, setLabData] = useState({ tsh: '', t3: '', t4: '', tpo_antibodies: '' });
  const [appointmentData, setAppointmentData] = useState({ date: '', time: '', reason: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadReports();
    loadProfile();
  }, [user]);

  const loadReports = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from('lab_reports').select('*').eq('patient_id', user?.id).order('created_at', { ascending: false });
    if (data) setReports(data);
  };

  const loadProfile = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from('profiles').select('*').eq('user_id', user?.id).single();
    if (data) setProfileData({ full_name: data.full_name || '', age: data.age?.toString() || '', gender: data.gender || '', phone: data.phone || '', medical_history: data.medical_history || '' });
  };

  const saveProfile = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('profiles').upsert({
      user_id: user?.id,
      full_name: profileData.full_name,
      age: parseInt(profileData.age) || null,
      gender: profileData.gender,
      phone: profileData.phone,
      medical_history: profileData.medical_history,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setLoading(false);
    if (error) toast({ title: 'Error saving profile', description: error.message, variant: 'destructive' });
    else toast({ title: 'Profile saved!' });
  };

  const submitLabReport = async () => {
    if (!labData.tsh) { toast({ title: 'TSH value is required', variant: 'destructive' }); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: report, error } = await (supabase as any).from('lab_reports').insert({
      patient_id: user?.id,
      tsh: parseFloat(labData.tsh),
      t3: labData.t3 ? parseFloat(labData.t3) : null,
      t4: labData.t4 ? parseFloat(labData.t4) : null,
      tpo_antibodies: labData.tpo_antibodies ? parseFloat(labData.tpo_antibodies) : null,
      status: 'pending',
    }).select().single();

    if (error) { toast({ title: 'Error submitting report', description: error.message, variant: 'destructive' }); setLoading(false); return; }

    // Run AI prediction
    try {
      const aiRes = await supabase.functions.invoke('thyroid-ai-screening', {
        body: {
          lab_values: {
            tsh: parseFloat(labData.tsh),
            t3: labData.t3 ? parseFloat(labData.t3) : null,
            t4: labData.t4 ? parseFloat(labData.t4) : null,
          },
          mode: 'lab_prediction',
        },
      });
      if (aiRes.data && report?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('lab_reports').update({
          ai_prediction: aiRes.data.prediction,
          ai_confidence: aiRes.data.confidence,
          ai_notes: aiRes.data.notes,
          status: 'ai_analyzed',
        }).eq('id', report.id);
      }
    } catch (aiErr) {
      console.error('AI analysis failed:', aiErr);
    }

    setLoading(false);
    setLabData({ tsh: '', t3: '', t4: '', tpo_antibodies: '' });
    loadReports();
    toast({ title: 'Lab report submitted!', description: 'AI analysis running...' });
    setTab('reports');
  };

  const bookAppointment = async () => {
    if (!appointmentData.date || !appointmentData.time) { toast({ title: 'Date and time required', variant: 'destructive' }); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('appointments').insert({
      patient_id: user?.id,
      appointment_date: appointmentData.date,
      appointment_time: appointmentData.time,
      reason: appointmentData.reason,
      status: 'scheduled',
    });
    setLoading(false);
    if (error) toast({ title: 'Error booking appointment', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Appointment booked!' }); setAppointmentData({ date: '', time: '', reason: '' }); }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'reports', label: 'Lab Reports', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'ai', label: 'AI Screening', icon: Brain },
  ];

  const latestReport = reports[0];
  const tshTrend = latestReport?.tsh ? (latestReport.tsh > 4.0 ? 'high' : latestReport.tsh < 0.4 ? 'low' : 'normal') : null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar flex-col hidden md:flex shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-sidebar-foreground text-sm">ThyroSmart</div>
              <div className="text-xs opacity-60 text-sidebar-foreground">Patient Portal</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground opacity-60 mb-3 truncate">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground" onClick={signOut}>
            <LogOut className="w-4 h-4" />Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold">Patient Portal</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id as Tab)} className={`p-2 rounded-lg ${tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-w-5xl">
          {/* Overview */}
          {tab === 'overview' && (
            <div className="animate-fade-in">
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                Welcome, {profileData.full_name || user?.email?.split('@')[0]} 👋
              </h1>
              <p className="text-muted-foreground mb-8">Here's your thyroid health dashboard.</p>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="medical-card text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{reports.length}</div>
                  <div className="text-sm text-muted-foreground">Lab Reports</div>
                </div>
                <div className="medical-card text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-3xl font-bold text-foreground">{latestReport?.tsh?.toFixed(2) ?? '—'}</span>
                    {tshTrend === 'high' && <TrendingUp className="w-5 h-5 text-warning" />}
                    {tshTrend === 'low' && <TrendingDown className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="text-sm text-muted-foreground">Latest TSH (mIU/L)</div>
                  <div className="text-xs text-muted-foreground mt-1">Normal: 0.4–4.0</div>
                </div>
                <div className="medical-card text-center">
                  <div className="mb-1"><PredictionBadge prediction={latestReport?.ai_prediction ?? null} /></div>
                  <div className="text-sm text-muted-foreground mt-2">AI Assessment</div>
                  {latestReport?.ai_confidence && <ConfidenceBar value={latestReport.ai_confidence} />}
                </div>
              </div>

              {reports.length > 0 ? (
                <div className="medical-card">
                  <h2 className="font-display font-bold text-lg mb-4">Recent Reports</h2>
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium">TSH: {r.tsh?.toFixed(2)} | T3: {r.t3?.toFixed(2) ?? 'N/A'} | T4: {r.t4?.toFixed(2) ?? 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <PredictionBadge prediction={r.ai_prediction} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="medical-card text-center py-12">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">No reports yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Upload your first lab report to get AI-powered analysis.</p>
                  <Button onClick={() => setTab('reports')}>
                    <Plus className="w-4 h-4 mr-2" />Submit Lab Report
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {tab === 'profile' && (
            <div className="animate-fade-in">
              <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Profile</h1>
              <div className="medical-card max-w-xl">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-1 block">Full Name</Label>
                    <Input value={profileData.full_name} onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 block">Age</Label>
                      <Input type="number" value={profileData.age} onChange={(e) => setProfileData({ ...profileData, age: e.target.value })} />
                    </div>
                    <div>
                      <Label className="mb-1 block">Gender</Label>
                      <Select value={profileData.gender} onValueChange={(v) => setProfileData({ ...profileData, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1 block">Phone</Label>
                    <Input value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-1 block">Medical History / Notes</Label>
                    <Textarea rows={4} value={profileData.medical_history} onChange={(e) => setProfileData({ ...profileData, medical_history: e.target.value })} placeholder="Previous conditions, surgeries, allergies..." />
                  </div>
                  <Button onClick={saveProfile} disabled={loading} className="w-full">
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reports */}
          {tab === 'reports' && (
            <div className="animate-fade-in">
              <h1 className="font-display text-2xl font-bold text-foreground mb-6">Lab Reports</h1>
              <div className="medical-card max-w-xl mb-8">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />Submit New Report
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 block">TSH (mIU/L) *</Label>
                      <Input type="number" step="0.01" value={labData.tsh} onChange={(e) => setLabData({ ...labData, tsh: e.target.value })} placeholder="e.g. 2.5" />
                    </div>
                    <div>
                      <Label className="mb-1 block">Free T3 (pg/mL)</Label>
                      <Input type="number" step="0.01" value={labData.t3} onChange={(e) => setLabData({ ...labData, t3: e.target.value })} placeholder="e.g. 3.2" />
                    </div>
                    <div>
                      <Label className="mb-1 block">Free T4 (ng/dL)</Label>
                      <Input type="number" step="0.01" value={labData.t4} onChange={(e) => setLabData({ ...labData, t4: e.target.value })} placeholder="e.g. 1.2" />
                    </div>
                    <div>
                      <Label className="mb-1 block">TPO Antibodies (IU/mL)</Label>
                      <Input type="number" step="0.1" value={labData.tpo_antibodies} onChange={(e) => setLabData({ ...labData, tpo_antibodies: e.target.value })} placeholder="e.g. 20" />
                    </div>
                  </div>
                  <div className="bg-accent rounded-lg p-3 text-xs text-foreground">
                    Normal ranges — TSH: 0.4–4.0 | Free T3: 2.3–4.2 | Free T4: 0.8–1.8
                  </div>
                  <Button onClick={submitLabReport} disabled={loading} className="w-full">
                    {loading ? 'Submitting & Analyzing...' : '🧠 Submit & Analyze with AI'}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="font-semibold text-lg">Report History</h2>
                {reports.length === 0 ? (
                  <div className="text-muted-foreground text-sm text-center py-8">No reports yet.</div>
                ) : (
                  reports.map((r) => (
                    <div key={r.id} className="medical-card">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <PredictionBadge prediction={r.ai_prediction} />
                            <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-muted-foreground">TSH:</span> <strong>{r.tsh?.toFixed(2) ?? '—'}</strong></div>
                            <div><span className="text-muted-foreground">T3:</span> <strong>{r.t3?.toFixed(2) ?? '—'}</strong></div>
                            <div><span className="text-muted-foreground">T4:</span> <strong>{r.t4?.toFixed(2) ?? '—'}</strong></div>
                          </div>
                        </div>
                        {r.ai_confidence && <ConfidenceBar value={r.ai_confidence} />}
                      </div>
                      {r.ai_notes && (
                        <div className="mt-3 p-3 bg-accent rounded-lg text-sm text-foreground">
                          <span className="font-semibold">AI Notes: </span>{r.ai_notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Appointments */}
          {tab === 'appointments' && (
            <div className="animate-fade-in">
              <h1 className="font-display text-2xl font-bold text-foreground mb-6">Book Appointment</h1>
              <div className="medical-card max-w-xl">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 block">Date *</Label>
                      <Input type="date" value={appointmentData.date} onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <Label className="mb-1 block">Time *</Label>
                      <Input type="time" value={appointmentData.time} onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1 block">Reason for Visit</Label>
                    <Textarea rows={3} value={appointmentData.reason} onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })} placeholder="Describe your symptoms or reason..." />
                  </div>
                  <Button onClick={bookAppointment} disabled={loading} className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* AI Screening */}
          {tab === 'ai' && (
            <div className="animate-fade-in">
              <h1 className="font-display text-2xl font-bold text-foreground mb-4">AI Symptom Screening</h1>
              <p className="text-muted-foreground mb-6">Use our AI screening tool to assess your risk level based on symptoms.</p>
              <div className="medical-card text-center py-10">
                <Brain className="w-12 h-12 text-primary mx-auto mb-4 animate-float" />
                <h2 className="font-display font-bold text-xl mb-2">AI Thyroid Risk Assessment</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Answer a series of questions about your symptoms and receive an instant AI-powered risk assessment with confidence score.</p>
                <Button size="lg" asChild>
                  <Link to="/ai-screening">Start AI Screening</Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">Educational tool only — not a medical diagnosis</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
