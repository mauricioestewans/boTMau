import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, InstanceStatus } from '@prisma/client';
import { getRandomUserAgent } from '@/lib/utils/user-agents';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instances = await prisma.instance.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        proxy: true,
        script: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ instances });
  } catch (error) {
    console.error('Error fetching instances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, platform, startUrl, proxyId, scriptId } = body;

    if (!name || !platform || !startUrl) {
      return NextResponse.json(
        { error: 'Name, platform, and startUrl are required' },
        { status: 400 }
      );
    }

    const instance = await prisma.instance.create({
      data: {
        name,
        platform,
        startUrl,
        proxyId: proxyId || null,
        scriptId: scriptId || null,
        userId: (session.user as any).id,
        status: InstanceStatus.PENDING,
        userAgent: getRandomUserAgent(),
      },
      include: {
        proxy: true,
        script: true,
      },
    });

    return NextResponse.json({ instance }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
