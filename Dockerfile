FROM node:10-alpine

WORKDIR /opt/mttr

COPY package.json .
RUN yarn install
COPY index.js .

CMD ["yarn", "start"]
