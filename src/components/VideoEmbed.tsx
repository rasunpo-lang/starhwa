export default function VideoEmbed({
  videoId,
  title,
  start,
}: {
  videoId: string;
  title: string;
  /** Optional start offset in seconds. */
  start?: number;
}) {
  return (
    <div className="border border-line bg-ink">
      <div className="relative aspect-video">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}${start ? `?start=${start}` : ""}`}
          title={`Video: ${title}`}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
