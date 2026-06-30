import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppSidebar from '../components/AppSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AppHeader />
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4 lg:px-6">
        <AppSidebar />
        <main className="min-h-[calc(100vh-7rem)] flex-1 rounded-2xl bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
