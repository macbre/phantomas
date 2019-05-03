# based on https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-on-alpine
FROM node:10-alpine

# Installs latest Chromium (72) package.
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge \
      freetype@edge \
      harfbuzz@edge \
      ttf-freefont@edge

WORKDIR /opt/phantomas

# Puppeteer v1.15.0 works with Chromium 75 // keep in sync with version in package.json
ENV PUPPETEER_VERSION 1.15.0

RUN npm i --no-save puppeteer@$PUPPETEER_VERSION

# Add user so we don't need --no-sandbox.
RUN addgroup -S phantomas && adduser -S -g phantomas phantomas \
    && mkdir -p /opt/phantomas \
    && chown -R phantomas:phantomas /opt/phantomas

# Run everything after as non-privileged user.
USER phantomas

