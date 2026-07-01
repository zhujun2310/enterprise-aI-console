import { NavLink, Outlet } from 'react-router-dom';
import { DeviceProvider } from './store/deviceStore';

function navClass(active: boolean) {
  return `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;
}

export default function DeviceCenterShell() {
  return (
    <DeviceProvider>
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">模块</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">设备中心</h1>
            <p className="mt-2 text-slate-500">
              列表 → 详情 → 监控 → 告警 → 运维 的主链路（Mock）。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2">
            <NavLink to="/devices" end className={({ isActive }) => navClass(isActive)}>
              <span className="i-lucide-list h-4 w-4" />
              设备列表
            </NavLink>
            <NavLink to="/devices/alarms" className={({ isActive }) => navClass(isActive)}>
              <span className="i-lucide-triangle-alert h-4 w-4" />
              告警中心
            </NavLink>
            <NavLink to="/devices/ops" className={({ isActive }) => navClass(isActive)}>
              <span className="i-lucide-wrench h-4 w-4" />
              运维中心
            </NavLink>
          </div>
        </div>
        <Outlet />
      </section>
    </DeviceProvider>
  );
}
