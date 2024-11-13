FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json next.config.mjs ./
COPY postcss.config.mjs tailwind.config.ts ./

CMD ["npm", "run", "dev"]
