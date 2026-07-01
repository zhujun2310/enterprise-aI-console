import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppSidebar from '../components/AppSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AppHeader />
      <div className="flex w-full gap-4 px-3 py-4 lg:px-4">
        <AppSidebar />
        <main className="min-h-[calc(100vh-7rem)] flex-1 rounded-2xl bg-white p-4 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
