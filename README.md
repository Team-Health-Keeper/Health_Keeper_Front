# 🏋️‍♀️ Health Keeper Front

---

## 1. 프로젝트 개요

- 레포 이름: `Health_Keeper_Front`
- 프레임워크: **React + Vite**
- 스타일: **Tailwind CSS** (+ custom theme, Pretendard / GMarketSans 폰트)
- 목적:
  - 헬스/운동/측정 데이터 시각화
  - 사용자 맞춤 피드/추천 로직 붙일 수 있는 베이스 만들기
  - 나중에 백엔드(Health Keeper API)랑 붙이는 전용 프론트엔드

---

## 2. 기술 스택

- **React 18**
- **Vite**
- **TypeScript**
- **react-router-dom**
- **Tailwind CSS**
- 기타:
  - Pretendard, GMarketSans (CDN)

---

## 3. 프로젝트 구조

```
root
├─ public/
│  ├─ icon.svg
│  └─ ...
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ pages/
│  ├─ components/
│  ├─ lib/
│  └─ globals.css
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

---

## 4. 실행 방법

### 4-1. 설치

```
npm install
```

### 4-2. 개발 서버

```
npm run dev
```

### 4-3. 빌드

```
npm run build
npm run preview
```

---

## 5. 브랜치 전략 (초안)

- 기본: `main`
- 작업: `feature/*`

예시:

```
git checkout -b feature/login-ui
git commit -m "feat: 로그인 화면 추가"
git push origin feature/login-ui
```

---

## 6. 커밋 컨벤션

- `feat` – 새로운 기능
- `fix` – 버그 수정
- `refactor` – 리팩터링
- `style` – 스타일/UI 관련
- `chore` – 설정/빌드 관련

---

## 7. 환경 변수

### 소셜 로그인 (OAuth) 관련

```
# Kakao
VITE_KAKAO_CLIENT_ID=...
VITE_KAKAO_REDIRECT_URI=...

# Naver
VITE_NAVER_CLIENT_ID=...
VITE_NAVER_REDIRECT_URI=...

# Google
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_REDIRECT_URI=...
```
