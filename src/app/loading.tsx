/** Sayfa hazirlanirken gosterilen iskelet — bos ekran yerine yapiyi gosterir */
export default function Yukleniyor() {
  return (
    <div className="animate-pulse">
      <div className="mb-3 h-3 w-24 rounded bg-yuzey-2" />
      <div className="mb-8 h-8 w-64 rounded bg-yuzey-2" />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="yuzey h-[76px] rounded-kart" />
        ))}
      </div>
    </div>
  );
}
