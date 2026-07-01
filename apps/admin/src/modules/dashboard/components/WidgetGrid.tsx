import type { ReactNode } from 'react';
import type { WidgetLayout } from '../types/widgets';

export interface WidgetGridItem {
  layout: WidgetLayout;
  content: ReactNode;
}

function getLayoutClasses(layout: WidgetLayout): string {
  const classes = ['col-span-1'];

  if (layout.colSpanLg === 2) {
    classes.push('lg:col-span-2');
  }

  return classes.join(' ');
}

export default function WidgetGrid({ items }: { items: WidgetGridItem[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items
        .slice()
        .sort((a, b) => a.layout.order - b.layout.order)
        .map((item) => (
          <div key={item.layout.id} className={getLayoutClasses(item.layout)}>
            {item.content}
          </div>
        ))}
    </div>
  );
}
