# Base stage
FROM node:20 as base
WORKDIR /app
COPY package.json .
COPY . .
EXPOSE 4000
RUN npm install -g @nestjs/cli

# Production stage
FROM base as production
RUN npm install --omit=dev
RUN npm run build
CMD npm run migration:run && npm start

# Development stage
FROM base as development
RUN npm install
RUN npm install -g @nestjs/cli
CMD npm run migration:run && npm run seed && npm run dev