import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { PrismaClient, Instance, InstanceStatus } from '@prisma/client';
import { getRandomUserAgent } from '../utils/user-agents';
import { ANTI_DETECT_SCRIPT, getAntiDetectArgs } from '../utils/anti-detect';
import { ProxyService } from './proxy.service';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

interface BrowserInstance {
  instance: Instance;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  automationInterval?: NodeJS.Timeout;
}

export class BrowserManagerService {
  private static instances: Map<string, BrowserInstance> = new Map();
  private proxyService = ProxyService.getInstance();

  async createInstance(instanceId: string): Promise<void> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
      include: { proxy: true, script: true },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    await this.updateInstanceStatus(instanceId, InstanceStatus.STARTING);

    try {
      const profilePath = path.join(process.cwd(), 'profiles', instanceId);
      if (!fs.existsSync(profilePath)) {
        fs.mkdirSync(profilePath, { recursive: true });
      }

      const launchOptions: any = {
        headless: false,
        args: getAntiDetectArgs(),
      };

      if (instance.proxy) {
        launchOptions.proxy = {
          server: `http://${instance.proxy.ip}:${instance.proxy.port}`,
          username: instance.proxy.username || undefined,
          password: instance.proxy.password || undefined,
        };
      }

      const browser = await chromium.launch(launchOptions);

      const context = await browser.newContext({
        userAgent: instance.userAgent,
        viewport: {
          width: parseInt(instance.windowSize.split('x')[0] || '1280'),
          height: parseInt(instance.windowSize.split('x')[1] || '720'),
        },
        locale: 'en-US',
        timezoneId: 'America/New_York',
      });

      const page = await context.newPage();

      await page.addInitScript(ANTI_DETECT_SCRIPT);

      await page.goto(instance.startUrl, { waitUntil: 'domcontentloaded' });

      await this.injectPlatformScript(page, instance.platform);

      BrowserManagerService.instances.set(instanceId, {
        instance,
        browser,
        context,
        page,
      });

      await this.updateInstanceStatus(instanceId, InstanceStatus.RUNNING);
      await this.updateInstanceUrl(instanceId, instance.startUrl);

      this.startAutomation(instanceId);

      console.log(`Instance ${instanceId} started successfully`);
    } catch (error: any) {
      console.error(`Error starting instance ${instanceId}:`, error);
      await this.updateInstanceStatus(instanceId, InstanceStatus.ERROR, error?.message);
    }
  }

  private async injectPlatformScript(page: Page, platform: string): Promise<void> {
    try {
      const scriptMap: Record<string, string> = {
        YOUTUBE: 'youtube.js',
        SPOTIFY: 'spotify.js',
        DEEZER: 'deezer.js',
        TIKTOK: 'tiktok.js',
        CUSTOM: 'universal.js',
      };

      const scriptFile = scriptMap[platform] || 'universal.js';
      const scriptPath = path.join(process.cwd(), 'public', 'scripts', scriptFile);

      if (fs.existsSync(scriptPath)) {
        const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
        await page.evaluate(scriptContent);
        console.log(`Injected ${scriptFile} script`);
      }

      const universalScriptPath = path.join(process.cwd(), 'public', 'scripts', 'universal.js');
      if (fs.existsSync(universalScriptPath) && platform !== 'CUSTOM') {
        const universalScript = fs.readFileSync(universalScriptPath, 'utf-8');
        await page.evaluate(universalScript);
        console.log('Injected universal script');
      }
    } catch (error) {
      console.error('Error injecting scripts:', error);
    }
  }

  private startAutomation(instanceId: string): void {
    const browserInstance = BrowserManagerService.instances.get(instanceId);
    if (!browserInstance) return;

    const interval = setInterval(async () => {
      try {
        const { page } = browserInstance;
        await this.updateInstanceUrl(instanceId, page.url());
        await this.logInstanceActivity(instanceId, 'Automation check');
      } catch (error) {
        console.error(`Automation error for ${instanceId}:`, error);
      }
    }, 30000);

    browserInstance.automationInterval = interval;
  }

  async stopInstance(instanceId: string): Promise<void> {
    const browserInstance = BrowserManagerService.instances.get(instanceId);
    if (!browserInstance) {
      throw new Error('Instance not running');
    }

    await this.updateInstanceStatus(instanceId, InstanceStatus.STOPPING);

    try {
      if (browserInstance.automationInterval) {
        clearInterval(browserInstance.automationInterval);
      }

      await browserInstance.browser.close();
      BrowserManagerService.instances.delete(instanceId);

      await this.updateInstanceStatus(instanceId, InstanceStatus.STOPPED);
      console.log(`Instance ${instanceId} stopped successfully`);
    } catch (error: any) {
      console.error(`Error stopping instance ${instanceId}:`, error);
      await this.updateInstanceStatus(instanceId, InstanceStatus.ERROR, error?.message);
    }
  }

  async navigateInstance(instanceId: string, url: string): Promise<void> {
    const browserInstance = BrowserManagerService.instances.get(instanceId);
    if (!browserInstance) {
      throw new Error('Instance not running');
    }

    try {
      await browserInstance.page.goto(url, { waitUntil: 'domcontentloaded' });
      await this.updateInstanceUrl(instanceId, url);
      await this.injectPlatformScript(browserInstance.page, browserInstance.instance.platform);
    } catch (error) {
      console.error(`Error navigating instance ${instanceId}:`, error);
      throw error;
    }
  }

  async takeScreenshot(instanceId: string): Promise<Buffer> {
    const browserInstance = BrowserManagerService.instances.get(instanceId);
    if (!browserInstance) {
      throw new Error('Instance not running');
    }

    return browserInstance.page.screenshot({ fullPage: false });
  }

  isInstanceRunning(instanceId: string): boolean {
    return BrowserManagerService.instances.has(instanceId);
  }

  private async updateInstanceStatus(
    instanceId: string,
    status: InstanceStatus,
    errorMessage?: string
  ): Promise<void> {
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        status,
        errorMessage,
        ...(status === InstanceStatus.RUNNING ? { startedAt: new Date() } : {}),
        ...(status === InstanceStatus.STOPPED ? { stoppedAt: new Date() } : {}),
      },
    });
  }

  private async updateInstanceUrl(instanceId: string, url: string): Promise<void> {
    await prisma.instance.update({
      where: { id: instanceId },
      data: { currentUrl: url, lastActivity: new Date() },
    });
  }

  private async logInstanceActivity(instanceId: string, message: string): Promise<void> {
    await prisma.instanceLog.create({
      data: {
        instanceId,
        level: 'INFO',
        message,
      },
    });
  }
}
