/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Filter,
  Edit3,
  Trash2,
  BookOpen,
  Tag,
  Hash,
  X,
  Save,
  User as UserIcon,
  Package,
  MapPin,
} from "lucide-react";
import api from "../api/axios";
import { Book, Author, Category, Shelf, UserRole } from "../types";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { cn } from "../utils/cn";

export default function Books() {
  const { user } = useAuth();
  const canManageBooks = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;
  
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  
  // Filter states
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Options for dropdowns
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  
  // Forms
  const [createForm, setCreateForm] = useState({
    isbn: "",
    title: "",
    description: "",
    quantity: 1,
    authorId: "",
    categoryId: "",
    shelfId: ""
  });
  
  const [editForm, setEditForm] = useState({
    isbn: "",
    title: "",
    description: "",
    quantity: 1,
    authorId: "",
    categoryId: "",
    shelfId: ""
  });

  const fetchOptions = useCallback(async () => {
    try {
      const [authorsRes, categoriesRes, shelvesRes] = await Promise.all([
        api.get("/authors", { params: { page: 0, size: 100 } }),
        api.get("/categories", { params: { page: 0, size: 100 } }),
        api.get("/shelves", { params: { page: 0, size: 100 } })
      ]);
      
      setAuthors(authorsRes.data.data?.content || []);
      setCategories(categoriesRes.data.data?.content || []);
      setShelves(shelvesRes.data.data?.content || []);
    } catch (error) {
      console.error("Failed to fetch options:", error);
    }
  }, []);
  
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      
      // Use search endpoint if there's a search term
      if (searchTerm.trim()) {
        response = await api.get("/books/search", { params: { query: searchTerm.trim() } });
        const payload = response.data.data;
        setBooks(Array.isArray(payload) ? payload : []);
      } else if (authorFilter || categoryFilter || statusFilter) {
        // Use filter endpoint if filters are applied
        const params: any = { page: 0, size: 50 };
        if (authorFilter) params.authorId = authorFilter;
        if (categoryFilter) params.categoryId = categoryFilter;
        if (statusFilter) params.status = statusFilter;
        
        response = await api.get("/books/filter", { params });
        const payload = response.data.data;
        const bookList = Array.isArray(payload?.content) ? payload.content : [];
        setBooks(bookList);
      } else {
        // Default get all books
        response = await api.get("/books", { params: { page: 0, size: 50 } });
        const payload = response.data.data;
        const bookList = Array.isArray(payload?.content) ? payload.content : [];
        setBooks(bookList);
      }
    } catch (error) {
      toast.error("Failed to load books");
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, authorFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchBooks();
    if (canManageBooks) {
      fetchOptions();
    }
  }, [fetchBooks, fetchOptions, canManageBooks]);

  const openEdit = (book: any) => {
    setSelectedBook(book);
    setEditForm({
      isbn: book.isbn || "",
      title: book.title || "",
      description: book.description || "",
      quantity: book.quantity || 1,
      authorId: book.authorId?.toString() || "",
      categoryId: book.categoryId?.toString() || "",
      shelfId: book.shelfId?.toString() || ""
    });
    setIsEditOpen(true);
  };
  
  const openDelete = (book: any) => {
    setSelectedBook(book);
    setIsDeleteOpen(true);
  };
  
  const handleCreate = async () => {
    if (!createForm.isbn.trim() || !createForm.title.trim() || !createForm.authorId || !createForm.categoryId || !createForm.shelfId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post("/books", {
        isbn: createForm.isbn.trim(),
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        quantity: createForm.quantity,
        authorId: parseInt(createForm.authorId),
        categoryId: parseInt(createForm.categoryId),
        shelfId: parseInt(createForm.shelfId)
      });
      
      toast.success("Book created successfully");
      setIsCreateOpen(false);
      setCreateForm({
        isbn: "",
        title: "",
        description: "",
        quantity: 1,
        authorId: "",
        categoryId: "",
        shelfId: ""
      });
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create book");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = async () => {
    if (!selectedBook || !editForm.isbn.trim() || !editForm.title.trim() || !editForm.authorId || !editForm.categoryId || !editForm.shelfId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put(`/books/${selectedBook.id}`, {
        isbn: editForm.isbn.trim(),
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        quantity: editForm.quantity,
        authorId: parseInt(editForm.authorId),
        categoryId: parseInt(editForm.categoryId),
        shelfId: parseInt(editForm.shelfId)
      });
      
      toast.success("Book updated successfully");
      setIsEditOpen(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update book");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedBook) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/books/${selectedBook.id}`);
      toast.success("Book deleted successfully");
      setIsDeleteOpen(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete book");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const clearFilters = () => {
    setAuthorFilter("");
    setCategoryFilter("");
    setStatusFilter("");
  };

  const columns = [
    {
      header: "Book Info",
      key: "title",
      render: (book: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-8 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{book.title}</p>
            <p className="text-xs text-slate-400">ISBN: {book.isbn}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Author & Category",
      key: "author",
      render: (book: any) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs text-slate-600">
            <Edit3 className="h-3 w-3 mr-1 text-slate-400" />
            {book.authorName ?? "—"}
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <Tag className="h-3 w-3 mr-1" />
            {book.categoryName ?? "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Inventory",
      key: "quantity",
      render: (book: any) => (
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold">
              In Stock
            </p>
            <p className="font-bold text-slate-700">
              {book.availableCopies ?? 0}/{book.quantity ?? 0}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold">
              Shelf
            </p>
            <p className="font-bold text-slate-600">
              {book.shelfLocationCode ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (book: any) => (
        <span
          className={cn(
            "px-2 py-1 rounded text-[10px] font-bold uppercase",
            book.status === "AVAILABLE"
              ? "bg-emerald-50 text-emerald-600"
              : book.status === "BORROWED"
              ? "bg-blue-50 text-blue-600"
              : book.status === "MAINTENANCE"
              ? "bg-amber-50 text-amber-600"
              : "bg-red-50 text-red-600"
          )}
        >
          {book.status ?? "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (book: any) => (
        <div className="flex space-x-2">
          {canManageBooks && (
            <>
              <button
                className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 rounded"
                onClick={() => openEdit(book)}
                title="Edit book"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => openDelete(book)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-slate-100 rounded"
                title="Delete book"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Backend filtering is now used, but keep this as fallback for client-side search when needed

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Resource Catalog
          </h1>
          <p className="text-sm text-slate-500">
            Manage institutional catalogs and inventories.
          </p>
        </div>
        {canManageBooks && (
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit shadow-sm shadow-blue-100"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        )}
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by title, author, category or ISBN..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {canManageBooks && (
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "px-3 py-2 border rounded-lg flex items-center transition-all font-medium text-sm",
                  showFilters || authorFilter || categoryFilter || statusFilter
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <Filter className="mr-2 h-4 w-4" /> Filter
                {(authorFilter || categoryFilter || statusFilter) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {[authorFilter, categoryFilter, statusFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
            )}
            <div className="h-8 w-px bg-slate-200 mx-1" />
            <div className="text-xs text-slate-400 whitespace-nowrap">
              {books.length} books
            </div>
          </div>
        </div>
        
        {showFilters && canManageBooks && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            >
              <option value="">All Authors</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id.toString()}>
                  {author.name}
                </option>
              ))}
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="BORROWED">Borrowed</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={books}
          isLoading={isLoading}
        />
      </div>
      
      {/* Create Book Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isSubmitting && setIsCreateOpen(false)}
        title="Add New Resource"
        className="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Title *</label>
              <input
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                placeholder="Book title"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ISBN *</label>
              <input
                value={createForm.isbn}
                onChange={(e) => setCreateForm({ ...createForm, isbn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                placeholder="978-0-123456-78-9"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                value={createForm.quantity}
                onChange={(e) => setCreateForm({ ...createForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Author *</label>
              <select
                value={createForm.authorId}
                onChange={(e) => setCreateForm({ ...createForm, authorId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="">Select author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id.toString()}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
              <select
                value={createForm.categoryId}
                onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Shelf *</label>
              <select
                value={createForm.shelfId}
                onChange={(e) => setCreateForm({ ...createForm, shelfId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="">Select shelf</option>
                {shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id.toString()}>
                    {shelf.locationCode}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all resize-none"
                placeholder="Book description (optional)"
              />
            </div>
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
              disabled={isSubmitting}
              onClick={handleCreate}
              className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Book Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => !isSubmitting && setIsEditOpen(false)}
        title="Edit Resource"
        className="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Title *</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ISBN *</label>
              <input
                value={editForm.isbn}
                onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Author *</label>
              <select
                value={editForm.authorId}
                onChange={(e) => setEditForm({ ...editForm, authorId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="">Select author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id.toString()}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
              <select
                value={editForm.categoryId}
                onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Shelf *</label>
              <select
                value={editForm.shelfId}
                onChange={(e) => setEditForm({ ...editForm, shelfId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="">Select shelf</option>
                {shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id.toString()}>
                    {shelf.locationCode}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleEdit}
              className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => !isSubmitting && setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete resource"
        message={
          selectedBook
            ? `This will permanently delete "${selectedBook?.title}" from the catalog.`
            : 'This will permanently delete the selected resource.'
        }
        confirmText="Delete"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
