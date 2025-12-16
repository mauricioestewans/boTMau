'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Plus, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddProxyDialog } from '@/components/proxies/add-proxy-dialog';

interface Proxy {
  id: string;
  ip: string;
  port: number;
  status: string;
  country?: string;
  avgLatency?: number;
  lastValidated?: string;
  source: string;
}

export default function ProxiesPage() {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchProxies();
  }, []);

  const fetchProxies = async () => {
    try {
      const response = await fetch('/api/proxies');
      const data = await response.json();
      setProxies(data?.proxies || []);
    } catch (error) {
      console.error('Error fetching proxies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportProxies = async () => {
    setImporting(true);
    try {
      const response = await fetch('/api/proxies/fetch', { method: 'POST' });
      const data = await response.json();
      alert(`Imported ${data?.count || 0} proxies successfully!`);
      await fetchProxies();
    } catch (error) {
      console.error('Error importing proxies:', error);
      alert('Failed to import proxies');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteProxy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proxy?')) return;

    try {
      await fetch(`/api/proxies/${id}`, { method: 'DELETE' });
      await fetchProxies();
    } catch (error) {
      console.error('Error deleting proxy:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'DEGRADED':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'DOWN':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'UNTESTED':
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      HEALTHY: 'bg-green-500/10 text-green-500',
      DEGRADED: 'bg-yellow-500/10 text-yellow-500',
      DOWN: 'bg-red-500/10 text-red-500',
      UNTESTED: 'bg-slate-500/10 text-slate-500',
      BLACKLISTED: 'bg-red-900/20 text-red-400',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-500';
  };

  const stats = {
    total: proxies.length,
    healthy: proxies.filter((p) => p?.status === 'HEALTHY').length,
    degraded: proxies.filter((p) => p?.status === 'DEGRADED').length,
    down: proxies.filter((p) => p?.status === 'DOWN').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Proxies</h1>
          <p className="text-slate-400">Manage and validate proxy servers</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleImportProxies}
            disabled={importing}
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            {importing ? 'Importing...' : 'Import Free Proxies'}
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Proxy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total Proxies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.healthy}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Degraded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.degraded}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Down</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.down}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading proxies...</div>
      ) : proxies.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400 mb-4">No proxies available. Import or add proxies to get started!</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleImportProxies} variant="outline" className="border-slate-700">
                <Download className="w-4 h-4 mr-2" />
                Import Free Proxies
              </Button>
              <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Proxy
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800">
                  <tr className="text-left text-sm text-slate-400">
                    <th className="p-4">Status</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Port</th>
                    <th className="p-4">Country</th>
                    <th className="p-4">Latency</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proxies.map((proxy) => (
                    <tr key={proxy.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(proxy.status)}
                          <Badge className={getStatusColor(proxy.status)}>
                            {proxy.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 text-white font-mono">{proxy.ip}</td>
                      <td className="p-4 text-white">{proxy.port}</td>
                      <td className="p-4 text-slate-300">{proxy.country || '-'}</td>
                      <td className="p-4 text-slate-300">
                        {proxy.avgLatency ? `${Math.round(proxy.avgLatency)}ms` : '-'}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-slate-700 text-slate-400">
                          {proxy.source}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          onClick={() => handleDeleteProxy(proxy.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AddProxyDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => {
          setShowAddDialog(false);
          fetchProxies();
        }}
      />
    </div>
  );
}
