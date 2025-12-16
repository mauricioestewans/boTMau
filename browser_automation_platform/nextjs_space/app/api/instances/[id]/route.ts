import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
      include: {
        proxy: true,
        script: true,
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    return NextResponse.json({ instance });
  } catch (error) {
    console.error('Error fetching instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, startUrl, proxyId, scriptId } = body;

    const instance = await prisma.instance.updateMany({
      where: {
        id: params.id,
        userId: (session.user as any).id,
      },
      data: {
        ...(name ? { name } : {}),
        ...(startUrl ? { startUrl } : {}),
        ...(proxyId !== undefined ? { proxyId } : {}),
        ...(scriptId !== undefined ? { scriptId } : {}),
      },
    });

    if (instance.count === 0) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    const updatedInstance = await prisma.instance.findUnique({
      where: { id: params.id },
      include: { proxy: true, script: true },
    });

    return NextResponse.json({ instance: updatedInstance });
  } catch (error) {
    console.error('Error updating instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.instance.deleteMany({
      where: {
        id: params.id,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ message: 'Instance deleted successfully' });
  } catch (error) {
    console.error('Error deleting instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
