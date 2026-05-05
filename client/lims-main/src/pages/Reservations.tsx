/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Calendar,
  BookOpen,
  User as UserIcon,
  X,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  CalendarCheck,
  XCircle,
} from "lucide-react";
import api from "../api/axios";
import { Reservation, UserRole } from "../types";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { cn } from "../utils/cn";

export default function Reservations() {
  const { user } = useAuth();
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;
  const isStudent = user?.role === UserRole.STUDENT;
  
  const [reservations, setReservations] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [returnDate, setReturnDate] = useState("");
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  
  const [createForm, setCreateForm] = useState({ bookIds: [] as number[] });

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = isStaff 
        ? await api.get("/reservations", { params: { page: 0, size: 50 } })
        : await api.get(`/reservations/user/${user?.id}`, { params: { page: 0, size: 50 } });
      
      const payload = response.data.data;
      const reservationList = Array.isArray(payload?.content) ? payload.content : [];
      setReservations(reservationList);
    } catch (error) {
      console.error(error);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isStaff]);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await api.get("/books", { params: { page: 0, size: 100 } });
      const payload = response.data.data;
      const bookList = Array.isArray(payload?.content) ? payload.content : [];
      // Only show available books for reservation
      setBooks(bookList.filter((book: any) => book.status === 'AVAILABLE' && book.availableCopies > 0));
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setBooks([]);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
    if (isStudent) {
      fetchBooks();
    }
  }, [fetchReservations, fetchBooks, isStudent]);

  const openDelete = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsDeleteOpen(true);
  };
  
  const handleCreate = async () => {
    if (createForm.bookIds.length === 0) {
      toast.error("Please select at least one book");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create reservations for each selected book
      for (const bookId of createForm.bookIds) {
        await api.post("/reservations/single", null, {
          params: { bookId }
        });
      }
      
      toast.success(`${createForm.bookIds.length} reservation(s) created successfully!`);
      setIsCreateOpen(false);
      setCreateForm({ bookIds: [] });
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedReservation) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/reservations/${selectedReservation.id}`);
      toast.success("Reservation cancelled successfully");
      setIsDeleteOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel reservation");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openApprove = (reservation: any) => {
    setSelectedReservation(reservation);
    setReturnDate("");
    setIsApproveOpen(true);
  };
  
  const openReject = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsRejectOpen(true);
  };
  
  const handleApprove = async () => {
    if (!selectedReservation || !returnDate) {
      toast.error("Please select a return date");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put(`/reservations/${selectedReservation.id}/approve?returnDate=${returnDate}`);
      toast.success("Reservation approved successfully");
      setIsApproveOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve reservation");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedReservation) return;
    
    setIsSubmitting(true);
    try {
      await api.put(`/reservations/${selectedReservation.id}/reject`);
      toast.success("Reservation rejected successfully");
      setIsRejectOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject reservation");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const viewPdf = (reservation: any) => {
    if (reservation.bookId && reservation.bookHasEbook) {
      setCurrentPdfUrl(`/api/pdf/view/${reservation.bookId}`);
      setIsPdfViewerOpen(true);
    } else {
      toast.error("No PDF available for this book");
    }
  };
  
  const downloadPdf = (reservation: any) => {
    if (reservation.bookId && reservation.bookHasEbook) {
      window.open(`/api/pdf/download/${reservation.bookId}`, '_blank');
    } else {
      toast.error("No PDF available for this book");
    }
  };
  
  const toggleBookSelection = (bookId: number) => {
    setCreateForm(prev => ({
      ...prev,
      bookIds: prev.bookIds.includes(bookId)
        ? prev.bookIds.filter(id => id !== bookId)
        : [...prev.bookIds, bookId]
    }));
  };

  const columns = [
    {
      header: "Reservation Details",
      key: "details",
      render: (reservation: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">ID: #{reservation.id}</p>
            <p className="text-xs text-slate-400">
              {reservation.reservationDate 
                ? new Date(reservation.reservationDate).toLocaleDateString()
                : "—"}
            </p>
            {reservation.returnDate && (
              <p className="text-xs text-slate-400">
                Due: {new Date(reservation.returnDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Book",
      key: "book",
      render: (reservation: any) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs text-slate-600">
            <BookOpen className="h-3 w-3 mr-2" />
            {reservation.bookTitle || "—"}
          </div>
          {reservation.bookIsbn && (
            <p className="text-[10px] text-slate-400">ISBN: {reservation.bookIsbn}</p>
          )}
          {reservation.bookHasEbook && (
            <p className="text-[10px] text-blue-600 flex items-center">
              <Eye className="h-3 w-3 mr-1" /> EBook Available
            </p>
          )}
        </div>
      ),
    },
    ...(isStaff ? [{
      header: "Member",
      key: "user",
      render: (reservation: any) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-slate-700">
              {reservation.userFullName ?? "—"}
            </p>
            <p className="text-[10px] uppercase text-slate-400 tracking-tighter">
              {reservation.userRole ?? "—"}
            </p>
          </div>
        </div>
      ),
    }] : []),
    {
      header: "Status",
      key: "status",
      render: (reservation: any) => (
        <div className={cn(
          "flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit",
          reservation.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
          reservation.status === 'APPROVED' ? "bg-blue-50 text-blue-600" :
          reservation.status === 'REJECTED' ? "bg-red-50 text-red-600" :
          reservation.status === 'FULFILLED' ? "bg-emerald-50 text-emerald-600" :
          reservation.status === 'CANCELLED' ? "bg-slate-50 text-slate-600" :
          reservation.status === 'OVERDUE' ? "bg-red-50 text-red-600" :
          "bg-slate-50 text-slate-500"
        )}>
          {reservation.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
          {reservation.status === 'APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
          {reservation.status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
          {reservation.status === 'FULFILLED' && <CheckCircle className="h-3 w-3 mr-1" />}
          {reservation.status === 'CANCELLED' && <X className="h-3 w-3 mr-1" />}
          {reservation.status === 'OVERDUE' && <AlertCircle className="h-3 w-3 mr-1" />}
          {reservation.status ?? "—"}
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (reservation: any) => (
        <div className="flex space-x-2">
          {isStudent && reservation.status === 'APPROVED' && reservation.bookHasEbook && (
            <>
              <button
                onClick={() => viewPdf(reservation)}
                className="p-2 text-slate-400 hover:text-blue-500 transition-all"
                title="View PDF"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => downloadPdf(reservation)}
                className="p-2 text-slate-400 hover:text-green-500 transition-all"
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </button>
            </>
          )}
          {isStaff && reservation.status === 'PENDING' && (
            <>
              <button
                onClick={() => openApprove(reservation)}
                className="p-2 text-slate-400 hover:text-green-500 transition-all"
                title="Approve reservation"
              >
                <CalendarCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => openReject(reservation)}
                className="p-2 text-slate-400 hover:text-red-500 transition-all"
                title="Reject reservation"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          {(reservation.status === 'PENDING' && (isStudent || isStaff)) && (
            <button
              onClick={() => openDelete(reservation)}
              className="p-2 text-slate-400 hover:text-red-500 transition-all"
              title="Cancel reservation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const filtered = reservations.filter((r) =>
    (r.userName ?? r.userFullName ?? r.user?.fullName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.id).includes(searchTerm) ||
    (r.reservedBooks?.some((book: any) => 
      (book.bookTitle ?? book.title ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? false)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isStudent ? "My Reservations" : "Reservation Management"}
          </h1>
          <p className="text-sm text-slate-500">
            {isStudent 
              ? "View and manage your book reservations."
              : "Monitor and manage all user reservations."}
          </p>
        </div>
        {isStudent && (
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Reservation
          </button>
        )}
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={isStudent ? "Search your reservations..." : "Search reservations by member or book..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">
          {filtered.length} of {reservations.length} reservations
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filtered} isLoading={isLoading} />
      </div>
      
      {/* Create Reservation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isSubmitting && setIsCreateOpen(false)}
        title="Create New Reservation"
        className="max-w-2xl"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Select Books to Reserve <span className="text-red-500">*</span>
            </label>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
              {books.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  <BookOpen className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No available books to reserve</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {books.map((book) => (
                    <label
                      key={book.id}
                      className="flex items-center p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={createForm.bookIds.includes(book.id)}
                        onChange={() => toggleBookSelection(book.id)}
                        className="mr-3 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{book.title}</p>
                        <p className="text-xs text-slate-400">{book.authorName} • {book.isbn}</p>
                      </div>
                      <div className="text-xs text-slate-400">
                        {book.availableCopies} available
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {createForm.bookIds.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {createForm.bookIds.length} book(s) selected
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || createForm.bookIds.length === 0}
              onClick={handleCreate}
              className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Creating…' : 'Create Reservation'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => !isSubmitting && setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Cancel reservation"
        message={
          selectedReservation
            ? `This will cancel reservation #${selectedReservation?.id}.`
            : 'This will cancel the selected reservation.'
        }
        confirmText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />
      
      {/* Approve Modal */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => !isSubmitting && setIsApproveOpen(false)}
        title="Approve Reservation"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-3">
              Approve reservation #{selectedReservation?.id} for "{selectedReservation?.bookTitle}"
            </p>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Return Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsApproveOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || !returnDate}
              onClick={handleApprove}
              className="px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Approving…' : 'Approve'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Reject Confirmation */}
      <ConfirmDialog
        isOpen={isRejectOpen}
        onClose={() => !isSubmitting && setIsRejectOpen(false)}
        onConfirm={handleReject}
        title="Reject reservation"
        message={
          selectedReservation
            ? `This will reject reservation #${selectedReservation?.id} for "${selectedReservation?.bookTitle}".`
            : 'This will reject the selected reservation.'
        }
        confirmText="Reject"
        type="danger"
        isLoading={isSubmitting}
      />
      
      {/* PDF Viewer Modal */}
      <Modal
        isOpen={isPdfViewerOpen}
        onClose={() => setIsPdfViewerOpen(false)}
        title="PDF Viewer"
        className="max-w-6xl"
      >
        <div className="h-[80vh]">
          <iframe
            src={currentPdfUrl}
            className="w-full h-full border border-slate-200 rounded-lg"
            title="PDF Viewer"
          />
        </div>
      </Modal>
    </div>
  );
}
