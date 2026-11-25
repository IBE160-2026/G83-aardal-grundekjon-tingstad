# Flex PT: one image file, three stages used by docker-compose.yml (AD-17).

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# One-off service that applies the committed drizzle-kit migrations.
FROM deps AS migrate
COPY drizzle.config.ts ./
COPY src/shared/db ./src/shared/db
CMD ["npx", "drizzle-kit", "migrate"]

FROM deps AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

# The app runs from Next.js standalone output, without dev dependencies.
FROM node:24-alpine AS app
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
