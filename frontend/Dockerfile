ARG NODE_VERSION=19
ARG ALPINE_VERSION=3.16

FROM public.ecr.aws/docker/library/node:${NODE_VERSION}-alpine${ALPINE_VERSION}
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
