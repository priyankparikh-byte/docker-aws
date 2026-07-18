# build frontend
FROM node:22-alpine AS build-frontend

COPY ./frontend /app
WORKDIR /app
RUN npm install
RUN npm run build

#build backend
FROM node:22-alpine AS build-backend
COPY ./backend /app
WORKDIR /app
RUN npm install
COPY --from=build-frontend /app/dist /app/public

# runtime stage
FROM node:22-alpine
COPY --from=build-backend /app /app
WORKDIR /app
RUN npm install --production
EXPOSE 3000
CMD ["node", "server.js"]
