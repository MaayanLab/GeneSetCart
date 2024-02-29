FROM node
WORKDIR /app
ADD /imagineset/package.json .
ADD /imagineset/package-lock.json .
RUN npm i
ADD . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]