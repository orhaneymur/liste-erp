/** Sayfa hazirlanirken gosterilen iskelet — bos ekran yerine yapiyi gosterir */
export default function Yukleniyor() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-56 rounded bg-zemin-2" />
      <div className="mb-2 h-4 w-72 rounded bg-zemin-2" />
      <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-[10px] border border-kenar" />
        ))}
      </div>
    </div>
  );
}
