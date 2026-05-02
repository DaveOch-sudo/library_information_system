/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Fine } from '../types';
import { DataTable } from '../components/DataTable';
import { Wallet, AlertCircle, CheckCircle, Receipt, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export default function Fines() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFines = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/fines');
      setFines(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePay = async (id: number) => {
    try {
      await api.patch(`/fines/${id}/pay`);
      toast.success('Payment processed successfully!');
      fetchFines();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  const columns = [
    {
      header: 'Member Account',
      key: 'user',
      render: (fine: Fine) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary text-[10px]">
            {fine.user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-primary text-sm">{fine.user.fullName}</p>
            <p className="text-[10px] text-slate-500">{fine.user.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Reason / Item',
      key: 'reason',
      render: (fine: Fine) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{fine.reason}</p>
          <p className="text-xs text-slate-400 italic">{fine.loan.book.title}</p>
        </div>
      )
    },
    {
      header: 'Outstanding Amount',
      key: 'amount',
      render: (fine: Fine) => (
        <span className="font-bold text-primary">
          ${fine.amount.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Compliance Status',
      key: 'status',
      render: (fine: Fine) => (
        <div className={cn(
          "flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit",
          fine.status === 'UNPAID' ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-600"
        )}>
          {fine.status === 'UNPAID' ? <AlertCircle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
          {fine.status}
        </div>
      )
    },
    {
      header: 'Management',
      key: 'actions',
      render: (fine: Fine) => (
        <div className="flex items-center space-x-2">
          {fine.status === 'UNPAID' ? (
            <button 
              onClick={() => handlePay(fine.id)}
              className="flex items-center px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 transition-all text-xs font-bold shadow-sm"
            >
              <Wallet className="mr-2 h-3 w-3" /> Execute Payment
            </button>
          ) : (
            <button className="flex items-center px-4 py-2 text-slate-400 border border-slate-200 rounded text-xs font-bold">
              <Receipt className="mr-2 h-3 w-3" /> View Invoice
            </button>
          )}
        </div>
      )
    }
  ];

  const totalOutstanding = fines
    .filter(f => f.status === 'UNPAID')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Financial Compliance</h1>
          <p className="text-sm text-slate-500">Monitor and collect late fees and administrative fines.</p>
        </div>
        
        <div className="bg-slate-900 text-white px-6 py-4 rounded-xl flex items-center gap-6 shadow-xl shadow-slate-200">
          <div className="p-2 bg-slate-800 rounded-lg">
             <Wallet className="h-6 w-6 text-blue-400" />
          </div>
          <div>
             <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Outstanding</div>
             <div className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</div>
          </div>
        </div>
      </header>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={fines} isLoading={isLoading} />
      </div>
    </div>
  );
}
