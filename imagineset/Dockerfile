FROM node
WORKDIR /app
ADD package.json .
ADD package-lock.json .
RUN npm i
ADD . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]