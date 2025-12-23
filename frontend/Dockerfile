# build stage
FROM node:20-alpine AS builder

WORKDIR /app

# npm install
COPY package.json package-lock.json ./
RUN npm install

# source copy
COPY . .
RUN npm run build

# run stage
FROM nginx:stable-alpine

# build results copy
COPY --from=builder /app/build /usr/share/nginx/html

# env injection on runtime
COPY ./env.sh /docker-entrypoint.d/env.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/env.sh && \
    chmod +x /docker-entrypoint.d/env.sh

# nginx extra setting
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]