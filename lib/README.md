# PapaParse 라이브러리 설치 방법

이 프로젝트는 CSV 파싱을 위해 PapaParse 라이브러리가 필요합니다.

## 설치 방법

다음 중 하나의 방법으로 `papaparse.min.js` 파일을 이 폴더(`lib/`)에 다운로드하세요:

### 방법 1: 직접 다운로드
1. https://unpkg.com/papaparse@5.4.1/papaparse.min.js 를 브라우저에서 열기
2. 페이지 전체를 선택 (Ctrl+A)
3. 복사 (Ctrl+C)
4. `lib/papaparse.min.js` 파일로 저장

### 방법 2: CDN 링크 사용
다운로드 대신 HTML에서 CDN 링크를 직접 사용할 수도 있습니다.

`popup/index.html` 파일에서:

```html
<!-- 현재: 로컬 파일 -->
<script src="../lib/papaparse.min.js"></script>

<!-- 대신 CDN 사용 -->
<script src="https://unpkg.com/papaparse@5.4.1/papaparse.min.js"></script>
```

### 방법 3: npm (선택사항)
```bash
npm install papaparse
# 그 후 node_modules/papaparse/papaparse.min.js를 이 폴더로 복사
```

## 확인
파일이 제대로 다운로드되었는지 확인:
- 파일 크기: 약 35-40KB
- 파일 시작: `/* @license ... */` 주석으로 시작

## 문제 해결
- 파일이 너무 작다면 (13 bytes): 다운로드 실패, 다시 시도
- 확장앱이 작동하지 않으면: 브라우저 개발자 도구(F12) 콘솔에서 에러 확인
