FROM ghcr.io/puppeteer/puppeteer:19.11.1

USER node

WORKDIR /app

COPY --chown=node:node package.json yarn.lock ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN yarn

COPY --chown=node:node . .

RUN yarn build

EXPOSE 3030

CMD ["yarn", "start"]