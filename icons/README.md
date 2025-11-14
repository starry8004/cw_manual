# 아이콘 생성 방법

`icon.svg` 파일을 PNG 형식으로 변환해야 합니다.

## 필요한 파일
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## 변환 방법

### 방법 1: 온라인 도구 사용 (추천)
1. https://svgtopng.com/ 또는 https://convertio.co/kr/svg-png/ 방문
2. `icon.svg` 파일 업로드
3. 크기별로 변환:
   - 16x16 → `icon16.png`
   - 48x48 → `icon48.png`
   - 128x128 → `icon128.png`
4. 변환된 파일을 이 폴더(`icons/`)에 저장

### 방법 2: ImageMagick 사용 (터미널)
```bash
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

### 방법 3: Inkscape 사용
1. Inkscape에서 `icon.svg` 열기
2. File → Export PNG Image
3. 각 크기별로 내보내기

### 방법 4: 임시 대체 아이콘
개발/테스트 중이라면, 단색 PNG 파일로 임시 대체 가능:
- https://via.placeholder.com/16x16/0066cc/ffffff?text=CW
- https://via.placeholder.com/48x48/0066cc/ffffff?text=CW
- https://via.placeholder.com/128x128/0066cc/ffffff?text=CW

위 URL에서 이미지를 다운로드하여 사용할 수 있습니다.

## 확인
변환 후 다음 파일들이 있어야 합니다:
```
icons/
├── icon.svg
├── icon16.png
├── icon48.png
└── icon128.png
```
