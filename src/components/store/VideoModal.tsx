'use client';

import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

function getEmbedUrl(videoUrl: string): string {
  try {
    const url = new URL(videoUrl);
    const isYouTube = url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
    const isVimeo = url.hostname.includes('vimeo.com');

    if (isYouTube) {
      let videoId = '';
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v') || '';
      } else if (url.pathname.startsWith('/embed/')) {
        videoId = url.pathname.replace('/embed/', '');
      } else if (url.pathname.startsWith('/shorts/')) {
        videoId = url.pathname.replace('/shorts/', '');
      } else {
        videoId = url.pathname.replace(/^\//, '');
      }
      if (!videoId) return videoUrl;
      return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    }

    if (isVimeo) {
      const videoId = url.pathname.replace(/^\//, '');
      if (!videoId) return videoUrl;
      return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?autoplay=1`;
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  if (!isOpen) return null;

  const embedUrl = getEmbedUrl(videoUrl);
  const isEmbed = embedUrl !== videoUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">{title || 'Factory & Facility Reel'}</DialogTitle>
        <div className="relative aspect-video w-full">
          {isEmbed && (
            <iframe
              src={embedUrl}
              title={title || 'Factory & Facility Reel'}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {!isEmbed && videoUrl && (
            <video
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              controls
            />
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Close video"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}