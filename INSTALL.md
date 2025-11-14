# 📦 설치 가이드

이 문서는 쿠팡 윙 상품등록 도우미를 설치하는 단계별 가이드입니다.

## 📋 체크리스트

설치 전 다음 사항을 확인하세요:

- [ ] Chrome 브라우저 86+ 이상 설치됨
- [ ] CSV 파일 준비됨 (브랜드, 상품명, 판매가 컬럼 필수)
- [ ] 이미지 폴더 준비됨 (선택사항)

## 🔧 설치 단계

### 1단계: 프로젝트 다운로드

```bash
# Git clone (또는 ZIP 다운로드)
git clone <repository-url>
cd coupang-wing-helper
```

### 2단계: PapaParse 라이브러리 설치

**중요**: CSV 파싱을 위해 PapaParse 라이브러리가 필요합니다.

#### 방법 A: 직접 다운로드 (추천)

1. 브라우저에서 다음 URL 열기:
   ```
   https://unpkg.com/papaparse@5.4.1/papaparse.min.js
   ```

2. 페이지 내용 전체 선택 (Ctrl+A) 및 복사 (Ctrl+C)

3. `lib/papaparse.min.js` 파일 생성 및 붙여넣기

4. 파일 크기 확인 (약 35-40KB여야 함)

#### 방법 B: npm 사용 (선택사항)

```bash
npm install papaparse
cp node_modules/papaparse/papaparse.min.js lib/
```

#### 방법 C: CDN 사용

`popup/index.html` 파일 수정:
```html
<!-- 이 줄을 찾아서 -->
<script src="../lib/papaparse.min.js"></script>

<!-- 다음으로 변경 -->
<script src="https://unpkg.com/papaparse@5.4.1/papaparse.min.js"></script>
```

### 3단계: 아이콘 이미지 생성

크롬 확장앱은 다음 크기의 아이콘이 필요합니다:
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

#### 방법 A: 온라인 변환 도구 (추천)

1. https://svgtopng.com/ 방문
2. `icons/icon.svg` 파일 업로드
3. 각 크기로 변환 (16, 48, 128)
4. `icons/` 폴더에 저장

#### 방법 B: ImageMagick (터미널)

```bash
cd icons/
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

#### 방법 C: 임시 Placeholder (개발/테스트용)

온라인에서 임시 아이콘 다운로드:
- [16x16](https://via.placeholder.com/16x16/0066cc/ffffff?text=CW)
- [48x48](https://via.placeholder.com/48x48/0066cc/ffffff?text=CW)
- [128x128](https://via.placeholder.com/128x128/0066cc/ffffff?text=CW)

### 4단계: Chrome에 확장앱 로드

1. Chrome 브라우저 열기

2. 주소창에 입력:
   ```
   chrome://extensions/
   ```

3. 우측 상단 **개발자 모드** 토글 ON

4. **압축해제된 확장 프로그램을 로드합니다** 클릭

5. 프로젝트 폴더 선택 (coupang-wing-helper/)

6. 확장앱이 목록에 표시되면 성공!

### 5단계: 설치 확인

1. Chrome 툴바에 확장앱 아이콘이 표시되는지 확인

2. 아이콘 클릭 시 새 창이 열리는지 확인

3. 개발자 도구 (F12)를 열고 콘솔에 오류가 없는지 확인

## ❓ 설치 문제 해결

### 오류: "This extension is not recognized"

**원인**: manifest.json 파일 오류

**해결**:
1. manifest.json 파일이 존재하는지 확인
2. JSON 문법 오류 확인 (https://jsonlint.com/)
3. Chrome 재시작

### 오류: "Papa is not defined"

**원인**: PapaParse 라이브러리가 로드되지 않음

**해결**:
1. `lib/papaparse.min.js` 파일 존재 확인
2. 파일 크기 확인 (13 bytes 이하면 다운로드 실패)
3. CDN 방식으로 변경 (위 2단계 방법 C 참조)

### 오류: 아이콘이 표시되지 않음

**원인**: 아이콘 파일 누락

**해결**:
1. `icons/` 폴더에 icon16.png, icon48.png, icon128.png 존재 확인
2. 임시로 placeholder 이미지 사용 (위 3단계 방법 C)
3. 확장앱 새로고침 (chrome://extensions/ 에서 새로고침 버튼)

### 확장앱이 로드되지 않음

**원인**: 폴더 구조 문제

**해결**:
1. manifest.json이 프로젝트 루트에 있는지 확인
2. 다음 폴더 구조 확인:
   ```
   coupang-wing-helper/
   ├── manifest.json  ← 루트에 있어야 함
   ├── popup/
   ├── background/
   └── ...
   ```

### "File System Access API not supported"

**원인**: 구버전 Chrome

**해결**:
1. Chrome 버전 확인 (chrome://settings/help)
2. Chrome 86+ 이상으로 업데이트

## ✅ 설치 완료!

모든 단계를 완료했다면:

1. 확장앱 아이콘 클릭
2. CSV 파일 선택
3. 이미지 폴더 선택
4. 내부관리번호 설정
5. 변환 시작

→ [사용 방법](README.md#-사용-방법) 참조

## 🆘 추가 도움이 필요하신가요?

- [README](README.md): 전체 문서
- [Issues](../../issues): 버그 리포트 및 문의
- [lib/README.md](lib/README.md): PapaParse 상세 가이드
- [icons/README.md](icons/README.md): 아이콘 생성 가이드
