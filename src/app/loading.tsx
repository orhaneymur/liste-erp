/** Sayfa gecislerinde gorunen iskelet yukleme ekrani */
export default function Yukleniyor() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 h-9 w-2/3 max-w-sm rounded-full bg-white/5" />
      <div className="mb-8 h-40 rounded-[1.75rem] bg-white/5" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-44 rounded-kart bg-white/5" />
        ))}
      </div>
    </div>
  );
}
