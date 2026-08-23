import React from 'react';

/**
 * Renders video media cleanly whether it's YouTube, Vimeo, direct MP4, or a base64 video object.
 */
export function renderVideoMedia(videoUrl: string | undefined, className: string = "w-full aspect-video rounded-xl overflow-hidden") {
  if (!videoUrl) return null;

  // YouTube match
  const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return (
      <div className={`relative ${className} bg-black`}>
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          title="Shared Video Tribute"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // Vimeo match
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return (
      <div className={`relative ${className} bg-black`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[3]}`}
          title="Shared Video Tribute"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // HTML5 Video
  return (
    <div className={`relative ${className} bg-black`}>
      <video
        src={videoUrl}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
