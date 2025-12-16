'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateInstanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Proxy {
  id: string;
  ip: string;
  port: number;
  status?: string;
}

interface Script {
  id: string;
  name: string;
  platform: string;
}

export function CreateInstanceDialog({ open, onClose, onSuccess }: CreateInstanceDialogProps) {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('YOUTUBE');
  const [startUrl, setStartUrl] = useState('');
  const [proxyId, setProxyId] = useState('');
  const [scriptId, setScriptId] = useState('');
  const [loading, setLoading] = useState(false);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);

  useEffect(() => {
    if (open) {
      fetchProxies();
      fetchScripts();
    }
  }, [open]);

  const fetchProxies = async () => {
    try {
      const response = await fetch('/api/proxies');
      const data = await response.json();
      setProxies(data?.proxies || []);
    } catch (error) {
      console.error('Error fetching proxies:', error);
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/scripts');
      const data = await response.json();
      setScripts(data?.scripts || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          platform,
          startUrl,
          proxyId: proxyId || null,
          scriptId: scriptId || null,
        }),
      });

      if (response.ok) {
        onSuccess();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating instance:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPlatform('YOUTUBE');
    setStartUrl('');
    setProxyId('');
    setScriptId('');
  };

  const defaultUrls: Record<string, string> = {
    YOUTUBE: 'https://www.youtube.com',
    SPOTIFY: 'https://www.spotify.com',
    DEEZER: 'https://www.deezer.com',
    TIKTOK: 'https://www.tiktok.com',
    CUSTOM: '',
  };

  const handlePlatformChange = (value: string) => {
    setPlatform(value);
    setStartUrl(defaultUrls[value] || '');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Instance</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure a new browser instance for automation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Instance Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My YouTube Instance"
                required
                className="bg-slate-950 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={handlePlatformChange}>
                <SelectTrigger className="bg-slate-950 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="YOUTUBE">YouTube</SelectItem>
                  <SelectItem value="SPOTIFY">Spotify</SelectItem>
                  <SelectItem value="DEEZER">Deezer</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startUrl">Start URL</Label>
              <Input
                id="startUrl"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                placeholder="https://"
                required
                className="bg-slate-950 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proxy">Proxy (Optional)</Label>
              <Select value={proxyId} onValueChange={setProxyId}>
                <SelectTrigger className="bg-slate-950 border-slate-700">
                  <SelectValue placeholder="Select a proxy" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="none">No Proxy</SelectItem>
                  {proxies.filter(p => p?.status === 'HEALTHY').map((proxy) => (
                    <SelectItem key={proxy?.id} value={proxy?.id}>
                      {proxy?.ip}:{proxy?.port}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="script">Automation Script (Optional)</Label>
              <Select value={scriptId} onValueChange={setScriptId}>
                <SelectTrigger className="bg-slate-950 border-slate-700">
                  <SelectValue placeholder="Select a script" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="none">Default Script</SelectItem>
                  {scripts.filter(s => s?.platform === platform).map((script) => (
                    <SelectItem key={script?.id} value={script?.id}>
                      {script?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : 'Create Instance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
