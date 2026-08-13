# AWEAR Lab Frontend

GIST AWEAR Lab(AI-based WEArable Robotics Laboratory) 웹사이트 개편 프론트엔드.
Vue 3 + Vite + TypeScript + Vue Router로 작성되었으며, 백엔드는 Firebase(Firestore + Storage)를 사용합니다.

디자인은 두 곳을 참고했습니다.

- **Stanford Biomechatronics Lab** (biomechatronics.stanford.edu) — 사진 중심 히어로, "Glimpses of our Research" 갤러리
- **KIXLAB @ KAIST** (kixlab.org) — 태그 붙은 뉴스 피드, 연구 테마 칩, 미디어(영상) 섹션

## 시작하기

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
```

## 페이지 구성

| 경로 | 파일 | 설명 |
|---|---|---|
| `/` | `pages/HomePage.vue` | 사진 히어로, Mission, 연구 테마 칩, 연구 갤러리, Media, News 미리보기, PI, Join |
| `/research` | `pages/ResearchPage.vue` | 연구 분야 상세 (지그재그 레이아웃, Home 테마 칩과 앵커로 연결) |
| `/publications` | `pages/PublicationsPage.vue` | 논문 목록 — 테마 칩 클릭으로 필터링(클라이언트 사이드, 백엔드 불필요) + 호버 시 요약 카드 |
| `/member` | `pages/MemberPage.vue` | PI 소개 + 대학원생/학부생/졸업생 그리드 |
| `/internship` | `pages/InternshipPage.vue` | 인턴 모집 분야/자격 + 지원 CTA |
| `/news` | `pages/NewsPage.vue` | 전체 소식 목록 (Firestore + 스켈레톤 + 카테고리 태그) |
| `/contact` | `pages/ContactPage.vue` | 연락처 + 카카오맵 (주소 지오코딩) |

## 구조 원칙

- **한 페이지 = 한 파일**: 각 페이지의 섹션은 파일 하나에 모아서 작성 (`src/pages/`)
- **반복되는 요소만 컴포넌트로 분리**: `src/components/`
  - `TheNav.vue`, `TheFooter.vue` — 모든 페이지 공통
  - `PageHeader.vue` — Home을 제외한 모든 페이지 상단
  - `SignalDivider.vue` — 섹션 구분용 바이오시그널 라인
  - `SkeletonLoader.vue` — 비동기 로딩 스켈레톤 (범용)
  - `NewsItem.vue` — 뉴스 한 줄 + 카테고리 태그 (Home 미리보기 + News 전체 페이지 공용)
  - `MemberCard.vue` — 멤버 카드 (Member 페이지에서 반복 사용)
  - `PublicationItem.vue` — 논문 한 줄 + 테마 태그 + **2초 호버 시 요약 카드**
- **CSS는 항상 별도 파일**: `<style src="./styles/파일명.css" scoped></style>` 로 불러옴

## Home ↔ Research 연결 (테마 칩)

Home의 "Research Themes" 칩(`#topic-1` ~ `#topic-4`)은 `/research` 페이지의 같은 id를 가진
섹션으로 스크롤 이동합니다 (`router/index.ts`의 `scrollBehavior`가 해시를 처리). 테마를 추가/삭제할
땐 `HomePage.vue`의 `themes` 배열과 `ResearchPage.vue`의 `topics` 배열의 `id`를 맞춰주면 됩니다.

## 논문 필터 & 호버 요약

- `PublicationsPage.vue`의 테마 칩은 실제로 동작하는 **클라이언트 사이드 필터**입니다. 논문 배열의
  `theme` 값을 기준으로 자동 생성되고, 클릭하면 해당 테마만 걸러서 보여줍니다. 별도 서버 호출 없이
  Vue의 `computed`만으로 구현했어요.
- `PublicationItem.vue`에 마우스를 2초 이상 올리면 `.summary-card`가 펼쳐집니다. 지금은 내용이
  전부 `[]`로 비어있고 **기능만** 구현되어 있어요. 실제 요약 텍스트는 `summary` 같은 prop을 추가해서
  나중에 채우면 됩니다.

## 색상 테마

흰색 배경 + 오렌지 계열 액센트. `src/style.css`의 `:root`에서 전부 관리합니다.

```
--bg            #ffffff   기본 배경
--surface       #fbf8f5   카드/패널
--border        #e6dcd1   선/테두리
--text          #201810   본문 텍스트
--text-muted    #6f6255   보조 텍스트
--orange        #ff5a1f   기본 강조색 (선, 태그, 포인트)
--orange-deep   #d8430e   강조색 진한 버전 (hover, 텍스트 강조)
```

## 로고/이미지 (webp)

`TheNav.vue`의 마크와 `public/favicon.svg`는 지금 임시 오렌지 추상 아이콘입니다. 실제 로고나 사진을
받으면 `public/` 아래에 `.webp`로 저장해서 각 `ph-label`(placeholder) 자리에 `<img>`로 교체하면 됩니다.

```bash
npx @squoosh/cli --webp auto 원본파일.png -d public/
```

## Firebase 연동

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. Firestore 데이터베이스 생성 시 **Standard 에디션**, Native 모드 선택 (기본값)
3. 웹 앱 등록 후 나온 설정값을 `.env.local`에 채워 넣기 (`.env.example` 참고)
4. `src/firebase.ts`가 값이 채워지면 자동으로 Firebase에 연결하고, 비어 있으면 정적 데이터로 동작

### 데이터 모델 예시 (News)

```
news/{자동 ID}
  date: string   예) "2026.04"
  desc: string   소식 내용
  tag: string    예) "publication", "award" (선택)
```

## Home 페이지 스크롤 스냅

`HomePage.vue`는 일반적인 자유 스크롤 대신, 섹션 단위로 딱딱 맞춰 넘어가는 스크롤 스냅으로
되어 있습니다 (`pages/styles/HomePage.css`의 `.snap-page`).

- `<main class="snap-page">`가 `height: 100svh; overflow-y: auto; scroll-snap-type: y mandatory;`로
  자체 스크롤 영역이 됩니다 — `html`/`body` 전체에 적용하지 않아서 다른 페이지(Research, Publications
  등 목록형 페이지)는 영향받지 않습니다
- 각 `<section>`은 `min-height: 100svh`로 최소 한 화면을 채우고, `scroll-snap-align: start`로 섹션
  시작 지점에 맞춰 멈춥니다. 내용이 한 화면보다 길면(Gallery, News 등) `min-height`는 최솟값이라 그
  이상으로 자연스럽게 늘어납니다
- `scroll-padding-top: 76px`로 상단 고정 nav에 가려지지 않게 오프셋을 줬습니다
- 다 스크롤한 뒤에는(마지막 섹션 이후) 바깥 문서 스크롤로 자연스럽게 이어져 Footer가 나옵니다
- `prefers-reduced-motion`인 경우 스냅을 끕니다

다른 페이지에도 이 효과를 적용하고 싶으면 같은 페이지의 `<main>`에 `snap-page` 클래스를 추가하고
직속 `<section>`들에 맞춰 CSS를 조정하면 됩니다. 다만 Publications/Member/News처럼 리스트가 긴
페이지는 스냅이 오히려 불편할 수 있어서 지금은 Home에만 적용했습니다.

## Kakao 지도 연동 (Contact 페이지)

1. [Kakao Developers](https://developers.kakao.com) 앱 생성 → 앱 키 > JavaScript 키 발급
2. [내 애플리케이션] > [플랫폼] > Web 플랫폼 등록 시 개발 도메인(`http://localhost:5173`) 등록
3. 발급받은 키를 `.env.local`에 `VITE_KAKAO_MAP_KEY`로 채워 넣기
4. `ContactPage.vue`의 `<KakaoMap address="..." />`에 넘기는 주소를 실제 주소로 맞추면, 별도 좌표 입력 없이
   Kakao Geocoder가 런타임에 주소 → 좌표 변환을 해줍니다
5. 키가 없으면 자동으로 "지도 영역 — VITE_KAKAO_MAP_KEY 설정 필요" placeholder가 뜨고, 나머지 페이지는
   정상 동작합니다 (Firebase와 동일한 옵셔널 연동 패턴)

지도 SDK 자체(마커 표시 등 기본 기능)는 무료입니다. 네이버 지도 API는 2025년에 무료 이용량 제공이
종료돼서 카카오맵으로 선택했어요.

## 다음 단계

- 실제 로고/사진 반영 (webp)
- Publications 호버 요약 카드, Media 섹션에 실제 콘텐츠 연결
- Member/Publications용 `useMembers.ts` / `usePublications.ts` composable 추가 (News와 같은 패턴)
