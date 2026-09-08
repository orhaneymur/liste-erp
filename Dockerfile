# syntax=docker/dockerfile:1

# ── Next.js derleme ────────────────────────────────────────────────────────
# Node 20: Next 16 Turbopack'i tek sayili (25 gibi) Node dallarinda
# calismiyor. ERP'nin iki imaji da 20-alpine kullanir, ayni surumde kalalim.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# scripts/ ve public/ npm ci'den ONCE gelir: package.json'daki postinstall
# marka logolarini uretir ve bu iki klasore ihtiyac duyar.
COPY scripts ./scripts
COPY public ./public

RUN npm ci

COPY . .

RUN npm run build

# ── Calisma imaji ──────────────────────────────────────────────────────────
# output: "standalone" derlemesi kendi minik sunucusunu ve yalnizca gercekten
# kullanilan node_modules'u tasir; imaj ~150 MB yerine ~40 MB kalir.
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Fiyat verisi imajin icinde DEGIL, disaridan baglanan kalici diskte durur.
# Chart burayi bir PVC olarak baglar; pod yeniden basladiginda liste kaybolmaz.
ENV VERI_KLASORU=/veri

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir -p /veri && chown -R node:node /veri /app
USER node

EXPOSE 3000

CMD ["node", "server.js"]
