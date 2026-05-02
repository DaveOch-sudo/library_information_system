/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loan } from '../types';
import { DataTable } from '../components/DataTable';
import { Calendar, Clock, User as UserIcon, BookOpen, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/loans');
      setLoans(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async (id: number) => {
    try {
      await api.post(`/loans/return/${id}`);
      toast.success('Book returned successfully!');
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Return failed');
    }
  };

  const columns = [
    {
      header: 'Borrowed Resource',
      key: 'book',
      render: (loan: Loan) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
             <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-primary body-md">{loan.book.title}</p>
            <p className="text-xs text-slate-500">ISBN: {loan.book.isbn}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Member Identity',
      key: 'user',
      render: (loan: Loan) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-slate-700">{loan.user.fullName}</p>
            <p className="text-[10px] uppercase text-slate-400 tracking-tighter">{loan.user.role}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Timeline',
      key: 'dates',
      render: (loan: Loan) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs text-slate-600">
             <Calendar className="h-3 w-3 mr-2" /> <span className="font-medium">Issued:</span> {new Date(loan.issueDate).toLocaleDateString()}
          </div>
          <div className="flex items-center text-xs text-error font-bold">
             <Clock className="h-3 w-3 mr-2" /> <span>Due:</span> {new Date(loan.dueDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (loan: Loan) => (
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
          loan.status === 'BORROWED' ? "bg-blue-50 text-blue-600" :
          loan.status === 'OVERDUE' ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-600"
        )}>
          {loan.status}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (loan: Loan) => (
        loan.status !== 'RETURNED' && (
          <button 
            onClick={() => handleReturn(loan.id)}
            className="flex items-center px-4 py-2 bg-slate-100 hover:bg-primary hover:text-white text-primary rounded transition-all text-xs font-bold"
          >
            <RotateCcw className="mr-2 h-3 w-3" /> Return Asset
          </button>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Loan Distribution</h1>
          <p className="text-sm text-slate-500">Monitor active circulations and manage resource returns.</p>
        </div>
        
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
          <div className="px-6 py-2 text-center">
             <div className="text-xl font-bold text-blue-600">{loans.filter(l => l.status === 'BORROWED').length}</div>
             <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Active</div>
          </div>
          <div className="w-px bg-slate-100 my-2"></div>
          <div className="px-6 py-2 text-center">
             <div className="text-xl font-bold text-red-500">{loans.filter(l => l.status === 'OVERDUE').length}</div>
             <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Overdue</div>
          </div>
        </div>
      </header>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={loans} isLoading={isLoading} />
      </div>
    </div>
  );
}
