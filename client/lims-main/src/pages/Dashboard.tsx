/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Library, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  Star,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react';
import api from '../api/axios';
import { DashboardStats } from '../types';
import { cn } from '../utils/cn';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kpis = [
    { label: 'Total Books', value: stats?.totalBooks || 0, icon: Library, color: 'primary', trend: '+2.4%' },
    { label: 'Borrowed Books', value: stats?.borrowedBooks || 0, icon: BookOpen, color: 'secondary', trend: '+8.1%' },
    { label: 'Available Books', value: stats?.availableBooks || 0, icon: CheckCircle2, color: 'teal-500', trend: 'Stable' },
    { label: 'Overdue Books', value: stats?.overdueBooks || 0, icon: AlertCircle, color: 'error', trend: '12%' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'primary-container', trend: '0.8%' },
  ];

  if (isLoading) return <div className="flex h-96 items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Library Overview</h1>
          <p className="text-sm text-slate-500">Real-time activity and collection statistics for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded uppercase tracking-wider">System Status: Optimal</div>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.slice(0, 4).map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
            <div className="flex justify-between items-start mb-1">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{kpi.label}</div>
              <span className={cn(
                "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded",
                kpi.color === 'error' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {kpi.trend}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-slate-900">{kpi.value.toLocaleString()}</span>
            </div>
            <div className="h-1 bg-slate-100 rounded overflow-hidden">
               <div 
                 className={cn(
                   "h-full rounded transition-all duration-1000",
                   kpi.color === 'primary' ? "bg-blue-500" :
                   kpi.color === 'secondary' ? "bg-indigo-500" :
                   kpi.color === 'error' ? "bg-red-500" : "bg-amber-500"
                 )} 
                 style={{ width: `${Math.min(100, (kpi.value / 10000) * 100 + 40)}%` }}
               ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Table Placeholder */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Borrowing Activity</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center bg-transparent">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Resource Title</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { user: 'John Doe', title: 'The Great Gatsby', action: 'BORROWED', time: '10:45 AM' },
                  { user: 'Sarah Williams', title: 'Quantum Physics Vol. 2', action: 'RETURNED', time: '09:12 AM' },
                  { user: 'Michael K.', title: 'Introduction to Algorithms', action: 'OVERDUE', time: 'Yesterday' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {row.user[0]}
                        </div>
                        <span className="font-medium text-slate-900">{row.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.title}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        row.action === 'BORROWED' ? "bg-blue-100 text-blue-700" :
                        row.action === 'RETURNED' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {row.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collection Health */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Collection Health</h3>
            <div className="space-y-4">
              {[
                { label: 'Available', value: '12,410', pct: 87, color: 'bg-emerald-500' },
                { label: 'In Repair', value: '142', pct: 5, color: 'bg-amber-400' },
                { label: 'Lost/Missing', value: '22', pct: 2, color: 'bg-red-400' }
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-900">{item.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.pct}%` }}></div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg shadow-blue-200/50 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold mb-2">Daily Librarian Tip</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">The &apos;Auto-Renew&apos; feature has increased student satisfaction by 14%. Consider suggesting it during checkout.</p>
              <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold transition-colors border-none text-white">
                View All Tips
              </button>
            </div>
            <Activity className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-white opacity-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
