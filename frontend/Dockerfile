# ====== 1단계: 빌드 환경 (Node.js) ======
FROM node:20-alpine AS builder

WORKDIR /app

# 종속성 설치 (캐싱 활용을 위해 package.json 먼저 복사)
COPY package.json package-lock.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# ====== 2단계: 실행 환경 (Nginx) ======
FROM nginx:stable-alpine

# 빌드 단계에서 생성된 정적 파일들을 Nginx 기본 경로로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# env 주입 스크립트 nginx가 실행될 때 자동으로 실행
COPY ./env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

# Nginx 설정 파일이 따로 있다면 복사 (선택 사항)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]