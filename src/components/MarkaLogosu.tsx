import { logoYolu } from "@/lib/logolar";

/**
 * Marka logosu.
 *
 * Logolar yerel ve cok kucuk SVG dosyalari oldugu icin next/image yerine
 * dogrudan <img> kullaniyoruz: ek optimizasyon gereksiz, boylece daha hizli.
 */
export function MarkaLogosu({
  marka,
  className = "size-full object-contain",
}: {
  marka: string;
  className?: string;
}) {
  return (
    <img
      src={logoYolu(marka)}
      alt={`${marka} logosu`}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
