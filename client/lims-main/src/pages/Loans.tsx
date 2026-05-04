/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import api from "../api/axios";
import { Loan } from "../types";
import { DataTable } from "../components/DataTable";
import {
  Calendar,
  Clock,
  User as UserIcon,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../utils/cn";

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/loans");
      const payload = response.data.data;
      const loanList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
        ? payload.content
        : [];
      setLoans(loanList);
    } catch (error) {
      console.error(error);
      setLoans([]);
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
      toast.success("Book returned successfully!");
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Return failed");
    }
  };

  const columns = [
    {
      header: "Borrowed Resource",
      key: "book",
      render: (loan: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-slate-900">
              {loan.bookTitle ?? loan.book?.title ?? "—"}
            </p>
            <p className="text-xs text-slate-400">
              ISBN: {loan.bookIsbn ?? loan.book?.isbn ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Member Identity",
      key: "user",
      render: (loan: any) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-slate-700">
              {loan.userName ?? loan.userFullName ?? loan.user?.fullName ?? "—"}
            </p>
            <p className="text-[10px] uppercase text-slate-400 tracking-tighter">
              {loan.userRole ?? loan.user?.role ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Timeline",
      key: "dates",
      render: (loan: any) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs text-slate-600">
            <Calendar className="h-3 w-3 mr-2" />
            <span className="font-medium">Issued:</span>&nbsp;
            {loan.issueDate
              ? new Date(loan.issueDate).toLocaleDateString()
              : "—"}
          </div>
          <div
            className={cn(
              "flex items-center text-xs font-bold",
              loan.status === "OVERDUE" ? "text-red-500" : "text-slate-500"
            )}
          >
            <Clock className="h-3 w-3 mr-2" />
            <span>Due:</span>&nbsp;
            {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (loan: any) => (
        <span
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
            loan.status === "BORROWED"
              ? "bg-blue-50 text-blue-600"
              : loan.status === "OVERDUE"
              ? "bg-red-50 text-red-600"
              : loan.status === "RETURNED"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-50 text-slate-500"
          )}
        >
          {loan.status ?? "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (loan: any) =>
        loan.status !== "RETURNED" ? (
          <button
            onClick={() => handleReturn(loan.id)}
            className="flex items-center px-4 py-2 bg-slate-100 hover:bg-primary hover:text-white text-primary rounded transition-all text-xs font-bold"
          >
            <RotateCcw className="mr-2 h-3 w-3" /> Return Asset
          </button>
        ) : (
          <span className="text-xs text-slate-300 italic">Returned</span>
        ),
    },
  ];

  const activeCount = loans.filter((l) => l.status === "BORROWED").length;
  const overdueCount = loans.filter((l) => l.status === "OVERDUE").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Loan Distribution
          </h1>
          <p className="text-sm text-slate-500">
            Monitor active circulations and manage resource returns.
          </p>
        </div>

        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
          <div className="px-6 py-2 text-center">
            <div className="text-xl font-bold text-blue-600">{activeCount}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
              Active
            </div>
          </div>
          <div className="w-px bg-slate-100 my-2" />
          <div className="px-6 py-2 text-center">
            <div className="text-xl font-bold text-red-500">{overdueCount}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
              Overdue
            </div>
          </div>
          <div className="w-px bg-slate-100 my-2" />
          <div className="px-6 py-2 text-center">
            <div className="text-xl font-bold text-slate-700">
              {loans.length}
            </div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
              Total
            </div>
          </div>
        </div>
      </header>

      {loans.length === 0 && !isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex flex-col items-center text-center">
          <BookOpen className="h-10 w-10 text-slate-200 mb-3" />
          <h3 className="font-bold text-slate-700 mb-1">No loans yet</h3>
          <p className="text-slate-400 text-sm">
            Loans will appear here once books are borrowed.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={loans} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
