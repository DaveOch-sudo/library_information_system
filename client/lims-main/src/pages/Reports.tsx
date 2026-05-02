/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  BarChart, 
  Download, 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  Filter,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('inventory');

  const reportTypes = [
    { id: 'inventory', label: 'Catalog Analysis', icon: FileText },
    { id: 'circulation', label: 'Circulation Trends', icon: Activity },
    { id: 'financial', label: 'Fee collection', icon: BarChart },
    { id: 'members', label: 'Member Activity', icon: PieIcon },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Strategic Intelligence</h1>
          <p className="text-sm text-slate-500">Generate data-driven insights for institutional decision making.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center shadow-sm">
             <Calendar className="mr-2 h-4 w-4" /> Period
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center">
             <Download className="mr-2 h-4 w-4" /> Export Data
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl transition-all border",
                activeTab === type.id 
                  ? "bg-primary/5 border-primary/20 text-primary font-bold shadow-sm" 
                  : "bg-white text-slate-500 border-transparent hover:bg-slate-50"
              )}
            >
              <div className="flex items-center">
                 <type.icon className={cn("mr-3 h-5 w-5", activeTab === type.id ? "text-primary" : "text-slate-400")} />
                 <span className="text-sm">{type.label}</span>
              </div>
              {activeTab === type.id && <ArrowUpRight className="h-3 w-3" />}
            </button>
          ))}
          
          <div className="mt-8 p-6 bg-slate-100 rounded-2xl border border-dashed border-slate-200 text-center">
             <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mx-auto mb-3">
               <Activity className="h-5 w-5 text-slate-500" />
             </div>
             <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Weekly Digest</p>
             <p className="text-[10px] text-slate-500 mb-4 px-2">Schedule automated reports for administrative review.</p>
             <button className="w-full py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">Setup Hook</button>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h3>
                <button className="text-blue-600 text-xs font-bold uppercase tracking-widest flex items-center hover:underline bg-transparent">
                   <Filter className="mr-1 h-3 w-3" /> Advance Filters
                </button>
             </div>
             
             {/* Dynamic Content based on tab */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 p-6 flex flex-col justify-end">
                   <div className="flex space-x-2 items-end h-full mb-4">
                      {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500 group-hover:bg-blue-600 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                   </div>
                   <p className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-widest">Temporal Density (7 Days)</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                   <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                      <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-1">Performance Index</p>
                      <p className="text-3xl font-bold text-slate-900">94.8%</p>
                      <p className="text-emerald-600 text-xs mt-2 font-medium">+2.4% vs Previous Term</p>
                   </div>
                   <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Efficiency Churn</p>
                      <p className="text-3xl font-bold text-slate-900">0.12%</p>
                      <p className="text-blue-600 text-xs mt-2 font-medium">Optimal Rating</p>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
             <div className="relative z-10 max-w-md">
                <h4 className="text-lg font-bold mb-2">Need a Custom Dataset?</h4>
                <p className="text-slate-400 text-sm">Our system supports deep SQL queries and raw CSV exports for external analysis tools like Tableau or PowerBI.</p>
             </div>
             <button className="relative z-10 px-6 py-3 bg-white text-slate-900 font-bold rounded-lg shadow-lg hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all flex items-center text-sm whitespace-nowrap">
                <Download className="mr-2 h-4 w-4" /> Request Raw Dump
             </button>
             <Activity className="absolute bottom-[-10px] right-[-10px] w-32 h-32 text-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
