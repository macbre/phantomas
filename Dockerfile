FROM node:14-alpine3.12

# install Chrome binaries depedencies
# Installs latest Chromium package.
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
  && echo "http://dl-cdn.alpinelinux.org/alpine/v3.12/main" >> /etc/apk/repositories \
  && apk upgrade -U -a \
  && apk add \
    chromium

# Set up a working directory
ENV HOME /opt/phantomas
WORKDIR $HOME
RUN chown -R nobody:nogroup .

# Run everything after as non-privileged user.
USER nobody

# Tell Puppeteer to skip installing Chrome. We'll be using the installed binary
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell phantomas where Chromium binary is and that we're in docker
#ENV PHANTOMAS_CHROMIUM_EXECUTABLE /usr/bin/chromium-browser
ENV DOCKERIZED yes

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm i

RUN ldd `find -name chrome`
RUN `find -name chrome` --no-sandbox --version

# Copy the content of the rest of the repository into a container
COPY . .
