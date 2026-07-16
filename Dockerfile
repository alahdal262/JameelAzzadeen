# ---------- Stage 1: build the Vite SPA ----------
FROM node:22-alpine AS build
WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm run build

# ---------- Stage 2: runtime (Express server + built SPA) ----------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY server/package*.json server/
RUN cd server && npm ci --omit=dev

COPY server/ server/
COPY --from=build /build/dist ./dist

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1

CMD ["node", "server/index.mjs"]
