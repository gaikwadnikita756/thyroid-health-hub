import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Users, FileText, Calendar, LogOut, CheckCircle2,
  XCircle, ClipboardList, LayoutDashboard, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Tab = 'overview' | 'patients' | 'appointments';

interface Report {
  id: string;
  patient_id: string;
  tsh: number | null;
  t3: number | null;
  t4: number | null;
  ai_prediction: string | null;
  ai_confidence: number | null;
  ai_notes: string | null;
  doctor_notes: string | null;
  status: string;
  created_at: string;
}

const DoctorDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [reports, setReports] = useState<Report[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadReports();
  }, [user]);

  const loadReports = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('lab_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setReports(data);
  };

  const updateReport = async (id: string, approved: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('lab_reports').update({
      doctor_notes: notes[id] || null,
      doctor_id: user?.id,
      status: approved ? 'doctor_approved' : 'doctor_reviewed',
    }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: approved ? 'Approved & saved' : 'Reviewed & saved' }); loadReports(); }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Reports', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ];

  const pendingCount = reports.filter((r) => r.status === 'pending' || r.status === 'ai_analyzed').length;

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
              <div className="text-xs opacity-60 text-sidebar-foreground">Doctor Portal</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}>
              <Icon className="w-4 h-4" />
              {label}
              {id === 'patients' && pendingCount > 0 && (
                <span className="ml-auto bg-warning text-warning-foreground text-xs rounded-full px-1.5 py-0.5 font-bold">{pendingCount}</span>
              )}
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

      <main className="flex-1 overflow-auto p-6 max-w-5xl">
        {tab === 'overview' && (
          <div className="animate-fade-in">
            <h1 className="font-display text-2xl font-bold mb-6">Doctor Dashboard</h1>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="medical-card text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{new Set(reports.map((r) => r.patient_id)).size}</div>
                <div className="text-sm text-muted-foreground">Total Patients</div>
              </div>
              <div className="medical-card text-center">
                <ClipboardList className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold">{reports.length}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
              <div className="medical-card text-center border-warning/30 bg-warning/5">
                <FileText className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold text-warning">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </div>
            <div className="medical-card">
              <h2 className="font-semibold text-lg mb-4">Recent AI Predictions</h2>
              <div className="space-y-2">
                {reports.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                    <div>
                      <div className="font-medium">Patient: {r.patient_id.slice(0, 8)}...</div>
                      <div className="text-xs text-muted-foreground">TSH: {r.tsh} | {new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.ai_prediction && <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.ai_prediction === 'Hypothyroid' ? 'bg-accent text-primary' : r.ai_prediction === 'Hyperthyroid' ? 'bg-warning/15 text-warning' : 'bg-secondary/15 text-secondary'}`}>{r.ai_prediction}</span>}
                      <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'doctor_approved' ? 'bg-secondary/15 text-secondary' : 'bg-warning/15 text-warning'}`}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'patients' && (
          <div className="animate-fade-in">
            <h1 className="font-display text-2xl font-bold mb-6">Patient Reports</h1>
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className="medical-card">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Patient ID: {r.patient_id.slice(0, 16)}...</div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                        <div><span className="text-muted-foreground">TSH:</span> <strong className={r.tsh && (r.tsh > 4.0 || r.tsh < 0.4) ? 'text-warning' : ''}>{r.tsh?.toFixed(2) ?? '—'}</strong></div>
                        <div><span className="text-muted-foreground">T3:</span> <strong>{r.t3?.toFixed(2) ?? '—'}</strong></div>
                        <div><span className="text-muted-foreground">T4:</span> <strong>{r.t4?.toFixed(2) ?? '—'}</strong></div>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      {r.ai_prediction && (
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-1 ${r.ai_prediction === 'Hypothyroid' ? 'bg-accent text-primary' : r.ai_prediction === 'Hyperthyroid' ? 'bg-warning/15 text-warning' : 'bg-secondary/15 text-secondary'}`}>
                          🧠 {r.ai_prediction}
                        </div>
                      )}
                      {r.ai_confidence && <div className="text-xs text-muted-foreground">Confidence: {r.ai_confidence.toFixed(0)}%</div>}
                    </div>
                  </div>

                  {r.ai_notes && (
                    <div className="bg-accent rounded-lg p-3 text-sm mb-3">
                      <span className="font-semibold">AI Notes: </span>{r.ai_notes}
                    </div>
                  )}

                  {r.status !== 'doctor_approved' && r.status !== 'doctor_reviewed' && (
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Add Doctor Notes</span>
                      </div>
                      <Textarea
                        rows={2}
                        className="mb-3 text-sm"
                        placeholder="Add prescription notes or clinical assessment..."
                        value={notes[r.id] || r.doctor_notes || ''}
                        onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1.5" onClick={() => updateReport(r.id, true)}>
                          <CheckCircle2 className="w-3.5 h-3.5" />Approve AI Suggestion
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => updateReport(r.id, false)}>
                          <XCircle className="w-3.5 h-3.5" />Reviewed (No Action)
                        </Button>
                      </div>
                    </div>
                  )}

                  {(r.status === 'doctor_approved' || r.status === 'doctor_reviewed') && (
                    <div className="flex items-center gap-2 text-secondary text-sm border-t border-border pt-3">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{r.status === 'doctor_approved' ? 'AI suggestion approved' : 'Reviewed'} by doctor</span>
                    </div>
                  )}
                </div>
              ))}
              {reports.length === 0 && <div className="text-center py-12 text-muted-foreground">No patient reports yet.</div>}
            </div>
          </div>
        )}

        {tab === 'appointments' && (
          <div className="animate-fade-in">
            <h1 className="font-display text-2xl font-bold mb-6">Appointments</h1>
            <div className="medical-card text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Appointment Management</h3>
              <p className="text-sm text-muted-foreground">Patient appointments will appear here once booked through the patient portal.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
