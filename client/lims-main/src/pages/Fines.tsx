/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Fine } from '../types';
import { DataTable } from '../components/DataTable';
import { Wallet, AlertCircle, CheckCircle, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export default function Fines() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFines = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/fines');
      const payload = response.data.data;
      const fineList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
        ? payload.content
        : [];
      setFines(fineList);
    } catch (error) {
      console.error(error);
      setFines([]);
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

  // helper to get initials from a name string
  const getInitials = (name: string) =>
    (name ?? '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const columns = [
    {
      header: 'Member Account',
      key: 'user',
      render: (fine: any) => {
        const name = fine.userName ?? fine.userFullName ?? fine.user?.fullName ?? '—';
        const email = fine.userEmail ?? fine.user?.email ?? '—';
        return (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary text-[10px] flex-shrink-0">
              {getInitials(name)}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{name}</p>
              <p className="text-[10px] text-slate-400">{email}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Reason / Item',
      key: 'reason',
      render: (fine: any) => {
        const bookTitle = fine.bookTitle ?? fine.loanBookTitle ?? fine.loan?.book?.title ?? '—';
        return (
          <div>
            <p className="text-sm font-medium text-slate-700">{fine.reason ?? '—'}</p>
            <p className="text-xs text-slate-400 italic">{bookTitle}</p>
          </div>
        );
      }
    },
    {
      header: 'Outstanding Amount',
      key: 'amount',
      render: (fine: any) => (
        <span className="font-bold text-slate-900">
          ${(fine.amount ?? 0).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Compliance Status',
      key: 'status',
      render: (fine: any) => (
        <div className={cn(
          "flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit",
          fine.status === 'UNPAID' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {fine.status === 'UNPAID'
            ? <AlertCircle className="h-3 w-3 mr-1" />
            : <CheckCircle className="h-3 w-3 mr-1" />}
          {fine.status ?? '—'}
        </div>
      )
    },
    {
      header: 'Management',
      key: 'actions',
      render: (fine: any) => (
        <div className="flex items-center space-x-2">
          {fine.status === 'UNPAID' ? (
            <button
              onClick={() => handlePay(fine.id)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-xs font-bold shadow-sm"
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
    .filter((f: any) => f.status === 'UNPAID')
    .reduce((sum, f: any) => sum + (f.amount ?? 0), 0);

  const unpaidCount = fines.filter((f: any) => f.status === 'UNPAID').length;
  const paidCount = fines.filter((f: any) => f.status === 'PAID').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Financial Compliance</h1>
          <p className="text-sm text-slate-500">Monitor and collect late fees and administrative fines.</p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl text-center shadow-sm">
            <div className="text-xl font-bold text-red-500">{unpaidCount}</div>
            <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Unpaid</div>
          </div>
          <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl text-center shadow-sm">
            <div className="text-xl font-bold text-emerald-500">{paidCount}</div>
            <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Paid</div>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-4 shadow-xl shadow-slate-200">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Outstanding</div>
              <div className="text-xl font-bold">${totalOutstanding.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </header>

      {fines.length === 0 && !isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex flex-col items-center text-center">
          <CheckCircle className="h-10 w-10 text-emerald-300 mb-3" />
          <h3 className="font-bold text-slate-700 mb-1">No fines recorded</h3>
          <p className="text-slate-400 text-sm">All members are in good financial standing.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={fines} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}