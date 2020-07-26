# based on https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-on-alpine
FROM node:14-alpine

# Installs latest Chromium package
# https://pkgs.alpinelinux.org/package/edge/community/x86_64/chromium
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      freetype@edge \
      harfbuzz@edge \
      libstdc++@edge \
      nss@edge \
      tini@edge \
      ttf-freefont@edge

ENV HOME /opt/phantomas
WORKDIR $HOME

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell phantomas where Chromium binary is and that we're in docker
ENV PHANTOMAS_CHROMIUM_EXECUTABLE /usr/bin/chromium-browser
ENV DOCKERIZED yes

# Add user so we don't need --no-sandbox.
RUN addgroup -S phantomas && adduser -S -g phantomas phantomas \
    && chown -R phantomas:phantomas $HOME

# Run everything after as non-privileged user.
USER phantomas
RUN chromium-browser --no-sandbox --version

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm i

# Copy the content of the rest of the repository into a container
COPY . .

ENTRYPOINT ["tini", "--"]
