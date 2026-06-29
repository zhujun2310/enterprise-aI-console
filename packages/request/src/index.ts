export interface RequestConfig {
  baseURL: string;
  timeout?: number;
}

export function createRequestConfig(config: RequestConfig): RequestConfig {
  return {
    timeout: 10000,
    ...config
  };
}
