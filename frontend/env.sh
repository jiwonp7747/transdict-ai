#!/bin/sh

# 생성할 파일 경로 설정
OUTPUT_FILE="/usr/share/nginx/html/env-config.js"

echo "Generating $OUTPUT_FILE..."

# 파일 초기화 및 시작 부분 작성
echo "window._env_ = {" > $OUTPUT_FILE

# 시스템 환경변수 중 REACT_APP_으로 시작하는 것들을 찾아 JS 객체 형태로 변환
# 예: REACT_APP_API_URL=http://localhost:8000 -> "REACT_APP_API_URL": "http://localhost:8000",
env | grep REACT_APP_ | awk -F = '{print "  \"" $1 "\": \"" $2 "\","}' >> $OUTPUT_FILE

# 마지막 괄호 닫기
echo "};" >> $OUTPUT_FILE

echo "Configuration generated successfully:"
cat $OUTPUT_FILE