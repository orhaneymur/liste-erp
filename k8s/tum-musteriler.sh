#!/bin/bash
# Fiyat Listesi — tum musterileri (veya tek bir musteriyi) yeni surume gecirir.
#
# Kullanim:
#   bash k8s/tum-musteriler.sh v1.0.1                # kurulu olan herkes
#   bash k8s/tum-musteriler.sh v1.0.1 shenzhen-test  # yalnizca prova
#
# TAVSIYE: once provayi guncelle, kontrol et, sonra digerlerine gec.
# Sorun cikarsa yalnizca o musteri geri alinir:
#   helm rollback teknikfiyat -n tenant-<ad>
#
# Bu betik YALNIZCA fiyat listesini gunceller. ERP'ye dokunmaz; ERP'nin
# kendi betigi ayri depodadir (teknikerp/k8s/update-all-tenants.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHART="${ROOT}/charts/teknikfiyat"

TAG="${1:-}"
ONLY="${2:-}"

if [[ -z "$TAG" ]]; then
  echo "Kullanim: bash k8s/tum-musteriler.sh <surum> [musteri-kisa-adi]"
  exit 1
fi

for cmd in kubectl helm; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "HATA: '$cmd' bulunamadi."; exit 1; }
done

if [[ -n "$ONLY" ]]; then
  NAMESPACES="tenant-${ONLY}"
else
  # Fiyat listesi KURULU olan namespace'ler (helm release'i olanlar)
  NAMESPACES="$(helm list -A -f '^teknikfiyat$' -o json \
    | grep -o '"namespace":"[^"]*"' | cut -d'"' -f4 | sort -u)"
fi

if [[ -z "${NAMESPACES// }" ]]; then
  echo "Fiyat listesi kurulu musteri bulunamadi."
  exit 0
fi

echo "==> Hedef surum: ${TAG}"
echo "==> Musteriler:"
echo "$NAMESPACES" | sed 's/^/    /'
echo ""

FAILED=""

for ns in $NAMESPACES; do
  echo "======================================================================"
  echo " ${ns}"
  echo "======================================================================"

  # --reuse-values: musteriye ozel ayarlar (firma adi, alan adi, telefon)
  # korunur; yalnizca imaj surumu degisir.
  if helm upgrade teknikfiyat "$CHART" \
      --namespace "$ns" \
      --reuse-values \
      --set "image.tag=${TAG}" \
      --timeout 5m \
    && kubectl rollout status deployment/teknikfiyat -n "$ns" --timeout=300s; then
    echo "    OK: ${ns}"
  else
    echo "    HATA: ${ns} guncellenemedi."
    FAILED="${FAILED} ${ns}"
  fi
  echo ""
done

echo "======================================================================"
if [[ -n "$FAILED" ]]; then
  echo " BAZI MUSTERILER GUNCELLENEMEDI:${FAILED}"
  echo ""
  echo " Inceleme : kubectl get pods -n <namespace> -l app=teknikfiyat"
  echo " Geri alma: helm rollback teknikfiyat -n <namespace>"
  exit 1
fi

echo " Tum fiyat listeleri ${TAG} surumune gecti."
echo "======================================================================"
helm list -A -f '^teknikfiyat$'
