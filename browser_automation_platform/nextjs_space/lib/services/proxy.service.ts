import axios from 'axios';
import { PrismaClient, Proxy, ProxyStatus, ProxySource } from '@prisma/client';
import { PROXY_SOURCES } from '../constants';

const prisma = new PrismaClient();

export class ProxyService {
  private static instance: ProxyService;

  static getInstance(): ProxyService {
    if (!ProxyService.instance) {
      ProxyService.instance = new ProxyService();
    }
    return ProxyService.instance;
  }

  async fetchFreeProxies(): Promise<string[]> {
    const allProxies: string[] = [];

    for (const source of PROXY_SOURCES) {
      try {
        const response = await axios.get(source, { timeout: 10000 });
        const proxies = response.data
          .split('\n')
          .filter((line: string) => line.trim() && line.includes(':'));
        allProxies.push(...proxies);
        console.log(`Fetched ${proxies.length} proxies from ${source}`);
      } catch (error) {
        console.error(`Error fetching from ${source}:`, error);
      }
    }

    return [...new Set(allProxies)];
  }

  async validateProxy(proxyString: string): Promise<{ valid: boolean; latency?: number }> {
    const [ip, port] = proxyString.split(':');
    const startTime = Date.now();

    try {
      const response = await axios.get('http://httpbin.org/ip', {
        proxy: {
          host: ip,
          port: parseInt(port),
        },
        timeout: 15000,
      });

      if (response.status === 200) {
        const latency = Date.now() - startTime;
        return { valid: true, latency };
      }
    } catch (error) {
      return { valid: false };
    }

    return { valid: false };
  }

  async importAndValidateProxies(): Promise<number> {
    const proxyStrings = await this.fetchFreeProxies();
    let validCount = 0;

    console.log(`Validating ${proxyStrings.length} proxies...`);

    for (const proxyString of proxyStrings.slice(0, 100)) {
      const [ip, port] = proxyString.split(':');
      if (!ip || !port) continue;

      const validation = await this.validateProxy(proxyString);

      if (validation.valid) {
        try {
          await prisma.proxy.upsert({
            where: { ip_port: { ip, port: parseInt(port) } },
            update: {
              status: ProxyStatus.HEALTHY,
              lastValidated: new Date(),
              avgLatency: validation.latency,
            },
            create: {
              ip,
              port: parseInt(port),
              status: ProxyStatus.HEALTHY,
              source: ProxySource.FREE,
              lastValidated: new Date(),
              avgLatency: validation.latency,
            },
          });
          validCount++;
        } catch (error) {
          console.error('Error saving proxy:', error);
        }
      }
    }

    console.log(`Imported ${validCount} valid proxies`);
    return validCount;
  }

  async getHealthyProxies(limit: number = 10): Promise<Proxy[]> {
    return prisma.proxy.findMany({
      where: {
        status: ProxyStatus.HEALTHY,
      },
      orderBy: {
        lastUsed: 'asc',
      },
      take: limit,
    });
  }

  async markProxyAsUsed(proxyId: string): Promise<void> {
    await prisma.proxy.update({
      where: { id: proxyId },
      data: { lastUsed: new Date() },
    });
  }

  async updateProxyStatus(proxyId: string, status: ProxyStatus): Promise<void> {
    await prisma.proxy.update({
      where: { id: proxyId },
      data: { status },
    });
  }
}
