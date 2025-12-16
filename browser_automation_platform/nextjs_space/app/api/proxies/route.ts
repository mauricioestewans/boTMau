import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, ProxySource } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proxies = await prisma.proxy.findMany({
      orderBy: [
        { status: 'asc' },
        { avgLatency: 'asc' },
      ],
    });

    return NextResponse.json({ proxies });
  } catch (error) {
    console.error('Error fetching proxies:', error);
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
    const { ip, port, username, password } = body;

    if (!ip || !port) {
      return NextResponse.json({ error: 'IP and port are required' }, { status: 400 });
    }

    const proxy = await prisma.proxy.create({
      data: {
        ip,
        port: parseInt(port),
        username,
        password,
        source: ProxySource.MANUAL,
      },
    });

    return NextResponse.json({ proxy }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
