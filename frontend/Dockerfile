# Use Nginx to serve the static frontend.
FROM nginx:alpine

# Copy the reverse-proxy configuration.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the frontend page.
COPY index.html /usr/share/nginx/html/index.html

# Nginx listens on port 80.
EXPOSE 80

# Run Nginx in the foreground.
CMD ["nginx", "-g", "daemon off;"]

