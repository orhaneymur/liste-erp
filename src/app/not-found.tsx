import Link from "next/link";

export default function Bulunamadi() {
  return (
    <div className="kart mx-auto max-w-md p-10 text-center">
      <h1 className="text-base font-medium text-metin">Sayfa bulunamadı</h1>
      <p className="mt-1.5 text-sm text-metin-2">
        Aradığınız model listeden kalkmış olabilir.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-lg bg-metin px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Listeye dön
      </Link>
    </div>
  );
}
