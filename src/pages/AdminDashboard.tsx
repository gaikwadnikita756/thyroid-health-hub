import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Users, FileText, BarChart3, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

type Tab = 'overview' | 'users' | 'analytics';

interface Analytics {
  totalReports: number;
  byPrediction: { name: string; value: number; color: string }[];
  recentActivity: { date: string; reports: number }[];
}

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [analytics, setAnalytics] = useState<Analytics>({
    totalReports: 0,
    byPrediction: [],
    recentActivity: [],
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      // Fetch all medical tests for analytics
      const response = await fetch('http://localhost:3001/api/admin/reports');
      if (!response.ok) return;

      const reports = await response.json();

      const predictionCounts: Record<string, number> = {};
      reports.forEach((r: { ai_prediction: string | null }) => {
        const p = r.ai_prediction || 'Pending';
        predictionCounts[p] = (predictionCounts[p] || 0) + 1;
      });

      const colors: Record<string, string> = {
        Normal: 'hsl(142 52% 44%)',
        Hypothyroid: 'hsl(200 94% 40%)',
        Hyperthyroid: 'hsl(38 92% 50%)',
        Pending: 'hsl(215 15% 55%)',
      };

      // Last 7 days activity
      const activityMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        activityMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
      }
      reports.forEach((r: { createdAt: string }) => {
        const d = new Date(r.createdAt);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (key in activityMap) activityMap[key]++;
      });

      setAnalytics({
        totalReports: reports.length,
        byPrediction: Object.entries(predictionCounts).map(([name, value]) => ({ name, value, color: colors[name] || '#888' })),
        recentActivity: Object.entries(activityMap).map(([date, reports]) => ({ date, reports })),
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-sidebar flex-col hidden md:flex shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-sidebar-foreground text-sm">ThyroSmart</div>
              <div className="text-xs opacity-60 text-sidebar-foreground">Admin Panel</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}>
              <Icon className="w-4 h-4" />{label}
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

      <main className="flex-1 overflow-auto p-6">
        {tab === 'overview' && (
          <div className="animate-fade-in max-w-5xl">
            <h1 className="font-display text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Reports', value: analytics.totalReports, icon: FileText, color: 'text-primary' },
                { label: 'Predictions Made', value: analytics.byPrediction.reduce((s, p) => s + (p.name !== 'Pending' ? p.value : 0), 0), icon: BarChart3, color: 'text-secondary' },
                { label: 'Pending Review', value: analytics.byPrediction.find((p) => p.name === 'Pending')?.value || 0, icon: Settings, color: 'text-warning' },
                { label: 'Active Users', value: '—', icon: Users, color: 'text-foreground' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="medical-card text-center">
                  <Icon className={`w-7 h-7 ${color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="medical-card">
                <h2 className="font-semibold mb-4">AI Prediction Distribution</h2>
                {analytics.byPrediction.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={analytics.byPrediction} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {analytics.byPrediction.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
                )}
              </div>

              <div className="medical-card">
                <h2 className="font-semibold mb-4">Report Activity (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="animate-fade-in max-w-4xl">
            <h1 className="font-display text-2xl font-bold mb-6">User Management</h1>
            <div className="medical-card text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">User Directory</h3>
              <p className="text-sm text-muted-foreground">User management requires database access. Connect to the Cloud tab to manage users directly.</p>
            </div>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="animate-fade-in max-w-4xl">
            <h1 className="font-display text-2xl font-bold mb-6">System Analytics</h1>
            <div className="medical-card">
              <h2 className="font-semibold mb-4">Weekly Report Activity</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reports" fill="hsl(var(--primary))" name="Reports Submitted" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
