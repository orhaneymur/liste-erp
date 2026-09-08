#!/bin/bash
# Fiyat Listesi — bir musteriye kurar veya gunceller.
#
# Kullanim:
#   bash k8s/kur.sh <kisa-ad> "<Firma Adi>" [alan-adi]
#
# Ornek:
#   bash k8s/kur.sh shenzhen "Shenzhen Market" liste.shenzhenmarket.com.tr
#   bash k8s/kur.sh demo     "TeknikERP Demo"
#
# Alan adi verilmezse kaliptan uretilir: <kisa-ad>-liste.derneklab.com
# (Tek seviye olmak ZORUNDA — Cloudflare'in ucretsiz sertifikasi
#  "liste.demo.derneklab.com" gibi iki seviyeli adresi kapsamaz.)
#
# ON KOSUL: ayni namespace'te TeknikERP kurulu olmali. Fiyat listesi
# veriyi ERP'den alir; ERP yoksa site "liste su an acilamadi" der.
#
# Cloudflare'de A kaydi onceden eklenmis olmali:
#   liste  ->  213.238.168.227   (Proxied)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHART="${ROOT}/charts/teknikfiyat"

AD="${1:-}"
FIRMA="${2:-}"
ALAN="${3:-}"

if [[ -z "$AD" || -z "$FIRMA" ]]; then
  echo "Kullanim: bash k8s/kur.sh <kisa-ad> \"<Firma Adi>\" [alan-adi]"
  exit 1
fi

for cmd in kubectl helm; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "HATA: '$cmd' bulunamadi."; exit 1; }
done

NS="tenant-${AD}"

if ! kubectl get namespace "$NS" >/dev/null 2>&1; then
  echo "HATA: '${NS}' namespace'i yok."
  echo "Once ERP kurulmali:  bash k8s/new-tenant.sh ${AD} \"${FIRMA}\"   (teknikerp deposunda)"
  exit 1
fi

# ERP ayakta mi? Kurulum yine de yapilir, ama kullanici bilsin.
if ! kubectl get deploy teknikerp-backend -n "$NS" >/dev/null 2>&1; then
  echo "UYARI: ${NS} icinde teknikerp-backend bulunamadi."
  echo "       Fiyat listesi veriyi ERP'den alir; ERP kurulana kadar site bos gorunur."
fi

EK=()
if [[ -n "$ALAN" ]]; then
  EK+=(--set "ingress.host=${ALAN}")
fi

echo "==> ${NS} icin fiyat listesi kuruluyor"
helm upgrade teknikfiyat "$CHART" \
  --install \
  --namespace "$NS" \
  --set "tenant.id=${AD}" \
  --set-string "tenant.firmaAdi=${FIRMA}" \
  "${EK[@]}" \
  --timeout 5m

kubectl rollout status deployment/teknikfiyat -n "$NS" --timeout=300s

echo ""
echo "Tamam."
helm list -n "$NS"
