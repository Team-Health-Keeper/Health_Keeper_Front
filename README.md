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

예시 (현재 코드 기준):

```
feat(auth): sessionStorage authToken 기반 보호 페이지 가드
fix(logout): 로딩 오버레이 종료 및 홈 토스트 표시
feat(results): warm_up/main/cool_down 파싱 및 폴백 추가
feat(assessment): 악력 측정 코드 7만 사용, 52 계산 반영
fix(a11y): DialogContent에 aria-describedby 지원
style(hero): 모바일에서 슬라이드 화살표 숨김
feat(routes): 3×3 버튼 테스트/T-Wall 페이지 공개 경로 허용
```

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

---

## 8. 라우팅 & 접근 제어

- 라우터: `react-router-dom`
- 글로벌 라우트 가드: `src/App.tsx`
  - 공개 경로: `/`(홈), `/recipes`, `/recipes/:id`, `/community`, `/facilities`, `/three-grid`, `/twall`
  - 보호 경로(로그인 필요): `/assessment`, `/my`, `/exercise`, `/exercise/:id`, `/exercise/result`, `/results`
  - 비로그인 사용자가 보호 경로 접근 시: 메인(`/`)으로 이동 + 로그인 모달 오픈

### 인증
- 소스: `src/lib/auth.ts`
- 기준: `sessionStorage`의 `authToken` 존재 여부만 체크 (`isAuthenticated()`)
- 헤더/홈 CTA에서 미로그인 시 로그인 모달 표시

---

## 9. 주요 페이지/컴포넌트

- `Home` (`src/pages/Home.tsx`): 히어로/CTA. 모바일에서 슬라이드 화살표 숨김.
- `Assessment` (`src/pages/Assessment.tsx`): 측정 입력/분석. 악력은 코드 7만 사용, 52는 7로부터 계산.
- `Results` (`src/pages/Results.tsx`): 분석 결과/운동 레시피.
  - 응답 키 래핑 지원: `data.result`/`data.data` 처리
  - 리스트 키 지원: `warm_up_card_list`/`main_card_list`/`cool_down_card_list`
  - 로드 폴백: `sessionStorage` → `localStorage` → URL `?analysis=` 파라미터
- `Exercise`/`ExercisePlay`/`ExerciseResult`: AI 코치/자세 분석 플로우(보호 경로)
- `ThreeByThreeTest` (`/three-grid`), `TWallTest` (`/twall`): 공개 테스트 페이지, 로그인 없이 접근 가능
- `LoginModal`, `YouTubeModal`, `RecipeMetaHeader`, `ExerciseVideoCard`, `ExercisePhaseSection` 등 UI 컴포넌트

---

## 10. 접근성(A11y)

- `DialogContent`에 `ariaDescribedBy` 지원 → 필요 시 `aria-describedby` 설정 가능
- 인터랙션 요소에 명확한 `aria-label` 제공(히어로 슬라이드, 패널 카드 등)

---

## 11. 개발 팁

- 세션 스토리지 제한: 도메인/포트가 달라지면 값 공유 안 됨 → 분석 결과 전달 시 로컬스토리지/URL 파라미터 폴백 사용
- 스타일: Tailwind 유틸 기반, 컴포넌트 클래스 변경으로 빠른 UI 조정
- 이미지/영상: `loading="lazy"`로 로딩 최적화
