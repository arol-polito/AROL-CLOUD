FROM node:18 AS builder
WORKDIR /client
COPY . /client

ENV GENERATE_SOURCEMAP=false

RUN npm ci
RUN npm run build

FROM nginx:1.19-alpine AS server
COPY --from=builder ./client/build /usr/share/nginx/html