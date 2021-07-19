# https://hub.docker.com/_/node
FROM node:lts-alpine3.14

# Installs latest Chromium package.
# https://pkgs.alpinelinux.org/package/edge/community/x86_64/chromium
ENV CHROMIUM_VERSION 91.0.4472.101-r0

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/v3.13/main" >> /etc/apk/repositories \
  && apk upgrade -U -a \
  && apk add \
    chromium \
    ca-certificates \
    freetype \
    freetype-dev \
    harfbuzz \
    nss \
    ttf-freefont

RUN which chromium-browser
RUN chromium-browser --no-sandbox --version

# Set up a working directory
ENV HOME /opt/phantomas
WORKDIR $HOME
RUN chown -R nobody:nogroup .

# Run everything after as non-privileged user.
USER nobody

# Tell Puppeteer to skip installing Chrome. We'll be using the installed binary
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell phantomas where Chromium binary is and that we're in docker
ENV PHANTOMAS_CHROMIUM_EXECUTABLE /usr/bin/chromium-browser
ENV DOCKERIZED yes

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci

ARG GITHUB_SHA="dev"
ENV COMMIT_SHA ${GITHUB_SHA}

# label the image with branch name and commit hash
LABEL maintainer="maciej.brencz@gmail.com"
LABEL org.opencontainers.image.source="https://github.com/macbre/phantomas"
LABEL org.opencontainers.image.revision="${COMMIT_SHA}"

# Copy the content of the rest of the repository into a container
COPY . .
