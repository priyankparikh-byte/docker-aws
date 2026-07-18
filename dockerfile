# build frontend
FROM node:18-alpine as build-frontend

COPY ./frontend /app
WORKDIR /app
RUN npm install
RUN npm run build

#build backend
FROM node:18-alpine as build-backend
COPY ./backend /app
WORKDIR /app
RUN npm install
COPY --from=build-frontend /app/dist /app/public