# Build command on Apple M1: docker buildx build --platform linux/amd64 --push -t vaimeedock/sepastudio .
FROM nginx:alpine
COPY / /usr/share/nginx/html