# https://hub.docker.com/_/node
FROM node:lts-bullseye-slim

# install dependencies of Chrome binary that will be fetched by npm ci
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
      fonts-liberation \
      libasound2 \
      libatk-bridge2.0-0  \
      libatk1.0-0 \
      libatspi2.0-0 \
      libc6 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libfreetype6 \
      libgbm1 \
      libharfbuzz0b  \
      libnss3 \
      libpango-1.0-0 \
      libx11-6 \
      libxext6 \
      libxkbcommon0 \
      x11-utils \
      xdg-utils \
      zlib1g \
  && rm -rf /var/lib/apt/lists/*

# Set up a working directory
ENV HOME /opt/phantomas
WORKDIR $HOME
RUN chown -R nobody:nogroup .

# Run everything after as non-privileged user.
USER nobody

ENV DOCKERIZED yes

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci

# TODO: find the chrome binary and symlink it to the PATH
RUN ldd $(find . -wholename '*chrome-linux/chrome') && \
  $(find . -wholename '*chrome-linux/chrome') --version

ARG GITHUB_SHA="dev"
ENV COMMIT_SHA ${GITHUB_SHA}

# label the image with branch name and commit hash
LABEL maintainer="maciej.brencz@gmail.com"
LABEL org.opencontainers.image.source="https://github.com/macbre/phantomas"
LABEL org.opencontainers.image.revision="${COMMIT_SHA}"

# Copy the content of the rest of the repository into a container
COPY . .
