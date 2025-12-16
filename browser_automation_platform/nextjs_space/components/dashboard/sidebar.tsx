'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Globe, LayoutDashboard, MonitorPlay, Wifi, FileCode, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Instances', href: '/instances', icon: MonitorPlay },
  { name: 'Proxies', href: '/proxies', icon: Wifi },
  { name: 'Scripts', href: '/scripts', icon: FileCode },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <Globe className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-lg font-bold text-white">Browser</h1>
            <p className="text-xs text-slate-400">Automation</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
