/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
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

interface AuthorOption {
  id: number;
  name: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface ShelfOption {
  id: number;
  locationCode: string;
}

export const TopNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [shelves, setShelves] = useState<ShelfOption[]>([]);
  const [form, setForm] = useState({
    title: "",
    isbn: "",
    description: "",
    quantity: 1,
    authorId: "",
    categoryId: "",
    shelfId: "",
    pdfFile: null as File | null,
  });

  const isStaff = user?.role === "ADMIN" || user?.role === "LIBRARIAN";

  // fetch dropdown options when modal opens
  useEffect(() => {
    if (!showModal || !isStaff) return;

    const fetchOptions = async () => {
      try {
        const [authorsRes, categoriesRes, shelvesRes] =
          await Promise.allSettled([
            api.get("/authors"),
            api.get("/categories"),
            api.get("/shelves"),
          ]);

        if (authorsRes.status === "fulfilled") {
          const payload = authorsRes.value.data.data;
          setAuthors(Array.isArray(payload) ? payload : payload?.content ?? []);
        }

        if (categoriesRes.status === "fulfilled") {
          const payload = categoriesRes.value.data.data;
          setCategories(
            Array.isArray(payload) ? payload : payload?.content ?? []
          );
        }

        if (shelvesRes.status === "fulfilled") {
          const payload = shelvesRes.value.data.data;
          setShelves(Array.isArray(payload) ? payload : payload?.content ?? []);
        }
      } catch (error) {
        console.error("Failed to load dropdown options", error);
      }
    };

    fetchOptions();
  }, [showModal, isStaff]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, pdfFile: file });
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.isbn || !form.authorId || !form.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      // First create the book
      const bookResponse = await api.post("/books", {
        title: form.title,
        isbn: form.isbn,
        description: form.description,
        availableCopies: Number(form.quantity),
        quantity: Number(form.quantity),
        authorId: Number(form.authorId),
        categoryId: Number(form.categoryId),
        shelfId: form.shelfId ? Number(form.shelfId) : null,
      });

      // If PDF file is provided, upload it
      if (form.pdfFile) {
        const formData = new FormData();
        formData.append("file", form.pdfFile);
        await api.post(`/pdf/upload/${bookResponse.data.data.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

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
        pdfFile: null,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({
      title: "",
      isbn: "",
      description: "",
      quantity: 1,
      authorId: "",
      categoryId: "",
      shelfId: "",
      pdfFile: null,
    });
  };

  // shared select style
  const selectClass =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all";
  const inputClass =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all";

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-var(--spacing-sidebar))] h-topbar bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-40 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              className={`block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400`}
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
                  .map((n: string) => n[0])
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
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
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
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. The Great Gatsby"
                    className={inputClass}
                  />
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    ISBN <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="978-0-00-000000-0"
                    className={inputClass}
                  />
                </div>

                {/* Quantity */}
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
                    className={inputClass}
                  />
                </div>

                {/* Author dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="authorId"
                    value={form.authorId}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">Select author...</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {authors.length === 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      No authors found — add one in the Authors page first.
                    </p>
                  )}
                </div>

                {/* Category dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      No categories found.
                    </p>
                  )}
                </div>

                {/* Shelf dropdown */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Shelf Location
                    <span className="text-slate-400 font-normal ml-1">
                      (optional)
                    </span>
                  </label>
                  <select
                    name="shelfId"
                    value={form.shelfId}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">Select shelf...</option>
                    {shelves.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.locationCode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
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

                {/* PDF Upload */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    EBook PDF
                    <span className="text-slate-400 font-normal ml-1">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                  />
                  {form.pdfFile && (
                    <p className="text-xs text-slate-500 mt-1">
                      Selected: {form.pdfFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
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
