FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY index.html style.css script.js schedule.mjs pdf.mjs ./
COPY img/Logo_JerePrograma_500mp.png ./img/Logo_JerePrograma_500mp.png
COPY scripts ./scripts
ARG SOURCE_COMMIT
ENV SOURCE_COMMIT=$SOURCE_COMMIT
RUN npm run build && npm run check

FROM scratch AS static
COPY --from=build /app/dist /dist

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY deployment/vps/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/calendario-servicios/
USER 101:101
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
