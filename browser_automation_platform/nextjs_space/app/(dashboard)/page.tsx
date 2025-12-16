'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitorPlay, Wifi, CheckCircle, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Stats {
  totalInstances: number;
  runningInstances: number;
  totalProxies: number;
  healthyProxies: number;
}

export default function DashboardPage() {
  const { data: session } = useSession() || {};
  const [stats, setStats] = useState<Stats>({
    totalInstances: 0,
    runningInstances: 0,
    totalProxies: 0,
    healthyProxies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [instancesRes, proxiesRes] = await Promise.all([
        fetch('/api/instances'),
        fetch('/api/proxies'),
      ]);

      const instancesData = await instancesRes.json();
      const proxiesData = await proxiesRes.json();

      setStats({
        totalInstances: instancesData?.instances?.length || 0,
        runningInstances: instancesData?.instances?.filter((i: any) => i?.status === 'RUNNING')?.length || 0,
        totalProxies: proxiesData?.proxies?.length || 0,
        healthyProxies: proxiesData?.proxies?.filter((p: any) => p?.status === 'HEALTHY')?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Instances',
      value: stats.totalInstances,
      icon: MonitorPlay,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Running Instances',
      value: stats.runningInstances,
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Proxies',
      value: stats.totalProxies,
      icon: Wifi,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Healthy Proxies',
      value: stats.healthyProxies,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Welcome back, {session?.user?.name || 'User'}! Manage your browser automation platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {loading ? '-' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/instances">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                <MonitorPlay className="w-5 h-5 mr-2" />
                Create New Instance
              </Button>
            </Link>
            <Link href="/proxies">
              <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800" size="lg">
                <Wifi className="w-5 h-5 mr-2" />
                Manage Proxies
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-white">Add proxies</p>
                <p className="text-xs text-slate-400">Import or add proxies manually</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-white">Create an instance</p>
                <p className="text-xs text-slate-400">Configure and start a browser instance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-white">Monitor automation</p>
                <p className="text-xs text-slate-400">Track status and logs in real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
