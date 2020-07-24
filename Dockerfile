# based on https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-on-alpine
FROM node:14-alpine

# Installs latest Chromium package
# https://pkgs.alpinelinux.org/package/edge/community/x86_64/chromium
RUN apk update && apk upgrade && \
#    echo @ege http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge \
      freetype@edge \
      harfbuzz@edge \
      ttf-freefont@edge

WORKDIR /opt/phantomas
ENV HOME /opt/phantomas

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell phantomas where Chromium binary is and that we're in docker
ENV PHANTOMAS_CHROMIUM_EXECUTABLE /usr/bin/chromium-browser
ENV DOCKERIZED yes

# Add user so we don't need --no-sandbox.
RUN addgroup -S phantomas && adduser -S -g phantomas phantomas \
    && mkdir -p /opt/phantomas \
    && chown -R phantomas:phantomas /opt/phantomas

# Run everything after as non-privileged user.
USER phantomas

# Install dependencies
COPY package.json /opt/phantomas
COPY package-lock.json /opt/phantomas
RUN npm i

# Copy the content of the rest of the repository into a container
COPY . /opt/phantomas

# test it (if needed)
#RUN ./test/server-start.sh &
#RUN sleep 2 && npm t

# Autorun chrome headless
#ENTRYPOINT ["chromium-browser", "--headless", "--use-gl=swiftshader", "--disable-software-rasterizer", "--disable-dev-shm-usage"]
