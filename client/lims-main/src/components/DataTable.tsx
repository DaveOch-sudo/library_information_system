/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface DataTableProps<T> {
  columns: {
    header: string;
    key: keyof T | string;
    render?: (row: T) => ReactNode;
  }[];
  data: T[];
  isLoading?: boolean;
}

export function DataTable<T extends { id: number | string }>({ columns, data, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Synchronizing records...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <span className="text-slate-300 text-4xl">?</span>
          </div>
          <h3 className="headline-md text-primary mb-1">No Data Found</h3>
          <p className="text-slate-500 body-md max-w-xs">There are currently no records matching your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 font-semibold text-[11px]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 text-slate-600">
                    {col.render ? col.render(row) : (row[col.key as keyof T] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
