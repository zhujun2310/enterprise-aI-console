import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export default function AppSidebar() {
  const authStore = useAuthStore();
  const roleSummary = authStore.roles.map((role) => role.id).join(', ');

  return (
    <aside className="w-64 shrink-0 rounded-2xl bg-slate-900 p-4 text-slate-100 shadow-sm">
      <p className="mb-4 text-sm font-medium text-slate-400">Navigation</p>

      <nav className="flex flex-col gap-2">
        {authStore.menus.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'rounded-xl px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              ].join(' ')
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl bg-slate-800/70 p-4 text-sm text-slate-300">
        <p className="font-medium text-white">Access Summary</p>
        <p className="mt-2">Roles: {roleSummary || '-'}</p>
        <p className="mt-1">Permissions: {authStore.permissionIds.length}</p>
      </div>
    </aside>
  );
}
