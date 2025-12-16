'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Play, Square, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CreateInstanceDialog } from '@/components/instances/create-instance-dialog';

interface Instance {
  id: string;
  name: string;
  status: string;
  platform: string;
  startUrl: string;
  currentUrl?: string;
  proxy?: { ip: string; port: number };
  createdAt: string;
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      const response = await fetch('/api/instances');
      const data = await response.json();
      setInstances(data?.instances || []);
    } catch (error) {
      console.error('Error fetching instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await fetch(`/api/instances/${id}/start`, { method: 'POST' });
      await fetchInstances();
    } catch (error) {
      console.error('Error starting instance:', error);
    }
  };

  const handleStop = async (id: string) => {
    try {
      await fetch(`/api/instances/${id}/stop`, { method: 'POST' });
      await fetchInstances();
    } catch (error) {
      console.error('Error stopping instance:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this instance?')) return;

    try {
      await fetch(`/api/instances/${id}`, { method: 'DELETE' });
      await fetchInstances();
    } catch (error) {
      console.error('Error deleting instance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-500',
      STARTING: 'bg-blue-500/10 text-blue-500',
      RUNNING: 'bg-green-500/10 text-green-500',
      STOPPING: 'bg-orange-500/10 text-orange-500',
      STOPPED: 'bg-slate-500/10 text-slate-500',
      ERROR: 'bg-red-500/10 text-red-500',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Browser Instances</h1>
          <p className="text-slate-400">Manage and monitor your browser instances</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Instance
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading instances...</div>
      ) : instances.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400 mb-4">No instances yet. Create your first instance to get started!</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Instance
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <Card key={instance.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{instance.name}</CardTitle>
                    <p className="text-sm text-slate-400 mt-1">{instance.platform}</p>
                  </div>
                  <Badge className={getStatusColor(instance.status)}>
                    {instance.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Start URL:</span>
                    <p className="text-slate-300 truncate">{instance.startUrl}</p>
                  </div>
                  {instance.currentUrl && (
                    <div>
                      <span className="text-slate-500">Current URL:</span>
                      <p className="text-slate-300 truncate">{instance.currentUrl}</p>
                    </div>
                  )}
                  {instance.proxy && (
                    <div>
                      <span className="text-slate-500">Proxy:</span>
                      <p className="text-slate-300">{instance.proxy.ip}:{instance.proxy.port}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {instance.status === 'RUNNING' ? (
                    <Button
                      onClick={() => handleStop(instance.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-900/50 text-red-500 hover:bg-red-900/20"
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStart(instance.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-900/50 text-green-500 hover:bg-green-900/20"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(instance.id)}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateInstanceDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          fetchInstances();
        }}
      />
    </div>
  );
}
