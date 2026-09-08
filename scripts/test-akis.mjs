/**
 * Uctan uca akis testi (sunucu ayakta olmali).
 *   node scripts/test-akis.mjs [adres]
 *
 * Sirayla: giris -> sablon indir -> sablonu yukle -> liste kontrol -> disa aktar
 * -> ayar kaydet -> cikis. Basarisiz adimda cikis kodu 1 doner.
 */

const adres = process.argv[2] ?? "http://localhost:3000";
const sifre = process.env.ADMIN_SIFRE ?? "admin123";

let cerez = "";
const sonuclar = [];

function kontrol(ad, kosul, ek = "") {
  sonuclar.push({ ad, gecti: !!kosul, ek });
  console.log(`${kosul ? "[OK]  " : "[HATA]"} ${ad}${ek ? " -> " + ek : ""}`);
}

async function istek(yol, secenek = {}) {
  const cevap = await fetch(adres + yol, {
    ...secenek,
    headers: { ...(secenek.headers ?? {}), ...(cerez ? { cookie: cerez } : {}) },
    redirect: "manual",
  });
  const kur = cevap.headers.getSetCookie?.() ?? [];
  for (const satir of kur) {
    const [ikili] = satir.split(";");
    if (ikili) cerez = ikili;
  }
  return cevap;
}

async function main() {
  // 1) Yetkisiz yukleme reddedilmeli
  const yetkisiz = await istek("/api/yukle", { method: "POST", body: new FormData() });
  kontrol("Yetkisiz yukleme reddedildi", yetkisiz.status === 401, "durum " + yetkisiz.status);

  // 2) Yanlis sifre reddedilmeli
  const yanlis = await istek("/api/giris", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sifre: "kesinlikle-yanlis" }),
  });
  kontrol("Yanlis sifre reddedildi", yanlis.status === 401, "durum " + yanlis.status);
  cerez = "";

  // 3) Dogru sifre ile giris
  const giris = await istek("/api/giris", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sifre }),
  });
  kontrol("Giris basarili", giris.ok && cerez.includes("="), "durum " + giris.status);
  if (!giris.ok) return;

  // 4) Sablon indir
  const sablon = await istek("/api/sablon");
  const sablonVeri = Buffer.from(await sablon.arrayBuffer());
  kontrol(
    "Sablon indirildi (.xlsx)",
    sablon.ok && sablonVeri.length > 5000 && sablonVeri.subarray(0, 2).toString() === "PK",
    sablonVeri.length + " bayt",
  );

  // 5) Sablonu geri yukle (ornek satirlar iceriyor)
  const form = new FormData();
  form.append("dosya", new Blob([sablonVeri]), "sablon.xlsx");
  const yukle = await istek("/api/yukle", { method: "POST", body: form });
  const rapor = await yukle.json();
  kontrol(
    "Sablon yuklendi",
    yukle.ok && rapor.eklenen > 0,
    yukle.ok ? `${rapor.eklenen} urun, ${rapor.atlanan} atlandi` : JSON.stringify(rapor),
  );

  // 6) Yuklenen veri sitede gorunuyor mu?
  const anaSayfa = await istek("/");
  const html = await anaSayfa.text();
  kontrol("Ana sayfa yuklenen markayi gosteriyor", anaSayfa.ok && /Apple|Samsung/.test(html));

  // 7) Arama API'si
  const ara = await istek("/api/ara?q=iphone");
  const aramaVeri = await ara.json();
  kontrol(
    "Arama sonuc dondurdu",
    ara.ok && Array.isArray(aramaVeri.sonuclar) && aramaVeri.sonuclar.length > 0,
    (aramaVeri.sonuclar?.length ?? 0) + " sonuc",
  );

  // 8) Disa aktar
  const aktar = await istek("/api/aktar");
  const aktarVeri = Buffer.from(await aktar.arrayBuffer());
  kontrol(
    "Mevcut liste disa aktarildi",
    aktar.ok && aktarVeri.subarray(0, 2).toString() === "PK",
    aktarVeri.length + " bayt",
  );

  // 9) Kismi ayar kaydi diger alanlari silmemeli
  const oncesi = await (await istek("/api/ayarlar")).json().catch(() => null);
  const ayarKayit = await istek("/api/ayarlar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kdvOrani: 18 }),
  });
  const ayarSonuc = await ayarKayit.json();
  kontrol(
    "Kismi ayar kaydi digerlerini korudu",
    ayarKayit.ok && ayarSonuc.ayarlar?.kdvOrani === 18 && !!ayarSonuc.ayarlar?.firmaAdi,
    JSON.stringify({ kdv: ayarSonuc.ayarlar?.kdvOrani, firma: ayarSonuc.ayarlar?.firmaAdi }),
  );
  if (oncesi) {
    await istek("/api/ayarlar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kdvOrani: 20 }),
    });
  }

  // 10) Bozuk dosya nazikce reddedilmeli
  const bozukForm = new FormData();
  bozukForm.append("dosya", new Blob([Buffer.from("bu bir excel degil")]), "bozuk.xlsx");
  const bozuk = await istek("/api/yukle", { method: "POST", body: bozukForm });
  const bozukRapor = await bozuk.json().catch(() => ({}));
  kontrol(
    "Bozuk dosya reddedildi ve Turkce hata dondu",
    bozuk.status >= 400 && typeof bozukRapor.hata === "string" && bozukRapor.hata.length > 0,
    bozukRapor.hata ?? "durum " + bozuk.status,
  );

  // 11) Cikis
  const cikis = await istek("/api/cikis", { method: "POST" });
  kontrol("Cikis yapildi", cikis.ok, "durum " + cikis.status);
  const sonrasi = await istek("/api/yukle", { method: "POST", body: new FormData() });
  kontrol("Cikistan sonra yetki yok", sonrasi.status === 401, "durum " + sonrasi.status);
}

main()
  .catch((hata) => {
    console.error("Test calistirilamadi:", hata.message);
    process.exitCode = 1;
  })
  .finally(() => {
    const basarisiz = sonuclar.filter((s) => !s.gecti);
    console.log(`\n${sonuclar.length - basarisiz.length}/${sonuclar.length} adim gecti.`);
    if (basarisiz.length) process.exitCode = 1;
  });
