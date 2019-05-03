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

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell phantomas were Chromium binary is
ENV PHANTOMAS_CHROMIUM_EXECUTABLE /usr/bin/chromium-browser

# Add user so we don't need --no-sandbox.
RUN addgroup -S phantomas && adduser -S -g phantomas phantomas \
    && mkdir -p /opt/phantomas \
    && chown -R phantomas:phantomas /opt/phantomas

# Run everything after as non-privileged user.
USER phantomas

# Copy the content of the repository into a container
COPY . /opt/phantomas

# and install dependencies
RUN npm i

# test it (if needed)
#RUN ./test/server-start.sh &
#RUN sleep 2 && npm t
