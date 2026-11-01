

# збірка 
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_CURRENCY_SPREAD=0.005
ENV VITE_CURRENCY_SPREAD=$VITE_CURRENCY_SPREAD

# Коли з'явиться backend, додати сюди:
# ARG VITE_API_URL=http://localhost:5000
# ENV VITE_API_URL=$VITE_API_URL

RUN npm run build




# роздача через nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]