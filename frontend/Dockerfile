# Use Nginx to serve the static website
FROM nginx:alpine

# Added the reverse-proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Added static frontend page
COPY index.html /usr/share/nginx/html/index.html

# Nginx listens on port 80
EXPOSE 80

# Keep Nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]

