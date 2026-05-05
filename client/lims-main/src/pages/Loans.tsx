/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import { Loan, UserRole } from "../types";
import { DataTable } from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();
  const isStaff =
    user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;
  const [staffView, setStaffView] = useState<"all" | "overdue">("all");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    if (!user?.id) {
      setLoans([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (isStaff && staffView === "overdue") {
        const response = await api.get("/loans/overdue");
        const payload = response.data.data;
        setLoans(Array.isArray(payload) ? payload : []);
      } else {
        const params = { page: 0, size: 50 };
        const response = isStaff
          ? await api.get("/loans", { params })
          : await api.get(`/loans/user/${user.id}`, { params });
        const payload = response.data.data;
        const loanList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.content)
          ? payload.content
          : [];
        setLoans(loanList);
      }
    } catch (error) {
      console.error(error);
      setLoans([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, isStaff, staffView]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleReturn = useCallback(
    async (id: number) => {
      try {
        await api.post(`/loans/return/${id}`);
        toast.success("Book returned successfully!");
        fetchLoans();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Return failed");
      }
    },
    [fetchLoans]
  );

  const columns = useMemo(() => {
    const bookCol = {
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
    };

    const memberCol = {
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
    };

    const rest = [
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

    return isStaff ? [bookCol, memberCol, ...rest] : [bookCol, ...rest];
  }, [isStaff, handleReturn]);

  const activeCount = loans.filter((l) => l.status === "BORROWED").length;
  const overdueCount = loans.filter((l) => l.status === "OVERDUE").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {isStaff ? "Loan Distribution" : "My Loans"}
          </h1>
          <p className="text-sm text-slate-500">
            {isStaff
              ? "Monitor active circulations and manage resource returns."
              : "View your borrowed items and return them when due."}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {isStaff && (
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setStaffView("all")}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                  staffView === "all"
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStaffView("overdue")}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                  staffView === "overdue"
                    ? "bg-red-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                Overdue
              </button>
            </div>
          )}

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
