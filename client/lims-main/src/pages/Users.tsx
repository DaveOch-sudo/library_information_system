/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { User, UserRole } from '../types';
import { DataTable } from '../components/DataTable';
import { UserPlus, Shield, UserCheck, Mail, Search, Edit3, Trash2, User as UserIcon, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 20;

type ApiUserDTO = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  contact?: string | null;
  createdAt?: string | null;
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [provisionForm, setProvisionForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: UserRole.STUDENT as UserRole,
    contact: '',
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: UserRole.STUDENT as UserRole,
    contactNumber: '',
  });

  const mapApiUser = (dto: ApiUserDTO): User => {
    const role =
      dto.role === UserRole.ADMIN || dto.role === UserRole.LIBRARIAN || dto.role === UserRole.STUDENT
        ? (dto.role as UserRole)
        : UserRole.STUDENT;
    return {
      id: dto.id,
      fullName: dto.fullName,
      email: dto.email,
      role,
      contactNumber: dto.contact ?? undefined,
      institution: undefined,
    };
  };

  const fetchUsers = useCallback(async (pageIndex: number) => {
    setIsLoading(true);
    try {
      const response = await api.get('/users', {
        params: { page: pageIndex, size: PAGE_SIZE },
      });
      const payload = response.data.data;
      const list: ApiUserDTO[] = Array.isArray(payload?.content) ? payload.content : [];
      setUsers(list.map(mapApiUser));
      setTotalPages(typeof payload?.totalPages === 'number' ? payload.totalPages : 0);
      setPage(pageIndex);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);

  const openEdit = (u: User) => {
    setSelectedUser(u);
    setEditForm({
      fullName: u.fullName ?? '',
      email: u.email ?? '',
      role: u.role ?? UserRole.STUDENT,
      contactNumber: u.contactNumber ?? '',
    });
    setIsEditOpen(true);
  };

  const openDelete = (u: User) => {
    setSelectedUser(u);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/users/${selectedUser.id}`);
      toast.success('User deleted');
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProvision = async () => {
    if (!provisionForm.fullName.trim() || !provisionForm.email.trim() || !provisionForm.password) {
      toast.error('Full name, email, and password are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        fullName: provisionForm.fullName.trim(),
        email: provisionForm.email.trim(),
        password: provisionForm.password,
        role: provisionForm.role,
        contact: provisionForm.contact.trim() || null,
      });
      toast.success('Member provisioned');
      setIsProvisionOpen(false);
      setProvisionForm({
        fullName: '',
        email: '',
        password: '',
        role: UserRole.STUDENT,
        contact: '',
      });
      fetchUsers(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Provisioning failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;
    if (!editForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/users/${selectedUser.id}`, {
        id: selectedUser.id,
        fullName: editForm.fullName.trim(),
        email: editForm.email,
        role: editForm.role,
        contact: editForm.contactNumber.trim() || null,
      });
      toast.success('User updated');
      setIsEditOpen(false);
      setSelectedUser(null);
      fetchUsers(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Full Identity',
      key: 'fullName',
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded shadow-inner bg-slate-100 flex items-center justify-center font-bold text-primary">
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-primary body-md">{user.fullName}</p>
            <p className="text-xs text-slate-500">ID: #SYS-{user.id.toString().padStart(4, '0')}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Access & Contact',
      key: 'email',
      render: (user: User) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs text-slate-600">
             <Mail className="h-3 w-3 mr-2" /> {user.email}
          </div>
          <div className="flex items-center text-xs text-slate-400">
             <Shield className="h-3 w-3 mr-2" /> {user.institution || 'Main Campus'}
          </div>
        </div>
      )
    },
    {
      header: 'Security Group',
      key: 'role',
      render: (user: User) => (
        <span className={cn(
          "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
          user.role === UserRole.ADMIN ? "bg-primary text-white" :
          user.role === UserRole.LIBRARIAN ? "bg-secondary text-white" : "bg-slate-100 text-slate-600"
        )}>
          {user.role}
        </span>
      )
    },
    {
      header: 'Account Health',
      key: 'status',
      render: () => (
        <div className="flex items-center text-teal-600 text-xs font-bold">
           <UserCheck className="h-3 w-3 mr-1" /> Active
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (u: User) => {
        const isSelf = currentUser?.id === u.id;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openEdit(u)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded transition-colors"
              title="Edit user"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openDelete(u)}
              disabled={isSelf}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={isSelf ? "You can't delete your own account" : 'Delete user'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      }
    }
  ];

  const q = searchTerm.toLowerCase().trim();
  const filteredUsers = users.filter(
    (u) =>
      !q ||
      (u.fullName ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      String(u.id).includes(q)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrative Directory</h1>
          <p className="text-sm text-slate-500">Control system access and manage security group memberships.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsProvisionOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
        >
          <UserPlus className="h-4 w-4" />
          Provision Member
        </button>
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or institutional ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filteredUsers} isLoading={isLoading} />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 0 || isLoading}
              onClick={() => fetchUsers(page - 1)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1 || isLoading}
              onClick={() => fetchUsers(page + 1)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isProvisionOpen}
        onClose={() => (!isSubmitting ? setIsProvisionOpen(false) : null)}
        title="Provision Member"
        className="max-w-xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  value={provisionForm.fullName}
                  onChange={(e) => setProvisionForm((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="email"
                  value={provisionForm.email}
                  onChange={(e) => setProvisionForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  placeholder="name@institution.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Role *</label>
              <select
                value={provisionForm.role}
                onChange={(e) =>
                  setProvisionForm((p) => ({ ...p, role: e.target.value as UserRole }))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              >
                <option value={UserRole.STUDENT}>Student</option>
                <option value={UserRole.LIBRARIAN}>Librarian</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Contact</label>
              <input
                value={provisionForm.contact}
                onChange={(e) => setProvisionForm((p) => ({ ...p, contact: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                placeholder="Phone number"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Temporary Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="password"
                  value={provisionForm.password}
                  onChange={(e) => setProvisionForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  placeholder="Min 6 characters"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                This uses the existing registration endpoint and does not sign you in as the new user.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsProvisionOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleProvision}
              className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Provisioning…' : 'Provision'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => (!isSubmitting ? setIsEditOpen(false) : null)}
        title="Edit User"
        className="max-w-xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
              <input
                value={editForm.fullName}
                onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
              <input
                value={editForm.email}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              >
                <option value={UserRole.STUDENT}>Student</option>
                <option value={UserRole.LIBRARIAN}>Librarian</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Contact</label>
              <input
                value={editForm.contactNumber}
                onChange={(e) => setEditForm((p) => ({ ...p, contactNumber: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                placeholder="Phone number"
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
              onClick={handleEditSave}
              className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => (!isSubmitting ? setIsDeleteOpen(false) : null)}
        onConfirm={handleDelete}
        title="Delete user"
        message={
          selectedUser
            ? `This will permanently delete ${selectedUser.fullName} (${selectedUser.email}).`
            : 'This will permanently delete the selected user.'
        }
        confirmText="Delete"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
