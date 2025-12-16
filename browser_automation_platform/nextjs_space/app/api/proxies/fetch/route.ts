import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProxyService } from '@/lib/services/proxy.service';

export const dynamic = 'force-dynamic';

const proxyService = ProxyService.getInstance();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await proxyService.importAndValidateProxies();

    return NextResponse.json({ message: `Imported ${count} proxies`, count });
  } catch (error: any) {
    console.error('Error fetching proxies:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
