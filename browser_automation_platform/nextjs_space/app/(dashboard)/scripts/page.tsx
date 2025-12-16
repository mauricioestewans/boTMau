'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode, Youtube, Music, Disc, Video } from 'lucide-react';

interface Script {
  id: string;
  name: string;
  description?: string;
  platform: string;
  isPublic: boolean;
  author: {
    name?: string;
    email: string;
  };
  createdAt: string;
}

const platformIcons: Record<string, any> = {
  YOUTUBE: Youtube,
  SPOTIFY: Music,
  DEEZER: Disc,
  TIKTOK: Video,
  CUSTOM: FileCode,
};

const platformColors: Record<string, string> = {
  YOUTUBE: 'bg-red-500/10 text-red-500',
  SPOTIFY: 'bg-green-500/10 text-green-500',
  DEEZER: 'bg-purple-500/10 text-purple-500',
  TIKTOK: 'bg-pink-500/10 text-pink-500',
  CUSTOM: 'bg-blue-500/10 text-blue-500',
};

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/scripts');
      const data = await response.json();
      setScripts(data?.scripts || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Automation Scripts</h1>
          <p className="text-slate-400">Pre-built scripts for different platforms</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading scripts...</div>
      ) : scripts.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">No scripts available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => {
            const Icon = platformIcons[script?.platform] || FileCode;
            return (
              <Card key={script?.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platformColors[script?.platform] || 'bg-blue-500/10'}`}>
                        <Icon className={`w-5 h-5 ${platformColors[script?.platform]?.replace('/10', '') || 'text-blue-500'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{script?.name}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">{script?.platform}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-slate-300 text-sm line-clamp-3">
                    {script?.description || 'No description available'}
                  </CardDescription>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="text-xs text-slate-500">
                      by {script?.author?.name || script?.author?.email?.split('@')[0]}
                    </div>
                    {script?.isPublic && (
                      <Badge variant="outline" className="border-green-900/50 text-green-500 text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">About Automation Scripts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <p>
            Automation scripts are JavaScript snippets that run in the browser context to perform
            platform-specific actions such as:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>YouTube:</strong> Auto-skip ads, prevent pause, simulate user activity</li>
            <li><strong>Spotify:</strong> Prevent pause, close inactivity modals</li>
            <li><strong>Deezer:</strong> Prevent pause, accept cookies, close popups</li>
            <li><strong>TikTok:</strong> Auto-scroll videos, prevent pause</li>
            <li><strong>Universal:</strong> Close popups, remove overlays, simulate human behavior</li>
          </ul>
          <p className="text-slate-400 text-xs mt-4">
            All scripts are automatically applied to instances based on the selected platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
