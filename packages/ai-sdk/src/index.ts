export interface AiSdkConfig {
  baseUrl: string;
  model: string;
}

export function createAiSdk(config: AiSdkConfig): AiSdkConfig {
  return config;
}
