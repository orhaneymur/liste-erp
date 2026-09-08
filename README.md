# Fiyat Listesi

Müşterinin **kendi müşterilerine** link olarak gönderdiği açık fiyat listesi
sitesi. TeknikERP'nin yanında, ücretsiz ve varsayılan olarak kurulur.

```
liste.shenzhenmarket.com.tr        müşterinin kendi alan adı
<ad>-liste.derneklab.com           bizim varsayılanımız
```

---

## Nasıl çalışır

Bu uygulama **hiçbir veri saklamaz.** Ne veritabanı, ne Excel, ne yönetim
paneli, ne şifre. Bütün ürünler müşterinin ERP'sinden gelir:

```
ERP veritabanı
      ↓
ERP backend'i:  GET /api/public/fiyat-listesi   (kimlik doğrulaması istemez)
      ↓
bu site (sunucu tarafında çeker, 60 saniyede bir tazeler)
      ↓
müşterinin müşterisi
```

Fiyat ERP'de değiştiği anda listede günceldir; kimsenin bir şey yüklemesi
gerekmez. Pod yeniden başlasa da veri kaybolmaz, çünkü burada veri yoktur.

### Ne gösterir, ne göstermez

ERP'nin ucu bilerek dardır — site istese bile fazlasını alamaz:

| Gösterilen | Gösterilmeyen |
|---|---|
| Marka, kategori, model | Alış fiyatı, RMB fiyatı |
| Kalite · görünüm · renk | **Stok adedi** |
| Stok kodu | Müşteri, fatura, tedarikçi |
| Toptan (Satış 1), Perakende (Satış 2) | Açıklama, muadil bilgisi |
| Stok **Var / Yok** | |

Stok adet değil var/yok gösterilir: kaç adet olduğu ticari bilgidir, rakip
stok derinliğini öğrenmemeli. Sayıma yalnız `MERKEZ_DEPO` girer —
`CIN_IADE_DEPO`'daki mal Çin'e geri gidecek arızalı maldır, satılamaz.

Fiyatı 0 olan ürün listeye hiç girmez: 0 "bedava" değil "fiyatlandırılmamış"
demektir.

---

## Ayarlar

Hepsi ortam değişkeni; Kubernetes'te ConfigMap'ten gelir. Değiştirmek için
imaj derlemek gerekmez, `helm upgrade` yeter.

| Değişken | Varsayılan | Ne işe yarar |
|---|---|---|
| `ERP_API_URL` | `http://teknikerp-backend:3000` | ERP backend'inin adresi |
| `LISTE_TAZELEME_SANIYE` | `60` | Listenin tazelenme aralığı |
| `FIRMA_ADI` | Fiyat Listesi | Başlıkta ve sekmede görünür |
| `SLOGAN` | (hazır metin) | Başlığın altındaki cümle |
| `TELEFON` `WHATSAPP` `EPOSTA` `ADRES` | boş | Alt bilgi — boş olan görünmez |
| `UYARI` | (hazır metin) | Fiyat tablosunun altındaki not |
| `TOPTAN_GOSTER` `PERAKENDE_GOSTER` | `1` | Hangi fiyat sütunu görünsün |
| `KDV_DAHIL` `KDV_ORANI` | `0` / `20` | Fiyatlar KDV dahil mi |
| `USD_KURU` `EUR_KURU` | `0` | 0 ise TL karşılığı yazılmaz |

Kur varsayılanı bilerek 0: elle güncellenen bir kur eskidiğinde sessizce
yanlış fiyat göstermesin.

---

## Geliştirme

```bash
npm install
ERP_API_URL=http://localhost:3000 npm run dev     # ERP yerelde çalışıyorken
```

> **Node sürümü:** Next 16'nın Turbopack'i tek sayılı Node dallarında
> (25 gibi) çalışmıyor. Yerelde 20/22/24 LTS kullanın. Docker imajı zaten
> `node:20-alpine` üzerinde derlenir, orada sorun yoktur.

## Yayına alma

```bash
docker build -t since1907/teknikfiyat:v1.0.0 .
docker push since1907/teknikfiyat:v1.0.0
```

Bu depo TeknikERP'den **bağımsızdır**: ayrı imaj, ayrı sürüm numarası, ayrı
depo. Birine güncelleme atmak diğerini etkilemez. Aralarındaki tek bağ
yukarıdaki HTTP ucudur.

ERP olmadan bu site çalışmaz — tek başına satılan bir ürün değildir.
