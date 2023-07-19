FROM node:20
WORKDIR /server
EXPOSE 8080

ENV JWT_SECRET_KEY=6c9c23d766e7cf2280dfdb8fca8f97841ddcd80eee01eb0cbaff85037848962f
ENV JWT_EXPIRATION=900000
ENV REFRESH_TOKEN_SECRET_KEY=47e648a61b5c7c8b3d12bb9c46dbc64f35fd2d3fb22bfc5debc9d7cf6036ff1b
ENV REFRESH_TOKEN_EXPIRATION=2592000000
ENV POSTGRES_HOST=localhost
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV MONGODB_HOST=localhost

COPY ./package.json /server
COPY ./package-lock.json /server

RUN npm install --force

COPY ./nodemon.json /server
COPY ./tsconfig.json /server
COPY ./src /server/src

RUN npm run build

CMD npm run start