/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, UserRole } from '../types';
import { DataTable } from '../components/DataTable';
import { Users, UserPlus, Shield, UserCheck, Mail, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    }
  ];

  const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrative Directory</h1>
          <p className="text-sm text-slate-500">Control system access and manage security group memberships.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit">
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
    </div>
  );
}
