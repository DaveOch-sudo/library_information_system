/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, 
  Download, 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  Filter,
  PieChart as PieIcon,
  Activity,
  BookOpen,
  Clock,
  User as UserIcon,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import api from '../api/axios';
import { DataTable } from '../components/DataTable';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Reports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [overdueBooks, setOverdueBooks] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  const reportTypes = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Activity },
    { id: 'borrowed', label: 'Borrowed Books', icon: BookOpen },
    { id: 'overdue', label: 'Overdue Books', icon: Clock },
    { id: 'activity', label: 'User Activity', icon: Users },
  ];

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/reports/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBorrowedBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/reports/borrowed-books');
      setBorrowedBooks(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch borrowed books:', error);
      toast.error('Failed to load borrowed books data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOverdueBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/reports/overdue-books');
      setOverdueBooks(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch overdue books:', error);
      toast.error('Failed to load overdue books data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserActivity = useCallback(async () => {
    if (!selectedUserId) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/reports/user-activity/${selectedUserId}`);
      setUserActivity(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      toast.error('Failed to load user activity data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'borrowed') {
      fetchBorrowedBooks();
    } else if (activeTab === 'overdue') {
      fetchOverdueBooks();
    }
  }, [activeTab, fetchDashboard, fetchBorrowedBooks, fetchOverdueBooks]);

  useEffect(() => {
    if (activeTab === 'activity' && selectedUserId) {
      fetchUserActivity();
    }
  }, [activeTab, selectedUserId, fetchUserActivity]);

  const handleUserActivitySearch = () => {
    if (selectedUserId.trim()) {
      fetchUserActivity();
    }
  };

  const loanColumns = [
    {
      header: 'Book',
      key: 'book',
      render: (loan: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{loan.bookTitle ?? loan.book?.title ?? '—'}</p>
            <p className="text-xs text-slate-400">{loan.bookIsbn ?? loan.book?.isbn ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Member',
      key: 'user',
      render: (loan: any) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-slate-700">{loan.userName ?? loan.userFullName ?? loan.user?.fullName ?? '—'}</p>
            <p className="text-[10px] uppercase text-slate-400 tracking-tighter">{loan.userRole ?? loan.user?.role ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Borrow Date',
      key: 'borrowDate',
      render: (loan: any) => (
        <div className="text-sm text-slate-600">
          {loan.borrowDate ? new Date(loan.borrowDate).toLocaleDateString() : '—'}
        </div>
      ),
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (loan: any) => (
        <div className={cn(
          "text-sm font-bold",
          loan.status === 'OVERDUE' ? "text-red-500" : "text-slate-600"
        )}>
          {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '—'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Strategic Intelligence</h1>
          <p className="text-sm text-slate-500">Generate data-driven insights for institutional decision making.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center shadow-sm">
             <Calendar className="mr-2 h-4 w-4" /> Period
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center">
             <Download className="mr-2 h-4 w-4" /> Export Data
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl transition-all border",
                activeTab === type.id 
                  ? "bg-primary/5 border-primary/20 text-primary font-bold shadow-sm" 
                  : "bg-white text-slate-500 border-transparent hover:bg-slate-50"
              )}
            >
              <div className="flex items-center">
                 <type.icon className={cn("mr-3 h-5 w-5", activeTab === type.id ? "text-primary" : "text-slate-400")} />
                 <span className="text-sm">{type.label}</span>
              </div>
              {activeTab === type.id && <ArrowUpRight className="h-3 w-3" />}
            </button>
          ))}
          
          <div className="mt-8 p-6 bg-slate-100 rounded-2xl border border-dashed border-slate-200 text-center">
             <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mx-auto mb-3">
               <Activity className="h-5 w-5 text-slate-500" />
             </div>
             <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Weekly Digest</p>
             <p className="text-[10px] text-slate-500 mb-4 px-2">Schedule automated reports for administrative review.</p>
             <button className="w-full py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">Setup Hook</button>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Books</p>
                      <BookOpen className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{dashboardData.totalBooks || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Borrowed</p>
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{dashboardData.borrowedBooks || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Available</p>
                      <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{dashboardData.availableBooks || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Overdue</p>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{dashboardData.overdueBooks || 0}</p>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Dashboard Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 p-6 flex flex-col justify-end">
                    <div className="flex space-x-2 items-end h-full mb-4">
                      {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500 group-hover:bg-blue-600 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                    <p className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-widest">Weekly Activity</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                      <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-slate-900">{dashboardData?.totalUsers || 0}</p>
                      <p className="text-emerald-600 text-xs mt-2 font-medium">Active members</p>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Fines</p>
                      <p className="text-3xl font-bold text-slate-900">{dashboardData?.totalFines || 0}</p>
                      <p className="text-blue-600 text-xs mt-2 font-medium">Outstanding payments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'borrowed' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Borrowed Books Report</h3>
                <p className="text-sm text-slate-500">{borrowedBooks.length} books currently borrowed</p>
              </div>
              <DataTable columns={loanColumns} data={borrowedBooks} isLoading={isLoading} />
            </div>
          )}

          {activeTab === 'overdue' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Overdue Books Report</h3>
                <p className="text-sm text-red-500">{overdueBooks.length} books overdue</p>
              </div>
              <DataTable columns={loanColumns} data={overdueBooks} isLoading={isLoading} />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">User Activity Report</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter User ID"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleUserActivitySearch}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
              
              {userActivity && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                      <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-1">Total Loans</p>
                      <p className="text-3xl font-bold text-slate-900">{userActivity.totalLoans || 0}</p>
                    </div>
                    <div className="p-6 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-1">Active Loans</p>
                      <p className="text-3xl font-bold text-slate-900">{userActivity.activeLoans || 0}</p>
                    </div>
                    <div className="p-6 bg-red-50/50 rounded-xl border border-red-100">
                      <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-1">Overdue</p>
                      <p className="text-3xl font-bold text-slate-900">{userActivity.overdueLoans || 0}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-purple-50/50 rounded-xl border border-purple-100">
                      <p className="text-purple-600 text-[10px] font-bold uppercase tracking-widest mb-1">Total Fines</p>
                      <p className="text-3xl font-bold text-slate-900">${userActivity.totalFines || 0}</p>
                    </div>
                    <div className="p-6 bg-amber-50/50 rounded-xl border border-amber-100">
                      <p className="text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-1">Reservations</p>
                      <p className="text-3xl font-bold text-slate-900">{userActivity.totalReservations || 0}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!userActivity && selectedUserId && !isLoading && (
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No activity data found for this user</p>
                </div>
              )}
              
              {!selectedUserId && (
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Enter a user ID to view activity report</p>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
             <div className="relative z-10 max-w-md">
                <h4 className="text-lg font-bold mb-2">Need a Custom Dataset?</h4>
                <p className="text-slate-400 text-sm">Our system supports deep SQL queries and raw CSV exports for external analysis tools like Tableau or PowerBI.</p>
             </div>
             <button className="relative z-10 px-6 py-3 bg-white text-slate-900 font-bold rounded-lg shadow-lg hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all flex items-center text-sm whitespace-nowrap">
                <Download className="mr-2 h-4 w-4" /> Request Raw Dump
             </button>
             <Activity className="absolute bottom-[-10px] right-[-10px] w-32 h-32 text-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
