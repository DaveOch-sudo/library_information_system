/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <TopNavbar />
      <main className="ml-[var(--spacing-sidebar)] pt-[var(--spacing-topbar)] min-h-screen">
        <div className="p-8 max-w-[1400px] mx-auto h-full overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
