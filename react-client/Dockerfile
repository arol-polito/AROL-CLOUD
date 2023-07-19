FROM node:12 AS builder
WORKDIR /client
COPY . /client
RUN npm install --force
ENV NODE_OPTIONS=--max_old_space_size=2048
RUN npm run build

FROM nginx:1.19-alpine AS server
COPY --from=builder ./client/build /usr/share/nginx/html