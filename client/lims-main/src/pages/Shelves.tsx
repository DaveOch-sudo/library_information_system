/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  MapPin,
  Package,
  Trash2,
  Edit3,
  Save,
} from "lucide-react";
import api from "../api/axios";
import { Shelf, UserRole } from "../types";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Shelves() {
  const { user } = useAuth();
  const canManageShelves = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;
  
  const [shelves, setShelves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<any>(null);
  
  const [createForm, setCreateForm] = useState({ locationCode: "", description: "" });
  const [editForm, setEditForm] = useState({ locationCode: "", description: "" });

  const fetchShelves = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/shelves", { params: { page: 0, size: 50 } });
      const payload = response.data.data;
      const shelfList = Array.isArray(payload?.content) ? payload.content : [];
      setShelves(shelfList);
    } catch (error) {
      console.error(error);
      setShelves([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShelves();
  }, [fetchShelves]);

  const openEdit = (shelf: any) => {
    setSelectedShelf(shelf);
    setEditForm({
      locationCode: shelf.locationCode || "",
      description: shelf.description || ""
    });
    setIsEditOpen(true);
  };
  
  const openDelete = (shelf: any) => {
    setSelectedShelf(shelf);
    setIsDeleteOpen(true);
  };
  
  const handleCreate = async () => {
    if (!createForm.locationCode.trim()) {
      toast.error("Location code is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post("/shelves", {
        locationCode: createForm.locationCode.trim(),
        description: createForm.description.trim() || null
      });
      toast.success("Shelf created successfully!");
      setIsCreateOpen(false);
      setCreateForm({ locationCode: "", description: "" });
      fetchShelves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create shelf");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = async () => {
    if (!selectedShelf || !editForm.locationCode.trim()) {
      toast.error("Location code is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put(`/shelves/${selectedShelf.id}`, {
        locationCode: editForm.locationCode.trim(),
        description: editForm.description.trim() || null
      });
      toast.success("Shelf updated successfully!");
      setIsEditOpen(false);
      setSelectedShelf(null);
      fetchShelves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update shelf");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedShelf) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/shelves/${selectedShelf.id}`);
      toast.success("Shelf deleted successfully");
      setIsDeleteOpen(false);
      setSelectedShelf(null);
      fetchShelves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete shelf");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Location",
      key: "locationCode",
      render: (shelf: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{shelf.locationCode ?? "—"}</p>
            <p className="text-xs text-slate-400">{shelf.description || "No description"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Resources",
      key: "bookCount",
      render: (shelf: any) => (
        <div className="flex items-center text-xs text-slate-400">
          <Package className="h-3 w-3 mr-1" />
          {shelf.bookCount != null
            ? `${shelf.bookCount} books`
            : "View Catalog"}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (shelf: any) => (
        <div className="flex space-x-2">
          {canManageShelves && (
            <>
              <button
                className="p-2 text-slate-400 hover:text-primary transition-all"
                onClick={() => openEdit(shelf)}
                title="Edit shelf"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-red-500 transition-all"
                onClick={() => openDelete(shelf)}
                title="Delete shelf"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filtered = shelves.filter((s) =>
    (s.locationCode ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Storage Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage physical storage locations and shelf assignments.
          </p>
        </div>
        {canManageShelves && (
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Shelf
          </button>
        )}
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">
          {filtered.length} of {shelves.length} shelves
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filtered} isLoading={isLoading} />
      </div>
      
      {/* Create Shelf Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isSubmitting && setIsCreateOpen(false)}
        title="Add Shelf"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Location Code <span className="text-red-500">*</span>
            </label>
            <input
              value={createForm.locationCode}
              onChange={(e) => setCreateForm({ ...createForm, locationCode: e.target.value })}
              placeholder="e.g. A1-101, B2-205, C3-301"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Description
              <span className="text-slate-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Brief description of the shelf location..."
              rows={3}
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
              disabled={isSubmitting || !createForm.locationCode.trim()}
              onClick={handleCreate}
              className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Shelf Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => !isSubmitting && setIsEditOpen(false)}
        title="Edit Shelf"
        className="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Location Code <span className="text-red-500">*</span>
            </label>
            <input
              value={editForm.locationCode}
              onChange={(e) => setEditForm({ ...editForm, locationCode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Description
              <span className="text-slate-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Brief description of the shelf location..."
              rows={3}
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
              disabled={isSubmitting || !editForm.locationCode.trim()}
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
        title="Delete shelf"
        message={
          selectedShelf
            ? `This will permanently delete shelf "${selectedShelf?.locationCode}" from the system.`
            : 'This will permanently delete the selected shelf.'
        }
        confirmText="Delete"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
