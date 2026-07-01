import { useEffect, useMemo, useRef } from 'react';
import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts';
import * as echarts from 'echarts';

export interface EChartProps {
  option: EChartsOption;
  height?: number;
  loading?: boolean;
  setOptionOpts?: SetOptionOpts;
  className?: string;
}

function useResizeObserver(target: HTMLElement | null, onResize: () => void) {
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    if (!target) {
      return;
    }

    const observer = new ResizeObserver(() => {
      onResizeRef.current();
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [target]);
}

export default function EChart({
  option,
  height = 280,
  loading,
  setOptionOpts,
  className
}: EChartProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ECharts | null>(null);

  const style = useMemo(
    () => ({
      height: `${height}px`
    }),
    [height]
  );

  useResizeObserver(rootRef.current, () => {
    chartRef.current?.resize();
  });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }

    const instance = echarts.init(el, undefined, {
      renderer: 'canvas'
    });
    chartRef.current = instance;

    return () => {
      chartRef.current = null;
      instance.dispose();
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    if (loading) {
      chart.showLoading('default', { text: 'Loading...' });
    } else {
      chart.hideLoading();
    }

    chart.setOption(option, setOptionOpts ?? { notMerge: true, lazyUpdate: true });
  }, [loading, option, setOptionOpts]);

  return <div ref={rootRef} className={className ?? ''} style={style} />;
}
