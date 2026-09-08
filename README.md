# Fiyat Liste — Telefon Yedek Parça Fiyat Sitesi

Müşterine tek bir link atıyorsun; müşteri o linke girip **marka → kategori → model** seçerek aradığı parçanın bütün kalite seçeneklerini **toptan ve perakende** fiyatlarıyla görüyor. Fiyatları sen Excel dosyası yükleyerek güncelliyorsun, link hiç değişmiyor.

---

## 1. Müşteri ne görüyor? (4 adım)

| Adım | Ekran | Ne oluyor? |
|------|-------|-----------|
| 1 | **Marka seçimi** | Apple, Samsung, Xiaomi, Huawei… gerçek marka logolarıyla kartlar. Marka filtreleme kutusu var. |
| 2 | **Kategori seçimi** | Ekran, Batarya, Şarj Soketi, Arka Kapak, Kamera… Her kategorinin kendi rengi ve ikonu var. |
| 3 | **Model seçimi** | iPhone 11, Galaxy A53… Arama kutusuna yazarak anında filtreleyebiliyor. Her modelin fiyat aralığı kartta yazıyor. |
| 4 | **Fiyat listesi** | O modelin bütün çeşitleri: Servis Orijinal, 1. Kalite OLED, 2. Kalite Incell, Ekonomik TFT… her biri için toptan + perakende fiyat, stok durumu ve stok kodu. |

Ek olarak müşteri şunları da yapabiliyor:

- **Üstteki arama kutusu** (veya `Ctrl + K`): "iphone 11" yazıp adımları atlayarak doğrudan fiyata gidebiliyor.
- **Sıralama:** En pahalıdan / en ucuzdan / A-Z.
- **KDV düğmesi:** Fiyatları KDV dahil görebiliyor (oranı sen belirliyorsun).
- **Listeyi kopyala:** Fiyatları WhatsApp'a yapıştırılabilir düz metin olarak kopyalıyor.
- **Paylaş / Yazdır:** Telefonda paylaş menüsü, bilgisayarda yazdırma (yazdırırken menüler otomatik gizleniyor).
- **Diğer parçalar şeridi:** iPhone 11 ekranına bakarken tek tıkla aynı modelin bataryasına geçebiliyor.

Tasarım tamamen mobil öncelikli ve koyu temalı; telefonda tek elle rahat kullanılıyor.

---

## 2. Hızlı başlangıç (Windows)

**Gereksinim:** Bilgisayarda Node.js kurulu olmalı. Yoksa <https://nodejs.org> adresinden **LTS** sürümünü kur (ileri-ileri-bitir).

Sonra sadece şunu yap:

> Klasördeki **`Siteyi-Baslat.bat`** dosyasına çift tıkla.

Bu dosya gerekli paketleri kurar, siteyi derler, sunucuyu başlatır ve tarayıcıyı açar. Açılan siyah pencereyi **kapatma**; kapatırsan site kapanır.

- Site adresi: <http://localhost:3000>
- Yönetim paneli: <http://localhost:3000/admin>
- İlk giriş şifresi: **`admin123`** (aşağıda nasıl değiştireceğin yazıyor)

### Geliştirici usulü başlatmak istersen

```bash
npm install       # paketleri kur (bir kez)
npm run dev       # geliştirme modu, kod değişince anında yenilenir
npm run build     # yayın için derle
npm start         # derlenmiş, hızlı sürümü başlat
npm run logolar   # marka logolarını yeniden üret
npm test          # site açıkken uçtan uca akış testi (giriş, yükleme, arama, ayarlar)
```

`npm test`, sunucu ayakta iken 12 adımı sırayla dener: yetkisiz erişimin engellenmesi, yanlış/doğru şifre, şablon indirme, şablonu geri yükleme, arama, dışa aktarma, kısmi ayar kaydı, bozuk dosyanın reddi ve çıkış. Bir şeyi bozup bozmadığını anlamak için en hızlı yol. **Dikkat:** test gerçekten dosya yüklediği için yayındaki listeni şablon örneğiyle değiştirir; canlı sunucuda çalıştırma.

### İlk açılışta gördüğün fiyatlar

Site ilk açıldığında içi boş kalmasın diye **13 marka / 90 model / 2.520 satırlık örnek bir liste** yüklü gelir. Bu veriler gerçek değildir, sadece "site nasıl görünüyor" demek içindir. Kendi Excel'ini yüklediğin anda bu örnek liste tamamen silinir, yerine senin listen geçer.

---

## 3. Yönetim paneli ve şifre

Panele girmek için sağ üstteki dişli ikonuna bas veya doğrudan `/admin` adresine git.

Panelde neler var:

- **Özet kartları:** Kaç marka, kategori, model ve ürün satırı yayında.
- **Excel ile fiyat güncelle:** Sürükle-bırak yükleme, boş şablon indirme, yayındaki listeyi Excel olarak indirme.
- **Müşteriye gönderilecek link:** Kopyala düğmesi ve hazır WhatsApp mesajı.
- **Site ayarları:** Firma bilgileri, KDV, döviz kuru, toptan/perakende gösterme.

### Şifreyi değiştirme (önemli)

1. Proje klasöründeki **`.env.local.example`** dosyasını kopyala, adını **`.env.local`** yap.
2. İçini kendine göre düzenle:

```
ADMIN_SIFRE=cok-gizli-sifrem-2026
OTURUM_ANAHTARI=rastgele-uzun-bir-metin-yaz-buraya
```

3. Sunucuyu kapat, tekrar başlat.

`ADMIN_SIFRE` yazmazsan şifre varsayılan olarak `admin123` kalır ve giriş ekranında seni uyaran bir not görünür. Siteyi internete açacaksan mutlaka değiştir.

Giriş yaptıktan sonra oturum 30 gün açık kalır; "Çıkış yap" ile kapatabilirsin.

---

## 4. Excel ile fiyat güncelleme

İşin kalbi burası. Detaylı kolon rehberi için **[EXCEL-REHBERI.md](EXCEL-REHBERI.md)** dosyasına da bakabilirsin.

### Adımlar

1. Panelde **"Boş şablon indir"**e bas → `fiyat-listesi-sablon.xlsx` inecek. (Zaten kendi listen varsa **"Mevcut listeyi indir"** ile yayındaki listeyi Excel olarak alıp üzerinde çalışmak daha pratik.)
2. Dosyayı Excel'de doldur.
3. Panele dön, dosyayı sürükle-bırak yap ve **"Yükle ve yayına al"**a bas.
4. Site anında güncellenir. Müşterinin elindeki link aynı kalır, yeni fiyatları görür.

### Kolonlar

| Kolon | Zorunlu | Açıklama |
|-------|---------|----------|
| **Marka** | ✅ | `Apple`, `Samsung`, `Xiaomi`… Aynı markayı her satırda aynı yaz. |
| **Kategori** | ✅ | Parça türü: `Ekran`, `Batarya`, `Şarj Soketi`, `Arka Kapak`… |
| **Model** | ✅ | `iPhone 11`, `Galaxy A53`, `Redmi Note 12`… |
| **Kalite / Çeşit** | ✅ | Müşteriye görünecek çeşit adı: `Servis Orijinal`, `1. Kalite OLED (Hard)`, `2. Kalite TFT`… |
| **Stok Kodu** | — | Kendi ürün kodun / barkodun. Fiyatın altında küçük yazıyla görünür. |
| **Toptan Fiyat** | ⚠️ | Sayı olarak yaz. |
| **Perakende Fiyat** | ⚠️ | Sayı olarak yaz. |
| **Para Birimi** | — | `TRY`, `USD`, `EUR`. Boş bırakırsan `TRY` sayılır. |
| **Stok Durumu** | — | `Var` (yeşil), `Sınırlı` / `Siparişe Bağlı` (sarı), `Yok` (kırmızı). |
| **Not** | — | Müşteriye görünecek kısa açıklama. |

⚠️ Toptan ve perakendeden **en az biri** dolu olmalı. İkisi de boşsa o satır atlanır.

### Bilinmesi gereken kurallar

- **Her yükleme, önceki listenin tamamını değiştirir.** Yüklediğin dosyada olmayan ürünler siteden kalkar. Yani "sadece iPhone fiyatlarını güncelleyeyim" diye sadece iPhone satırları olan bir dosya yüklersen diğer markalar siteden silinir. Doğru yöntem: **"Mevcut listeyi indir"** → üzerinde değişiklik yap → tekrar yükle.
- Önceki liste otomatik olarak `veri/yedekler/` klasörüne yedeklenir (son 20 yükleme saklanır).
- Başlık satırının adlarını değiştirmesen daha iyi olur, ama sistem esnektir: `Toptan Fiyatı`, `Bayi Fiyatı`, `Parça Türü`, `Liste Fiyatı`, `Satış Fiyatı`, `Barkod` gibi yaygın yazımları da tanır.
- Fiyat yazımında Türkçe biçim sorun değil: `1.250,50`, `1250,50`, `1250.5`, `1.250,50 TL` hepsi doğru okunur.
- Marka adını `İphone` yazsan bile logo doğru gelir (takma ad tablosu var).
- Boş satırlar ve eksik bilgili satırlar atlanır; yükleme sonunda kaç satır atlandığını rapor eder.
- **`.xls` (eski Excel) desteklenmiyor.** Excel'de "Farklı Kaydet → Excel Çalışma Kitabı (.xlsx)" seç. `.csv` de kabul edilir.
- En fazla 25 MB.

---

## 5. Site ayarları

Paneldeki **Site ayarları** bölümünden:

- **Firma adı / slogan:** Üst barda, sekme başlığında ve ana sayfada görünür.
- **Telefon / WhatsApp / e-posta / adres:** Sayfanın altında tıklanabilir olarak çıkar. WhatsApp numarası girersen "WhatsApp'tan sorun" bağlantısı oluşur.
- **Uyarı metni:** "Fiyatlar stok durumuna göre değişebilir…" gibi kendi metnin.
- **Toptan fiyatı göster / Perakende fiyatı göster:** İstersen müşteriye sadece birini gösterirsin. (İkisini birden kapatamazsın.)
- **Fiyatlara KDV dahil:** Excel'deki fiyatlar KDV dahilse işaretle; o zaman müşteriye "KDV dahildir" yazar. İşaretli değilse müşteri KDV düğmesiyle dahil fiyatı görebilir.
- **KDV oranı:** Varsayılan %20.
- **Dolar / Euro kuru:** Dövizli fiyatlar için. Kur girersen fiyatın altında `~ 1.905 ₺` şeklinde TL karşılığı görünür. `0` bırakırsan TL karşılığı gösterilmez.

---

## 6. Müşteriye link gönderme (yayına alma)

`localhost:3000` adresi **sadece senin bilgisayarında** çalışır. Müşterinin girebilmesi için siteyi dışarı açman gerekir. Üç yol var:

### a) Aynı ofis / aynı Wi-Fi (en kolay)

Sunucu açılırken "Network" satırında bir adres yazar (örn. `http://10.2.42.108:3000`). Aynı ağdaki telefon ve bilgisayarlar bu adrese girebilir. Ofis içi kullanım için yeterli, dışarıdan erişilmez.

### b) Kendi bilgisayarından internete açmak (ücretsiz, hızlı)

[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) ile bilgisayarındaki siteye internetten erişilebilir bir adres verilir:

```bash
# cloudflared kurulduktan sonra, site açıkken:
cloudflared tunnel --url http://localhost:3000
```

Komut sana `https://...trycloudflare.com` gibi bir adres verir; müşteriye bunu atarsın. **Dezavantajı:** bilgisayar kapalıysa site de kapalıdır ve ücretsiz adres her başlatmada değişir. Kalıcı ve kendi alan adınla kullanmak için Cloudflare'de ücretsiz hesap açıp tünelini alan adına bağlaman gerekir.

### c) Sunucuya kurmak (kalıcı çözüm — önerilen)

Node.js çalıştıran bir sunucuya (VPS, Railway, Render vb.) kurulur, kendi alan adını bağlarsın: `fiyat.firmaadi.com`.

Tipik VPS kurulumu:

```bash
npm install
npm run build
npm start          # kalıcı çalışması için pm2 veya systemd önerilir
```

**Önemli uyarı:** Bu proje fiyatları sunucudaki bir dosyada tutar (aşağıya bak). Bu yüzden **Vercel gibi dosya yazmaya izin vermeyen** platformlarda Excel yüklemesi kalıcı olmaz. Vercel'e taşımak istersen verinin bir veritabanına (Postgres, Supabase vb.) alınması gerekir. Sunucu seçerken **kalıcı disk** verenleri tercih et.

---

## 7. Veriler nerede tutuluyor?

```
veri/
├── fiyatlar.json          → yayındaki bütün fiyat satırları
├── ayarlar.json           → firma bilgileri, KDV, kur ayarları
└── yedekler/              → her yüklemeden önce alınan otomatik yedekler (son 20)
```

- Bu klasörü yedeklersen bütün verilerini yedeklemiş olursun.
- Veriyi proje dışında bir yerde tutmak istersen `.env.local` içine `VERI_KLASORU=D:\fiyat-verisi` yazabilirsin. Böylece projeyi güncellerken/silsen bile veri etkilenmez.
- Veritabanı kurmaya gerek yok; kurulum bu yüzden çok basit ve site çok hızlı.

---

## 8. Marka logoları

Logolar `public/logolar/` klasöründe SVG olarak durur ve `npm install` sırasında otomatik üretilir.

- **19 markanın gerçek resmi logosu** kullanılır: Apple, Samsung, Xiaomi, Redmi, Huawei, Honor, Oppo, Vivo, OnePlus, Google, Nokia, Motorola, Asus, Lenovo, Sony, LG, HTC, Vestel, Meizu. Bunlar açık kaynaklı [simple-icons](https://simpleicons.org) paketinden alınır.
- Realme, ZTE, TCL, Alcatel, Tecno, Infinix, Poco, Reeder, Casper, General Mobile gibi logosu bulunmayan markalar için marka renginde şık bir **monogram** (baş harfler) üretilir.
- Excel'de tanımadığı bir marka yazarsan, o marka için genel bir simge gösterilir; site çalışmaya devam eder.

### Kendi logonu koymak

İstediğin markanın logosunu kendin koymak çok kolay: logoyu `public/logolar/` klasörüne **marka adının sadeleştirilmiş hâliyle** kaydet.

| Excel'deki marka | Dosya adı |
|------------------|-----------|
| Apple | `apple.svg` |
| General Mobile | `general-mobile.svg` |
| Şaoo Telekom | `saoo-telekom.svg` |

Kural: Türkçe harfler sadeleştirilir (`ş→s`, `ı→i`, `ğ→g`), boşluklar tire olur, hepsi küçük harf. SVG önerilir (her ekranda net görünür), ama dosya adını `.svg` bırakıp içine SVG koyman şartıyla çalışır. Yeni logo eklediğinde `src/lib/logolar.ts` içindeki `MEVCUT_LOGOLAR` listesine dosya adını da eklemen gerekir.

`npm run logolar` komutu logoları yeniden üretir (kendi eklediklerini silmemesi için farklı isim kullan).

---

## 9. Klasör yapısı

```
Fiyat Liste/
├── Siteyi-Baslat.bat          → çift tıkla, site açılır
├── README.md                  → bu dosya
├── EXCEL-REHBERI.md           → Excel kolonları ve örnekler
├── .env.local.example         → şifre/ayar dosyası örneği
├── veri/                      → fiyatlar, ayarlar, yedekler (senin verin)
├── public/logolar/            → marka logoları (SVG)
├── scripts/
│   └── logolari-hazirla.mjs   → logoları üreten script
└── src/
    ├── app/                   → sayfalar ve API uçları
    │   ├── page.tsx                                → 1. adım: marka seçimi
    │   ├── marka/[marka]/page.tsx                  → 2. adım: kategori
    │   ├── marka/[marka]/[kategori]/page.tsx       → 3. adım: model
    │   ├── marka/[marka]/[kategori]/[model]/...    → 4. adım: fiyat listesi
    │   ├── admin/page.tsx                          → yönetim paneli
    │   └── api/                                    → giriş, yükleme, şablon, arama
    ├── components/            → arayüz parçaları (kartlar, tablo, arama…)
    └── lib/                   → veri okuma/yazma, Excel işlemleri, biçimlendirme
```

---

## 10. Sorun giderme

| Sorun | Çözüm |
|-------|-------|
| `Siteyi-Baslat.bat` "Node.js kurulu değil" diyor | <https://nodejs.org> → LTS sürümünü kur, bilgisayarı yeniden başlat. |
| Site açılmıyor, "port kullanımda" hatası | Başka bir sunucu 3000 portunda çalışıyor. Eski siyah pencereyi kapat veya `npm run dev -- -p 3001` ile başka porttan başlat. |
| Excel yüklerken "zorunlu kolonlar bulunamadı" | Başlık satırı bozulmuş. Şablonu indirip kolon adlarını birebir kullan. |
| Excel yüklerken "eski .xls biçimi" | Excel'de "Farklı Kaydet → .xlsx" seç. |
| Yüklendi ama bazı satırlar gelmedi | Marka/kategori/model boş olan veya iki fiyatı da boş olan satırlar atlanır. Yükleme raporunda kaç satır atlandığı yazar. |
| Fiyatlar 100 kat yanlış göründü | Excel hücresinde fiyat metin olarak yazılmış olabilir (`1.250` binlik mi ondalık mı belirsiz). Hücreleri "Sayı" biçimine çevir veya `1250,50` şeklinde yaz. |
| Şifremi değiştirdim ama eski şifre çalışıyor | Sunucuyu kapatıp yeniden başlat; `.env.local` sadece başlangıçta okunur. |
| Yanlış liste yükledim, geri almak istiyorum | `veri/yedekler/` klasöründeki en son dosyayı `veri/fiyatlar.json` olarak kopyala, sunucuyu yeniden başlat. |
| Marka logosu gelmiyor | 8. bölümdeki dosya adı kuralına göre `public/logolar/` klasörüne ekle. |

---

## 11. Teknik detaylar

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** ile koyu tema, cam efekti (glassmorphism), yumuşak animasyonlar
- **ExcelJS** ile `.xlsx` okuma/yazma; `.csv` için kendi ayrıştırıcısı
- Veri: JSON dosyası + bellek içi önbellek (dosya değişmedikçe diskten okumaz)
- Kimlik doğrulama: HMAC ile imzalanmış `httpOnly` çerez, şifre `.env.local` içinde
- Yükleme sonrası eski liste otomatik yedeklenir; yükleme raporu satır bazlı uyarı verir
- Erişilebilirlik: klavye ile tam gezinme, `Ctrl+K` arama kısayolu, `prefers-reduced-motion` desteği
- Arama, marka/model adında Türkçe karakter farkını yok sayar (`İphone` = `iphone`)
- Sayfalar `noindex` işaretlidir: Google'da çıkmaz, sadece linki bilen görür

Kolay gelsin. Bir şey eklemek istersen (marka bazlı iskonto, müşteriye özel fiyat listesi, sepet/teklif oluşturma, birden fazla depo stoğu…) yapı buna hazır.
