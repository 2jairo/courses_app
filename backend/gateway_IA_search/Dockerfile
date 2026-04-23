FROM node:22-alpine AS deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.8 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile


FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g tsx

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY index.ts ./
COPY types.ts ./
COPY services ./services
COPY .env .

ENV NODE_ENV=production
ENV PORT=3003

EXPOSE 3003

CMD ["tsx", "index.ts"]
