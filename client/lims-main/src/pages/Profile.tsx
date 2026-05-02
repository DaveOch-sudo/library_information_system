/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Phone, Lock, Save, Camera, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Member Profile</h1>
        <p className="text-sm text-slate-500">Manage your institutional identity and security settings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
            <div className="relative inline-block mt-4 mb-6">
                <div className="h-32 w-32 rounded-3xl bg-white border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden mx-auto rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                    <User className="h-16 w-16 text-slate-300" />
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-white text-primary rounded-xl shadow-xl hover:scale-110 transition-all border border-slate-100">
                  <Camera className="h-5 w-5" />
                </button>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">{user?.fullName}</h3>
              <p className="text-[11px] uppercase font-bold tracking-[0.2em] text-blue-600">{user?.role}</p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Account Status</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase tracking-wider">Verified</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Join Date</span>
                <span className="text-slate-900 font-medium">May 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings Form */}
        <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Personal Information</h4>
              </div>

              <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Full Name</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm shadow-inner" value={user?.fullName} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Institutional Email</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm shadow-inner" value={user?.email} readOnly />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Contact Number</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm shadow-inner" value={user?.contactNumber || 'Not provided'} />
                </div>

                <div className="sm:col-span-2 pt-4">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-sm">
                    <Save className="h-4 w-4" /> Save Changes
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Lock className="h-5 w-5 text-red-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Security Access</h4>
              </div>

              <div className="space-y-6">
                  <div className="flex justify-between items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:border-slate-200">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Secure your account with an extra verification step.</p>
                    </div>
                    <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-slate-50 transition-colors">Enable</button>
                  </div>
                  
                  <div className="flex justify-between items-center group cursor-pointer">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">Credential Management</p>
                    <button className="text-primary font-bold text-xs flex items-center hover:underline">
                      Update Password <ArrowRight className="ml-2 h-3 w-3" />
                    </button>
                  </div>
              </div>
            </section>
        </div>
      </div>
    </div>
  );
}
