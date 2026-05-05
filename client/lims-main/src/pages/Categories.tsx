/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Tag,
  BookOpen,
  Trash2,
  Edit3,
  Save,
} from "lucide-react";
import api from "../api/axios";
import { Category, UserRole } from "../types";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Categories() {
  const { user } = useAuth();
  const canManageCategories = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const [createForm, setCreateForm] = useState({ name: "" });
  const [editForm, setEditForm] = useState({ name: "" });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/categories", { params: { page: 0, size: 50 } });
      const payload = response.data.data;
      const categoryList = Array.isArray(payload?.content) ? payload.content : [];
      setCategories(categoryList);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openEdit = (category: any) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name || ""
    });
    setIsEditOpen(true);
  };
  
  const openDelete = (category: any) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };
  
  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post("/categories", {
        name: createForm.name.trim()
      });
      toast.success("Category created successfully!");
      setIsCreateOpen(false);
      setCreateForm({ name: "" });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = async () => {
    if (!selectedCategory || !editForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put(`/categories/${selectedCategory.id}`, {
        name: editForm.name.trim()
      });
      toast.success("Category updated successfully!");
      setIsEditOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedCategory) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/categories/${selectedCategory.id}`);
      toast.success("Category deleted successfully");
      setIsDeleteOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Category Identity",
      key: "name",
      render: (category: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Tag className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="font-bold text-slate-900">{category.name ?? "—"}</p>
        </div>
      ),
    },
    {
      header: "Resources",
      key: "bookCount",
      render: (category: any) => (
        <div className="flex items-center text-xs text-slate-400">
          <BookOpen className="h-3 w-3 mr-1" />
          {category.bookCount != null
            ? `${category.bookCount} books`
            : "View Catalog"}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (category: any) => (
        <div className="flex space-x-2">
          {canManageCategories && (
            <>
              <button
                className="p-2 text-slate-400 hover:text-primary transition-all"
                onClick={() => openEdit(category)}
                title="Edit category"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-red-500 transition-all"
                onClick={() => openDelete(category)}
                title="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filtered = categories.filter((c) =>
    (c.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Classification Management
          </h1>
          <p className="text-sm text-slate-500">
            Organize and manage resource categories.
          </p>
        </div>
        {canManageCategories && (
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        )}
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">
          {filtered.length} of {categories.length} categories
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filtered} isLoading={isLoading} />
      </div>
      
      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isSubmitting && setIsCreateOpen(false)}
        title="Add Category"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g. Fiction, Science, History"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
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
              disabled={isSubmitting || !createForm.name.trim()}
              onClick={handleCreate}
              className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => !isSubmitting && setIsEditOpen(false)}
        title="Edit Category"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
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
              disabled={isSubmitting || !editForm.name.trim()}
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
        title="Delete category"
        message={
          selectedCategory
            ? `This will permanently delete "${selectedCategory?.name}" from the catalog.`
            : 'This will permanently delete the selected category.'
        }
        confirmText="Delete"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
