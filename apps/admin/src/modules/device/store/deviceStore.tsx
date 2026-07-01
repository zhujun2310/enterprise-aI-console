import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type {
  AlarmLevel,
  AlarmRecord,
  AlarmStatus,
  DeviceDetail,
  DeviceListItem,
  DeviceType,
  HistorySeries,
  MonitorMetric,
  MonitorSnapshot,
  OperationLogRecord,
  PaginatedResult
} from '../types/device';
import {
  bulkDeviceAction,
  getAlarmList,
  getDeviceDetail,
  getDeviceHistory,
  getDeviceList,
  getDeviceMonitor,
  getOperationLogs,
  setAlarmStatus
} from '../api/device';

export interface DeviceListQueryState {
  page: number;
  pageSize: number;
  keyword: string;
  keywordField: 'name' | 'code' | 'all';
  region: string;
  org: string;
  online: 'all' | 'online' | 'offline';
  type: DeviceType | 'all';
  alarm: 'all' | 'has_alarm' | 'no_alarm';
  tags: string[];
  sortBy:
    'name' | 'code' | 'regionName' | 'orgName' | 'lastHeartbeatAt' | 'alarmCount' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface AlarmQueryState {
  page: number;
  pageSize: number;
  keyword: string;
  status: AlarmStatus | 'all';
  level: AlarmLevel | 'all';
  deviceId: string;
}

export interface OperationQueryState {
  page: number;
  pageSize: number;
  keyword: string;
  action: OperationLogRecord['action'] | 'all';
  deviceId: string;
  from: string;
  to: string;
}

interface Loadable<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface DeviceStoreState {
  listQuery: DeviceListQueryState;
  list: Loadable<PaginatedResult<DeviceListItem>>;
  details: Record<string, Loadable<DeviceDetail>>;
  monitor: Record<string, Loadable<MonitorSnapshot>>;
  history: Record<string, Loadable<HistorySeries>>;
  alarmQuery: AlarmQueryState;
  alarms: Loadable<PaginatedResult<AlarmRecord>>;
  operationQuery: OperationQueryState;
  operations: Loadable<PaginatedResult<OperationLogRecord>>;
}

const defaultListQuery: DeviceListQueryState = {
  page: 1,
  pageSize: 10,
  keyword: '',
  keywordField: 'all',
  region: '',
  org: '',
  online: 'all',
  type: 'all',
  alarm: 'all',
  tags: [],
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

const defaultAlarmQuery: AlarmQueryState = {
  page: 1,
  pageSize: 10,
  keyword: '',
  status: 'all',
  level: 'all',
  deviceId: ''
};

const defaultOperationQuery: OperationQueryState = {
  page: 1,
  pageSize: 10,
  keyword: '',
  action: 'all',
  deviceId: '',
  from: '',
  to: ''
};

const initialState: DeviceStoreState = {
  listQuery: defaultListQuery,
  list: { data: null, loading: false, error: null },
  details: {},
  monitor: {},
  history: {},
  alarmQuery: defaultAlarmQuery,
  alarms: { data: null, loading: false, error: null },
  operationQuery: defaultOperationQuery,
  operations: { data: null, loading: false, error: null }
};

type Action =
  | { type: 'LIST_QUERY_SET'; payload: Partial<DeviceListQueryState>; resetPage?: boolean }
  | { type: 'LIST_LOADING' }
  | { type: 'LIST_SUCCESS'; payload: PaginatedResult<DeviceListItem> }
  | { type: 'LIST_ERROR'; payload: string }
  | { type: 'DETAIL_LOADING'; payload: { deviceId: string } }
  | { type: 'DETAIL_SUCCESS'; payload: { deviceId: string; data: DeviceDetail } }
  | { type: 'DETAIL_ERROR'; payload: { deviceId: string; error: string } }
  | { type: 'MONITOR_LOADING'; payload: { deviceId: string } }
  | { type: 'MONITOR_SUCCESS'; payload: { deviceId: string; data: MonitorSnapshot } }
  | { type: 'MONITOR_ERROR'; payload: { deviceId: string; error: string } }
  | { type: 'HISTORY_LOADING'; payload: { key: string } }
  | { type: 'HISTORY_SUCCESS'; payload: { key: string; data: HistorySeries } }
  | { type: 'HISTORY_ERROR'; payload: { key: string; error: string } }
  | { type: 'ALARM_QUERY_SET'; payload: Partial<AlarmQueryState>; resetPage?: boolean }
  | { type: 'ALARM_LOADING' }
  | { type: 'ALARM_SUCCESS'; payload: PaginatedResult<AlarmRecord> }
  | { type: 'ALARM_ERROR'; payload: string }
  | { type: 'OP_QUERY_SET'; payload: Partial<OperationQueryState>; resetPage?: boolean }
  | { type: 'OP_LOADING' }
  | { type: 'OP_SUCCESS'; payload: PaginatedResult<OperationLogRecord> }
  | { type: 'OP_ERROR'; payload: string };

function reducer(state: DeviceStoreState, action: Action): DeviceStoreState {
  if (action.type === 'LIST_QUERY_SET') {
    const nextQuery = {
      ...state.listQuery,
      ...action.payload,
      page: action.resetPage ? 1 : state.listQuery.page
    };
    return { ...state, listQuery: nextQuery };
  }

  if (action.type === 'LIST_LOADING') {
    return { ...state, list: { data: state.list.data, loading: true, error: null } };
  }

  if (action.type === 'LIST_SUCCESS') {
    return { ...state, list: { data: action.payload, loading: false, error: null } };
  }

  if (action.type === 'LIST_ERROR') {
    return { ...state, list: { data: state.list.data, loading: false, error: action.payload } };
  }

  if (action.type === 'DETAIL_LOADING') {
    const current = state.details[action.payload.deviceId] ?? {
      data: null,
      loading: false,
      error: null
    };
    return {
      ...state,
      details: {
        ...state.details,
        [action.payload.deviceId]: { data: current.data, loading: true, error: null }
      }
    };
  }

  if (action.type === 'DETAIL_SUCCESS') {
    return {
      ...state,
      details: {
        ...state.details,
        [action.payload.deviceId]: { data: action.payload.data, loading: false, error: null }
      }
    };
  }

  if (action.type === 'DETAIL_ERROR') {
    const current = state.details[action.payload.deviceId] ?? {
      data: null,
      loading: false,
      error: null
    };
    return {
      ...state,
      details: {
        ...state.details,
        [action.payload.deviceId]: {
          data: current.data,
          loading: false,
          error: action.payload.error
        }
      }
    };
  }

  if (action.type === 'MONITOR_LOADING') {
    const current = state.monitor[action.payload.deviceId] ?? {
      data: null,
      loading: false,
      error: null
    };
    return {
      ...state,
      monitor: {
        ...state.monitor,
        [action.payload.deviceId]: { data: current.data, loading: true, error: null }
      }
    };
  }

  if (action.type === 'MONITOR_SUCCESS') {
    return {
      ...state,
      monitor: {
        ...state.monitor,
        [action.payload.deviceId]: { data: action.payload.data, loading: false, error: null }
      }
    };
  }

  if (action.type === 'MONITOR_ERROR') {
    const current = state.monitor[action.payload.deviceId] ?? {
      data: null,
      loading: false,
      error: null
    };
    return {
      ...state,
      monitor: {
        ...state.monitor,
        [action.payload.deviceId]: {
          data: current.data,
          loading: false,
          error: action.payload.error
        }
      }
    };
  }

  if (action.type === 'HISTORY_LOADING') {
    const current = state.history[action.payload.key] ?? {
      data: null,
      loading: false,
      error: null
    };
    return {
      ...state,
      history: {
        ...state.history,
        [action.payload.key]: { data: current.data, loading: true, error: null }
      }
    };
  }

  if (action.type === 'HISTORY_SUCCESS') {
    return {
      ...state,
      history: {
        ...state.history,
        [action.payload.key]: { data: action.payload.data, loading: false, error: null }
      }
    };
  }

  if (action.type === 'HISTORY_ERROR') {
    const current = state.history[action.payload.key] ?? {
      data: null,
      loading: false,
      error: null
    };
    return {
      ...state,
      history: {
        ...state.history,
        [action.payload.key]: { data: current.data, loading: false, error: action.payload.error }
      }
    };
  }

  if (action.type === 'ALARM_QUERY_SET') {
    const nextQuery = {
      ...state.alarmQuery,
      ...action.payload,
      page: action.resetPage ? 1 : state.alarmQuery.page
    };
    return { ...state, alarmQuery: nextQuery };
  }

  if (action.type === 'ALARM_LOADING') {
    return { ...state, alarms: { data: state.alarms.data, loading: true, error: null } };
  }

  if (action.type === 'ALARM_SUCCESS') {
    return { ...state, alarms: { data: action.payload, loading: false, error: null } };
  }

  if (action.type === 'ALARM_ERROR') {
    return { ...state, alarms: { data: state.alarms.data, loading: false, error: action.payload } };
  }

  if (action.type === 'OP_QUERY_SET') {
    const nextQuery = {
      ...state.operationQuery,
      ...action.payload,
      page: action.resetPage ? 1 : state.operationQuery.page
    };
    return { ...state, operationQuery: nextQuery };
  }

  if (action.type === 'OP_LOADING') {
    return { ...state, operations: { data: state.operations.data, loading: true, error: null } };
  }

  if (action.type === 'OP_SUCCESS') {
    return { ...state, operations: { data: action.payload, loading: false, error: null } };
  }

  if (action.type === 'OP_ERROR') {
    return {
      ...state,
      operations: { data: state.operations.data, loading: false, error: action.payload }
    };
  }

  return state;
}

interface DeviceStoreValue extends DeviceStoreState {
  setListQuery: (patch: Partial<DeviceListQueryState>, resetPage?: boolean) => void;
  fetchDeviceList: () => Promise<void>;
  fetchDeviceListWithQuery: (query: DeviceListQueryState) => Promise<void>;
  fetchDeviceDetail: (deviceId: string) => Promise<void>;
  fetchDeviceMonitor: (deviceId: string) => Promise<void>;
  fetchDeviceHistory: (params: {
    deviceId: string;
    metricKey: MonitorMetric['key'];
    from: string;
    to: string;
  }) => Promise<void>;
  setAlarmQuery: (patch: Partial<AlarmQueryState>, resetPage?: boolean) => void;
  fetchAlarmList: () => Promise<void>;
  fetchAlarmListWithQuery: (query: AlarmQueryState) => Promise<void>;
  changeAlarmStatus: (params: {
    alarmId: string;
    action: 'ack' | 'ignore' | 'resolve';
    operator: string;
  }) => Promise<void>;
  setOperationQuery: (patch: Partial<OperationQueryState>, resetPage?: boolean) => void;
  fetchOperationLogs: () => Promise<void>;
  fetchOperationLogsWithQuery: (query: OperationQueryState) => Promise<void>;
  bulkAction: (params: {
    action: 'delete' | 'enable' | 'disable' | 'export';
    deviceIds: string[];
    operator: string;
  }) => Promise<void>;
}

const DeviceStoreContext = createContext<DeviceStoreValue | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setListQuery = useCallback((patch: Partial<DeviceListQueryState>, resetPage = true) => {
    dispatch({ type: 'LIST_QUERY_SET', payload: patch, resetPage });
  }, []);

  const fetchDeviceListWithQuery = useCallback(async (query: DeviceListQueryState) => {
    dispatch({ type: 'LIST_LOADING' });
    try {
      const result = await getDeviceList(query);
      dispatch({ type: 'LIST_SUCCESS', payload: result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load device list.';
      dispatch({ type: 'LIST_ERROR', payload: message });
    }
  }, []);

  const fetchDeviceList = useCallback(async () => {
    await fetchDeviceListWithQuery(state.listQuery);
  }, [fetchDeviceListWithQuery, state.listQuery]);

  const fetchDeviceDetail = useCallback(async (deviceId: string) => {
    dispatch({ type: 'DETAIL_LOADING', payload: { deviceId } });
    try {
      const result = await getDeviceDetail(deviceId);
      dispatch({ type: 'DETAIL_SUCCESS', payload: { deviceId, data: result } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load device detail.';
      dispatch({ type: 'DETAIL_ERROR', payload: { deviceId, error: message } });
    }
  }, []);

  const fetchDeviceMonitor = useCallback(async (deviceId: string) => {
    dispatch({ type: 'MONITOR_LOADING', payload: { deviceId } });
    try {
      const result = await getDeviceMonitor(deviceId);
      dispatch({ type: 'MONITOR_SUCCESS', payload: { deviceId, data: result } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load device monitor.';
      dispatch({ type: 'MONITOR_ERROR', payload: { deviceId, error: message } });
    }
  }, []);

  const fetchDeviceHistory = useCallback(
    async (params: {
      deviceId: string;
      metricKey: MonitorMetric['key'];
      from: string;
      to: string;
    }) => {
      const key = `${params.deviceId}:${params.metricKey}:${params.from}:${params.to}`;
      dispatch({ type: 'HISTORY_LOADING', payload: { key } });
      try {
        const result = await getDeviceHistory(params);
        dispatch({ type: 'HISTORY_SUCCESS', payload: { key, data: result } });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load history.';
        dispatch({ type: 'HISTORY_ERROR', payload: { key, error: message } });
      }
    },
    []
  );

  const setAlarmQuery = useCallback((patch: Partial<AlarmQueryState>, resetPage = true) => {
    dispatch({ type: 'ALARM_QUERY_SET', payload: patch, resetPage });
  }, []);

  const fetchAlarmListWithQuery = useCallback(async (query: AlarmQueryState) => {
    dispatch({ type: 'ALARM_LOADING' });
    try {
      const params = {
        ...query,
        deviceId: query.deviceId || undefined
      };
      const result = await getAlarmList(params);
      dispatch({ type: 'ALARM_SUCCESS', payload: result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load alarms.';
      dispatch({ type: 'ALARM_ERROR', payload: message });
    }
  }, []);

  const fetchAlarmList = useCallback(async () => {
    await fetchAlarmListWithQuery(state.alarmQuery);
  }, [fetchAlarmListWithQuery, state.alarmQuery]);

  const changeAlarmStatus = useCallback(
    async (params: { alarmId: string; action: 'ack' | 'ignore' | 'resolve'; operator: string }) => {
      await setAlarmStatus(params);
      await fetchAlarmList();
      await fetchDeviceList();
    },
    [fetchAlarmList, fetchDeviceList]
  );

  const setOperationQuery = useCallback((patch: Partial<OperationQueryState>, resetPage = true) => {
    dispatch({ type: 'OP_QUERY_SET', payload: patch, resetPage });
  }, []);

  const fetchOperationLogsWithQuery = useCallback(async (query: OperationQueryState) => {
    dispatch({ type: 'OP_LOADING' });
    try {
      const params = {
        ...query,
        deviceId: query.deviceId || undefined,
        from: query.from || undefined,
        to: query.to || undefined
      };
      const result = await getOperationLogs(params);
      dispatch({ type: 'OP_SUCCESS', payload: result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load operation logs.';
      dispatch({ type: 'OP_ERROR', payload: message });
    }
  }, []);

  const fetchOperationLogsAction = useCallback(async () => {
    await fetchOperationLogsWithQuery(state.operationQuery);
  }, [fetchOperationLogsWithQuery, state.operationQuery]);

  const bulkAction = useCallback(
    async (params: {
      action: 'delete' | 'enable' | 'disable' | 'export';
      deviceIds: string[];
      operator: string;
    }) => {
      if (params.deviceIds.length === 0) {
        return;
      }

      await bulkDeviceAction(params);
      await fetchDeviceList();
      await fetchOperationLogsAction();
    },
    [fetchDeviceList, fetchOperationLogsAction]
  );

  const value = useMemo<DeviceStoreValue>(
    () => ({
      ...state,
      setListQuery,
      fetchDeviceList,
      fetchDeviceListWithQuery,
      fetchDeviceDetail,
      fetchDeviceMonitor,
      fetchDeviceHistory,
      setAlarmQuery,
      fetchAlarmList,
      fetchAlarmListWithQuery,
      changeAlarmStatus,
      setOperationQuery,
      fetchOperationLogs: fetchOperationLogsAction,
      fetchOperationLogsWithQuery,
      bulkAction
    }),
    [
      bulkAction,
      changeAlarmStatus,
      fetchAlarmList,
      fetchAlarmListWithQuery,
      fetchDeviceDetail,
      fetchDeviceHistory,
      fetchDeviceList,
      fetchDeviceListWithQuery,
      fetchDeviceMonitor,
      fetchOperationLogsAction,
      fetchOperationLogsWithQuery,
      setAlarmQuery,
      setListQuery,
      setOperationQuery,
      state
    ]
  );

  return <DeviceStoreContext.Provider value={value}>{children}</DeviceStoreContext.Provider>;
}

export function useDeviceStore(): DeviceStoreValue {
  const context = useContext(DeviceStoreContext);
  if (!context) {
    throw new Error('useDeviceStore must be used within DeviceProvider.');
  }
  return context;
}
