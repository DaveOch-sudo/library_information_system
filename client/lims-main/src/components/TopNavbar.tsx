/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  Search,
  Bell,
  User as UserIcon,
  Plus,
  X,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

export const TopNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    isbn: "",
    description: "",
    quantity: 1,
    authorId: "",
    categoryId: "",
    shelfId: "",
  });

  const isStaff = user?.role === "ADMIN" || user?.role === "LIBRARIAN";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.isbn || !form.authorId || !form.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/books", {
        ...form,
        quantity: Number(form.quantity),
        authorId: Number(form.authorId),
        categoryId: Number(form.categoryId),
        shelfId: form.shelfId ? Number(form.shelfId) : null,
      });
      toast.success("Book added successfully!");
      setShowModal(false);
      setForm({
        title: "",
        isbn: "",
        description: "",
        quantity: 1,
        authorId: "",
        categoryId: "",
        shelfId: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add book");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-var(--spacing-sidebar))] h-topbar bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-40 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400"
              placeholder="Search ISBN, title or author..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 relative transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          {/* Only show Add Resource for ADMIN and LIBRARIAN */}
          {isStaff && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100"
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </button>
          )}

          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-all ml-2"
          >
            <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 overflow-hidden font-bold text-xs">
              {user?.fullName ? (
                user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Add Book Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Add New Resource</h2>
                  <p className="text-xs text-slate-400">
                    Register a new book to the catalog
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. The Great Gatsby"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    ISBN <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="978-0-00-000000-0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Author ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="authorId"
                    type="number"
                    value={form.authorId}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Category ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="categoryId"
                    type="number"
                    value={form.categoryId}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Shelf ID
                  </label>
                  <input
                    name="shelfId"
                    type="number"
                    value={form.shelfId}
                    onChange={handleChange}
                    placeholder="e.g. 1 (optional)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Brief description of the book..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add Book
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
