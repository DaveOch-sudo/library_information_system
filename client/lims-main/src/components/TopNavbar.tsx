/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Bell, Settings, User as UserIcon, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export const TopNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
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
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </button>

        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-all ml-2"
        >
          <div className="h-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
             <UserIcon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
