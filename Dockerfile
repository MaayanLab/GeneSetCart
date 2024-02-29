FROM node
WORKDIR /app
ADD package.json /imagineset
ADD package-lock.json /imagineset
RUN npm i
ADD . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]