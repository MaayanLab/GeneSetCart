FROM node:18-alpine AS builder
WORKDIR /app
ADD /imagineset/package.json .
ADD /imagineset/package-lock.json .
RUN npm i
ADD ./imagineset .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]