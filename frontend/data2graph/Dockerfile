FROM node:20-alpine as builder

WORKDIR '/app'

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL $VITE_API_URL

RUN npm install
RUN npm run build

FROM nginx

EXPOSE 80

COPY --from=builder '/app/dist' '/usr/share/nginx/html'
