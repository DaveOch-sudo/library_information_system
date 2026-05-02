/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, HelpCircle, Globe, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/ui/FormInput';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Real API call
      const response = await api.post('/auth/login', data);
      login(response.data);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6 font-sans">
      <main className="w-full max-w-5xl bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 rounded-2xl">
        {/* Left Side: Visual/Branding */}
        <div className="hidden md:flex md:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 opacity-40">
            <img 
              alt="Institutional Library" 
              className="w-full h-full object-cover grayscale" 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2600&auto=format&fit=crop" 
            />
          </div>
          <div className="relative z-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <BookOpen className="text-white h-8 w-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">Lumina LIMS</h1>
              <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">Centralized resource management for forward-thinking academic institutions.</p>
            </div>
            
            <div className="pt-8 flex flex-col items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="inline-block h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <div className="h-full w-full bg-slate-700 animate-pulse"></div>
                  </div>
                ))}
                <div className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-slate-900 bg-blue-500 text-white text-[10px] font-bold">+120</div>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Preferred by 12k+ Librarians</p>
            </div>
          </div>
        </div>

        {/* Right Side: Interaction (Form) */}
        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 bg-white overflow-y-auto">
          <div className="mb-8 space-y-2">
            <span className="text-blue-600 font-bold text-[10px] tracking-[0.2em] uppercase">Secure Access</span>
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Please enter credentials to manage your catalog.</p>
          </div>

          <div className="flex border-b border-slate-100 mb-8">
            <button className="px-6 py-3 border-b-2 border-primary text-primary font-bold text-sm transition-colors">Login</button>
            <Link to="/register" className="px-6 py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors">Create Account</Link>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              label="Institutional Email"
              type="email"
              placeholder="name@institution.edu"
              error={errors.email ? "Email is required" : undefined}
              {...register('email', { required: true })}
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password ? "Password is required" : undefined}
              {...register('password', { required: true })}
            />

            <div className="flex items-center gap-2 pt-2">
              <input className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="text-sm text-slate-600 cursor-pointer" htmlFor="remember">Remember this device</label>
            </div>

            <button 
              className="w-full bg-primary text-white py-3 font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-2 flex items-center justify-center gap-2" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              © 2026 Group 2 LIMS Suite
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <HelpCircle className="h-4 w-4 hover:text-primary cursor-pointer" />
              <Globe className="h-4 w-4 hover:text-primary cursor-pointer" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
