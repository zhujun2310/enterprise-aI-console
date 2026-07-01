import { NavLink } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../stores/auth';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'enterprise-ai-console.ui.sidebar-collapsed:v1';

export default function AppSidebar() {
  const authStore = useAuthStore();
  const roleSummary = authStore.roles.map((role) => role.id).join(', ');
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  const menus = useMemo(
    () => authStore.menus.filter((item) => !item.children?.length),
    [authStore.menus]
  );

  return (
    <aside
      className={[
        'shrink-0 rounded-2xl bg-slate-900 text-slate-100 shadow-sm transition-all duration-200',
        collapsed ? 'w-16 p-2' : 'w-64 p-4'
      ].join(' ')}
    >
      <div
        className={[
          'mb-4 flex items-center',
          collapsed ? 'justify-center' : 'justify-between'
        ].join(' ')}
      >
        {collapsed ? null : <p className="text-sm font-medium text-slate-400">导航</p>}
        <button
          type="button"
          className={[
            'grid h-9 w-9 place-items-center rounded-xl text-slate-300 transition hover:bg-slate-800 hover:text-white',
            collapsed ? '' : 'ml-2'
          ].join(' ')}
          aria-label={collapsed ? '展开导航' : '收起导航'}
          onClick={() => {
            setCollapsed((prev) => !prev);
          }}
        >
          <span
            className={
              collapsed ? 'i-lucide-chevron-right h-4 w-4' : 'i-lucide-chevron-left h-4 w-4'
            }
          />
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        {menus.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'rounded-xl text-sm transition',
                collapsed
                  ? 'grid h-10 w-10 place-items-center'
                  : 'flex items-center gap-3 px-3 py-2',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              ].join(' ')
            }
            title={collapsed ? item.name : undefined}
          >
            <span className={[item.icon ?? 'i-lucide-circle', 'h-5 w-5 shrink-0'].join(' ')} />
            {collapsed ? null : <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {collapsed ? null : (
        <div className="mt-6 rounded-2xl bg-slate-800/70 p-4 text-sm text-slate-300">
          <p className="font-medium text-white">访问摘要</p>
          <p className="mt-2">角色：{roleSummary || '-'}</p>
          <p className="mt-1">权限：{authStore.permissionIds.length}</p>
        </div>
      )}
    </aside>
  );
}
