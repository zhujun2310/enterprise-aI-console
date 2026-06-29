import type { Directive, DirectiveBinding } from 'vue';
import { useAuthStore } from '../stores/auth';

type PermissionBinding = string | string[];

function normalizePermissions(value: PermissionBinding): string[] {
  return Array.isArray(value) ? value : [value];
}

function updateVisibility(
  element: HTMLElement,
  binding: DirectiveBinding<PermissionBinding>
): void {
  const authStore = useAuthStore();
  const permissions = normalizePermissions(binding.value);
  const allowed = authStore.hasPermission(permissions);

  element.style.display = allowed ? '' : 'none';
}

export const permissionDirective: Directive<HTMLElement, PermissionBinding> = {
  mounted(element, binding) {
    updateVisibility(element, binding);
  },
  updated(element, binding) {
    updateVisibility(element, binding);
  }
};
