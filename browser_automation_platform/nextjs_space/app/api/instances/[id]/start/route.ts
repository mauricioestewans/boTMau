import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BrowserManagerService } from '@/lib/services/browser-manager.service';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const browserManager = new BrowserManagerService();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instance = await prisma.instance.findFirst({
      where: {
        id: params.id,
        userId: (session.user as any).id,
      },
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    if (browserManager.isInstanceRunning(params.id)) {
      return NextResponse.json({ error: 'Instance is already running' }, { status: 400 });
    }

    await browserManager.createInstance(params.id);

    return NextResponse.json({ message: 'Instance started successfully' });
  } catch (error: any) {
    console.error('Error starting instance:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
