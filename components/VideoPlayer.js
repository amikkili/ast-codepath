'use client'

export default function VideoPlayer({ videoId, title }) {
  if (!videoId || videoId === 'REPLACE_WITH_YOUR_CLOUDFLARE_VIDEO_ID') {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-[#534AB7] flex items-center justify-center">
          <span className="text-white text-xl ml-0.5">▶</span>
        </div>
        <p className="text-xs text-[#5a6278] text-center px-4">
          Video not configured yet.<br />
          Upload to Cloudflare Stream and paste the Video ID in the admin panel.
        </p>
      </div>
    )
  }

  return (
    <iframe
      src={`https://iframe.cloudflarestream.com/${videoId}?preload=true&poster=https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`}
      title={title || 'Lesson video'}
      className="w-full h-full border-none"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  )
}
