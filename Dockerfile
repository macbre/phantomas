# We need glibc distro in order to run Chrome binaries provided by puppeteer npm module
FROM node:14-slim

# install Chrome binaries depedencies
RUN apt-get update && apt-get -y upgrade && apt-get install -y \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libgcc1 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libuuid1 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6

ENV HOME /opt/phantomas
WORKDIR $HOME

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell phantomas where Chromium binary is and that we're in docker
#ENV PHANTOMAS_CHROMIUM_EXECUTABLE /usr/bin/chromium-browser
ENV DOCKERIZED yes

RUN chown -R nobody:nogroup $HOME

# Run everything after as non-privileged user.
USER nobody

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm i

RUN ldd `find -name chrome`
RUN `find -name chrome` --no-sandbox --version

# Copy the content of the rest of the repository into a container
COPY . .
