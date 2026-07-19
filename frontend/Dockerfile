FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_SERVER_BASE_URL=/api/v1
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM nginx:alpine

# Install envsubst
RUN apk add --no-cache gettext

# Copy nginx template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy React build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '$BACKEND_HOST' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]



