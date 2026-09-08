#!/bin/bash
# Fiyat Listesi — Docker imajini derler ve Docker Hub'a gonderir.
#
# Kullanim:
#   bash k8s/build-images.sh v1.0.0
#
# Bu imaj TeknikERP'nin imajlarindan BAGIMSIZDIR: kendi surum numarasi
# vardir, ERP'ye surum atmak burayi etkilemez. Ikisi arasindaki tek bag
# ERP'nin /api/public/fiyat-listesi ucudur.
#
# Onemli: Imaj TUM musterilerde ayni. Musteriye ozel hicbir sey icinde
# degildir — firma adi, telefon ve gorunum ayarlari ConfigMap'ten gelir.
# Bu yuzden yeni musteri acarken imaj derlemeye GEREK YOKTUR.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TAG="${1:-}"
REGISTRY="${REGISTRY:-since1907}"

if [[ -z "$TAG" ]]; then
  echo "Kullanim: bash k8s/build-images.sh <surum>"
  echo "Ornek   : bash k8s/build-images.sh v1.0.0"
  exit 1
fi

command -v docker >/dev/null 2>&1 || { echo "HATA: 'docker' bulunamadi."; exit 1; }

IMAJ="${REGISTRY}/teknikfiyat:${TAG}"

# Chart'in appVersion alanini imaj etiketiyle esitle. Elle yazildiginda
# geride kaliyor ve "helm list" yanlis surum gosteriyordu.
CHART_YAML="${ROOT}/charts/teknikfiyat/Chart.yaml"
if [[ -f "$CHART_YAML" ]]; then
  sed -i.bak -E "s|^appVersion:.*|appVersion: \"${TAG}\"|" "$CHART_YAML"
  rm -f "${CHART_YAML}.bak"
  echo "==> Chart appVersion -> ${TAG}"
fi

echo "==> Derleniyor: ${IMAJ}"
docker build -t "$IMAJ" .

echo "==> Docker Hub'a gonderiliyor..."
docker push "$IMAJ"

echo ""
echo "Tamam. Musterilere dagitmak icin:"
echo "  bash k8s/tum-musteriler.sh ${TAG}"
