/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Handshake, 
  BarChart3, 
  Settings, 
  Plus, 
  HelpCircle,
  LogOut,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { cn } from '../utils/cn';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: [UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STUDENT]
    },
    {
      title: 'Book Catalog',
      icon: BookOpen,
      path: '/books',
      roles: [UserRole.ADMIN, UserRole.LIBRARIAN]
    },
    {
      title: 'Authors',
      icon: Users,
      path: '/authors',
      roles: [UserRole.ADMIN, UserRole.LIBRARIAN]
    },
    {
      title: 'Search Books',
      icon: BookOpen,
      path: '/discovery',
      roles: [UserRole.STUDENT]
    },
    {
      title: 'User Management',
      icon: Users,
      path: '/users',
      roles: [UserRole.ADMIN]
    },
    {
      title: user?.role === UserRole.STUDENT ? 'My Loans' : 'Loan Tracking',
      icon: Handshake,
      path: '/loans',
      roles: [UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STUDENT]
    },
    {
      title: user?.role === UserRole.STUDENT ? 'My Fines' : 'Fines',
      icon: Wallet,
      path: '/fines',
      roles: [UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STUDENT]
    },
    {
      title: 'Reports',
      icon: BarChart3,
      path: '/reports',
      roles: [UserRole.ADMIN, UserRole.LIBRARIAN]
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      roles: [UserRole.ADMIN, UserRole.LIBRARIAN, UserRole.STUDENT]
    }
  ];

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar bg-secondary text-slate-300 flex flex-col shrink-0 z-50 border-r border-slate-800 shadow-xl font-sans antialiased">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
          <BookOpen className="text-white h-5 w-5" />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">Lumina LIMS</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase px-3 py-2 mt-2">Resource Management</div>
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-slate-800 text-slate-300"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 text-sm font-medium" onClick={logout}>
          <LogOut className="h-5 w-5 text-slate-400" />
          Logout
        </button>
        
        <div className="pt-2">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
            <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-white truncate">{user?.fullName}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
