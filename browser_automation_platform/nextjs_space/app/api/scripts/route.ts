import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scripts = await prisma.script.findMany({
      where: {
        OR: [
          { isPublic: true },
          { authorId: (session.user as any).id },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ scripts });
  } catch (error) {
    console.error('Error fetching scripts:', error);
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
    const { name, description, platform, code, isPublic } = body;

    if (!name || !platform || !code) {
      return NextResponse.json(
        { error: 'Name, platform, and code are required' },
        { status: 400 }
      );
    }

    const script = await prisma.script.create({
      data: {
        name,
        description,
        platform,
        code,
        isPublic: isPublic || false,
        authorId: (session.user as any).id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ script }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating script:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
