import { Instance, Proxy, Script, Job, InstanceStatus, Platform, ProxyStatus, LogLevel } from '@prisma/client';

export type { Instance, Proxy, Script, Job, InstanceStatus, Platform, ProxyStatus, LogLevel };

export interface BrowserConfig {
  userAgent: string;
  windowSize: string;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
  profilePath?: string;
}

export interface AntiDetectConfig {
  enableWebGL: boolean;
  enableCanvas: boolean;
  enableAudio: boolean;
  enableWebRTC: boolean;
  timezone?: string;
  locale?: string;
  platform?: string;
}

export interface InstanceMetrics {
  instanceId: string;
  cpuUsage: number;
  memoryUsage: number;
  networkIn: number;
  networkOut: number;
  timestamp: Date;
}

export interface ProxyValidationResult {
  proxy: Proxy;
  valid: boolean;
  latency?: number;
  error?: string;
}

export interface CreateInstanceInput {
  name: string;
  platform: Platform;
  startUrl: string;
  proxyId?: string;
  scriptId?: string;
}

export interface InstanceWithRelations extends Instance {
  proxy?: Proxy | null;
  script?: Script | null;
}
