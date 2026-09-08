import Link from "next/link";

export default function Bulunamadi() {
  return (
    <div className="yuzey mx-auto max-w-md rounded-kart p-12 text-center">
      <h1 className="text-base font-medium text-metin">Sayfa bulunamadı</h1>
      <p className="mt-2 text-sm text-metin-2">
        Aradığınız model listeden kalkmış olabilir.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-gradient-to-r from-mavi to-mor px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
      >
        Listeye dön
      </Link>
    </div>
  );
}
