/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  User as UserIcon,
  BookOpen,
  Trash2,
  Edit3,
  X,
  Save,
} from "lucide-react";
import api from "../api/axios";
import { Author, UserRole } from "../types";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Authors() {
  const { user } = useAuth();
  const canManageAuthors = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;
  
  const [authors, setAuthors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  
  const [createForm, setCreateForm] = useState({ name: "", bio: "" });
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

  const fetchAuthors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/authors", { params: { page: 0, size: 50 } });
      const payload = response.data.data;
      const authorList = Array.isArray(payload?.content) ? payload.content : [];
      setAuthors(authorList);
    } catch (error) {
      console.error(error);
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const openEdit = (author: any) => {
    setSelectedAuthor(author);
    setEditForm({
      name: author.name || "",
      bio: author.bio || ""
    });
    setIsEditOpen(true);
  };
  
  const openDelete = (author: any) => {
    setSelectedAuthor(author);
    setIsDeleteOpen(true);
  };
  
  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast.error("Author name is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post("/authors", {
        name: createForm.name.trim(),
        bio: createForm.bio.trim() || null,
      });
      toast.success("Author created successfully!");
      setIsCreateOpen(false);
      setCreateForm({ name: "", bio: "" });
      fetchAuthors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create author");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = async () => {
    if (!selectedAuthor || !editForm.name.trim()) {
      toast.error("Author name is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put(`/authors/${selectedAuthor.id}`, {
        name: editForm.name.trim(),
        bio: editForm.bio.trim() || null,
      });
      toast.success("Author updated successfully!");
      setIsEditOpen(false);
      setSelectedAuthor(null);
      fetchAuthors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update author");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedAuthor) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/authors/${selectedAuthor.id}`);
      toast.success("Author deleted successfully");
      setIsDeleteOpen(false);
      setSelectedAuthor(null);
      fetchAuthors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete author");
    } finally {
      setIsSubmitting(false);
    }
  };


  const inputClass =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all";

  const columns = [
    {
      header: "Author Identity",
      key: "name",
      render: (author: Author) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>
          <p className="font-bold text-slate-900">{author.name ?? "—"}</p>
        </div>
      ),
    },
    {
      header: "Biography",
      key: "bio",
      render: (author: any) => (
        <p className="text-slate-400 text-sm italic">
          {author.bio ?? "No biography provided"}
        </p>
      ),
    },
    {
      header: "Publications",
      key: "publications",
      render: (author: any) => (
        <div className="flex items-center text-xs text-slate-400">
          <BookOpen className="h-3 w-3 mr-1" />
          {author.bookCount != null
            ? `${author.bookCount} books`
            : "View Catalog"}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (author: any) => (
        <div className="flex space-x-2">
          {canManageAuthors && (
            <>
              <button
                className="p-2 text-slate-400 hover:text-primary transition-all"
                onClick={() => openEdit(author)}
                title="Edit author"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-red-500 transition-all"
                onClick={() => openDelete(author)}
                title="Delete author"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filtered = authors.filter((a) =>
    (a.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Authority Control
            </h1>
            <p className="text-sm text-slate-500">
              Manage contributor identities and bibliographies.
            </p>
          </div>
          {canManageAuthors && (
            <button
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Register Author
            </button>
          )}
        </header>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Filter contributing authors..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-slate-400 whitespace-nowrap">
            {filtered.length} of {authors.length} authors
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable columns={columns} data={filtered} isLoading={isLoading} />
        </div>
      </div>

      {/* Create Author Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isSubmitting && setIsCreateOpen(false)}
        title="Register Author"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g. George R. R. Martin"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Biography
              <span className="text-slate-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <textarea
              value={createForm.bio}
              onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
              placeholder="Brief biography of the author..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all resize-none"
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
      
      {/* Edit Author Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => !isSubmitting && setIsEditOpen(false)}
        title="Edit Author"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Biography
              <span className="text-slate-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Brief biography of the author..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all resize-none"
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
        title="Delete author"
        message={
          selectedAuthor
            ? `This will permanently delete "${selectedAuthor?.name}" from the catalog.`
            : 'This will permanently delete the selected author.'
        }
        confirmText="Delete"
        type="danger"
        isLoading={isSubmitting}
      />
    </>
  );
}
