# Excel Rehberi — Fiyat Listesi Nasıl Doldurulur?

Bu dosya, siteye yüklediğin Excel'in nasıl hazırlanacağını anlatır. Aceleyse tek cümle: **panelden "Mevcut listeyi indir" ile dosyayı al, fiyatları değiştir, geri yükle.**

---

## 1. Doğru çalışma yöntemi

```
Yönetim paneli → "Mevcut listeyi indir"
        ↓
Excel'de fiyatları güncelle / yeni satır ekle
        ↓
Yönetim paneli → dosyayı sürükle-bırak → "Yükle ve yayına al"
        ↓
Site anında güncellendi (müşterinin linki değişmedi)
```

Hiç listen yoksa **"Boş şablon indir"** ile başla. Şablonun içinde örnek satırlar ve `NASIL DOLDURULUR` adlı bir yardım sayfası vardır. Örnek satırları silip kendi verinle doldur.

> ⚠️ **En kritik kural:** Her yükleme, sitedeki listenin **tamamını** değiştirir. Yüklediğin dosyada olmayan ürün siteden kalkar. Bu yüzden "sadece iPhone" dosyası yükleme; hep tam listeyle çalış.
>
> Yanlış dosya yüklersen panik yok: her yüklemeden önce eski liste `veri/yedekler/` klasörüne otomatik yedeklenir.

---

## 2. Kolonlar

Sıra önemli değil, kolon **adı** önemli. Sistem esnektir; aynı anlama gelen yaygın yazımları da tanır.

### Marka — zorunlu

Telefon markası. Aynı markayı hep aynı yaz (bir satırda `Apple`, ötekinde `APPLE` yazarsan ikisi tek marka sayılır ama listede ilk gördüğü yazımla görünür).

```
Apple / Samsung / Xiaomi / Huawei / Honor / Oppo / Realme / Vivo / Tecno / Infinix
```

Logolar marka adından otomatik bulunur. `İphone`, `Redmi`, `Galaxy`, `Pixel` gibi yazımlar da doğru logoya bağlanır.

**Tanınan diğer başlıklar:** `Brand`, `Markası`

### Kategori — zorunlu

Parçanın türü. Müşterinin 2. adımda seçtiği şey budur. Kategori adına göre ikon ve renk otomatik atanır.

```
Ekran / Batarya / Şarj Soketi / Arka Kapak / Kamera / Hoparlör / Ön Cam (Glass) /
Kasa / Titreşim Motoru / Mikrofon / Anakart / Parmak İzi Sensörü
```

**Tanınan diğer başlıklar:** `Parça Türü`, `Parça Tipi`, `Ürün Grubu`, `Grup`, `Category`

### Model — zorunlu

```
iPhone 11 / iPhone 14 Pro Max / Galaxy A53 / Galaxy S24 Ultra / Redmi Note 12 / GM 22
```

Model adını tutarlı yaz: `iPhone 11` ile `Iphone 11` aynı sayılır (Türkçe karakter ve büyük/küçük harf farkı yok sayılır), ama `iPhone11` ayrı bir model olur.

**Tanınan diğer başlıklar:** `Telefon Modeli`, `Cihaz`, `Cihaz Modeli`

### Kalite / Çeşit — zorunlu

Son ekranda müşteriye listelenen satırın adı. İşin en önemli kolonu bu: müşteri burada 1. kalite mi 2. kalite mi aldığını görür.

```
Servis Orijinal (Kutulu)
Çıkma Orijinal (Sökme)
1. Kalite OLED (Hard)
2. Kalite OLED (Soft)
Incell GX
A Kalite TFT
1. Kalite Yüksek Kapasite
Ekonomik
```

Site, yazdığın metne bakıp otomatik renkli bir seviye etiketi ekler:

| Metinde geçerse | Etiket | Renk |
|-----------------|--------|------|
| `servis`, `orijinal` | **ORİJİNAL** | altın |
| `1. kalite`, `hard`, `yüksek` | **1. KALİTE** | mavi |
| `2. kalite`, `soft`, `incell` | **2. KALİTE** | mor |
| `ekonomik`, `tft`, `standart` | **EKONOMİK** | gri |

Hiçbiri geçmezse etiket konulmaz, sadece yazdığın ad görünür. Yani istediğin adı yazabilirsin, sistem seni zorlamaz.

Boş bırakırsan `Standart` yazılır.

**Tanınan diğer başlıklar:** `Kalite`, `Çeşit`, `Ürün`, `Ürün Adı`, `Tip`, `Variant`

### Stok Kodu — isteğe bağlı

Kendi ürün kodun veya barkodun. Fiyatın altında küçük, tek aralıklı yazıyla görünür; müşteri sipariş verirken kolaylık olur.

**Tanınan diğer başlıklar:** `Kod`, `Barkod`, `SKU`, `Ürün Kodu`

### Toptan Fiyat / Perakende Fiyat

**En az biri dolu olmalı.** İkisi de boşsa satır atlanır.

Yazım biçimi serbest, hepsi doğru okunur:

| Excel'de yazan | Okunan değer |
|----------------|--------------|
| `1250` | 1.250 |
| `1250,50` | 1.250,50 |
| `1.250,50` | 1.250,50 |
| `1.250,50 TL` | 1.250,50 |
| `1,250.50` | 1.250,50 |

En sağlıklısı: hücreyi Excel'de **Sayı** biçimine alıp sadece sayıyı yazmak.

**Tanınan diğer başlıklar:**
- Toptan için: `Toptan`, `Toptan Fiyatı`, `Bayi Fiyatı`, `Wholesale`
- Perakende için: `Perakende`, `Perakende Fiyatı`, `Liste Fiyatı`, `Satış Fiyatı`, `Müşteri Fiyatı`, `Retail`

> Müşteriye sadece toptan ya da sadece perakende göstermek istiyorsan Excel'i değiştirmene gerek yok: panelden **Site ayarları → "Perakende fiyatı göster"** anahtarını kapatman yeterli.

### Para Birimi — isteğe bağlı

`TRY`, `USD`, `EUR`. Boş bırakırsan `TRY` kabul edilir. `TL`, `₺`, `$`, `€`, `Dolar`, `Euro` yazımları da tanınır.

Dövizli fiyat kullanıyorsan panelden **Dolar/Euro kuru** gir; site fiyatın altına `~ 1.905 ₺` şeklinde TL karşılığını yazar. Kuru değiştirdiğin anda bütün TL karşılıkları güncellenir — Excel'e dokunmana gerek kalmaz.

**Tanınan diğer başlıklar:** `Döviz`, `Currency`, `Kur`

### Stok Durumu — isteğe bağlı

Müşteriye renkli etiket olarak gösterilir:

| Yazdığın | Görünüm |
|----------|---------|
| `Var` | yeşil |
| `Sınırlı`, `Siparişe Bağlı` | sarı |
| `Yok`, `Tükendi` | kırmızı |

Boş bırakırsan etiket görünmez.

**Tanınan diğer başlıklar:** `Stok`, `Durum`, `Adet`, `Mevcut`

### Not — isteğe bağlı

Müşteriye görünen kısa açıklama. Örnek: `Kutulu, garantili`, `Sadece 3 adet`, `Kasa dahil fiyat`.

**Tanınan diğer başlıklar:** `Notlar`, `Açıklama`, `Ek Bilgi`

---

## 3. Örnek dolu tablo

| Marka | Kategori | Model | Kalite / Çeşit | Stok Kodu | Toptan Fiyat | Perakende Fiyat | Para Birimi | Stok Durumu | Not |
|-------|----------|-------|----------------|-----------|--------------|-----------------|-------------|-------------|-----|
| Apple | Ekran | iPhone 11 | Servis Orijinal (Kutulu) | APL-EKR-IP11-SRV | 3600 | 4750 | TRY | Var | Kutulu |
| Apple | Ekran | iPhone 11 | 1. Kalite OLED (Hard) | APL-EKR-IP11-OLH | 1945 | 2565 | TRY | Var | |
| Apple | Ekran | iPhone 11 | 2. Kalite Incell GX | APL-EKR-IP11-GX | 1150 | 1520 | TRY | Sınırlı | 4 adet kaldı |
| Apple | Batarya | iPhone 11 | Servis Orijinal (Kutulu) | APL-BAT-IP11-SRV | 685 | 905 | TRY | Var | |
| Apple | Batarya | iPhone 11 | 1. Kalite Yüksek Kapasite | APL-BAT-IP11-YKP | 425 | 560 | TRY | Var | 3400 mAh |
| Samsung | Ekran | Galaxy A53 | Servis Orijinal (Kutulu) | SAM-EKR-A53-SRV | 2850 | 3765 | TRY | Var | Çıtalı |
| Samsung | Ekran | Galaxy A53 | 1. Kalite OLED (Hard) | SAM-EKR-A53-OLH | 1540 | 2035 | TRY | Var | |
| Xiaomi | Şarj Soketi | Redmi Note 12 | Orijinal Sökme | XIA-SRJ-RN12-ORJ | 140 | 185 | TRY | Var | |
| Xiaomi | Kamera | Redmi Note 12 | Orijinal Sökme (Arka) | XIA-KAM-RN12-ORJ | 22 | 30 | USD | Var | Dolar bazlı |

Bu tabloda müşteri Apple → Ekran → iPhone 11 seçtiğinde **3 satırı** yan yana fiyatlarıyla görür; en ucuz olanın yanında otomatik **EN UYGUN** etiketi çıkar.

---

## 4. Sık yapılan hatalar

| Hata | Sonuç | Çözüm |
|------|-------|-------|
| Başlık satırını silmek | "Zorunlu kolonlar bulunamadı" hatası | 1. satırda kolon adları olmalı |
| `.xls` olarak kaydetmek | Dosya reddedilir | "Farklı Kaydet → .xlsx" |
| Fiyat hücresine `1.250` yazıp binlik kastetmek | Bazı durumlarda 1,25 okunabilir | Hücreyi Sayı biçimine al veya `1250` yaz |
| Aynı modeli farklı yazmak (`iPhone 11` / `iPhone11`) | İki ayrı model olarak listelenir | Tutarlı yaz |
| Marka kolonunu boş bırakıp sadece model yazmak | Satır atlanır | Her satırda marka/kategori/model dolu olmalı |
| Fiyat kolonuna `Sorunuz` yazmak | Satır atlanır | Fiyat bilinmiyorsa satırı hiç koymayın veya sadece perakende girin |
| Birden fazla sayfaya veri yaymak | Sadece bir sayfa okunur | Bütün veriyi tek sayfada tut (başlıkta `Marka` geçen sayfa okunur) |

---

## 5. Yükleme raporunu okumak

Yükleme bitince panel şunu gösterir:

```
✓ Liste güncellendi
  2.520 ürün yayında   13 marka   90 model   9 kategori
  4 satır eksik bilgi nedeniyle atlandı
  · Satır 87: marka/kategori/model boş olduğu için atlandı.
```

- **ürün yayında:** siteye alınan satır sayısı
- **atlandı:** eksik bilgi yüzünden alınmayan satırlar (hangi satır olduğu tek tek yazılır)

Sayılar beklediğinden çok farklıysa dosyayı kontrol et; eski liste `veri/yedekler/` klasöründe duruyor.
