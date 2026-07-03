# AWEAR Lab Frontend

GIST AWEAR Lab(AI-based WEArable Robotics Laboratory) 웹사이트 개편 프론트엔드.
Vue 3 + Vite + TypeScript로 작성되었으며, 현재는 Home 페이지만 구현되어 있습니다.
백엔드는 Next.js API가 아니라 Firebase(Firestore + Storage)를 사용합니다.

## 시작하기

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
```

## 구조 원칙

- **한 페이지 = 한 파일**: 각 페이지의 모든 섹션은 `src/pages/` 아래 파일 하나에 모아서 작성합니다.
  섹션마다 파일을 쪼개지 않습니다.
- **반복되는 요소만 컴포넌트로 분리**: 여러 페이지에서 재사용되거나(Nav, Footer), 같은 형태가
  리스트로 반복되는 것(카드, 아바타 등)만 `src/components/`로 뺍니다. 나중에 Member 페이지를
  만들 때 멤버 카드 같은 게 여기 해당합니다.
- **CSS는 항상 별도 파일**: 컴포넌트/페이지 옆에 같은 이름의 `.css` 파일을 두고
  `<style src="./styles/파일명.css" scoped></style>`로 불러옵니다. `.vue` 파일 안에 스타일을
  직접 적지 않습니다.

## 구조

```
src/
  components/                재사용 컴포넌트 (여러 페이지에서 쓰거나, 리스트로 반복되는 것)
    TheNav.vue                상단 고정 내비게이션
    TheFooter.vue              푸터
    SignalDivider.vue          섹션 구분용 바이오시그널 라인 (여러 페이지에서 재사용)
    SkeletonLoader.vue          비동기 로딩 중 표시할 스켈레톤 placeholder
    styles/                    위 컴포넌트들의 CSS

  pages/                      페이지 (한 페이지 = 한 파일)
    HomePage.vue                Home 페이지 전체 (Hero/Mission/Research/News/PI/Join 섹션 포함)
    styles/
      HomePage.css               HomePage의 모든 섹션 스타일 (섹션별 클래스로 구분)

  composables/
    useNews.ts                 Firestore "news" 컬렉션 조회 (loading/error 상태 포함)

  App.vue                     TheNav + 현재 페이지 + TheFooter 조립
  firebase.ts                 Firebase 초기화 (env 없으면 자동으로 건너뜀)
  style.css                   디자인 토큰 (색상/타이포/레이아웃, 전역)
```

새 페이지를 추가할 때(예: Member 페이지)는 `src/pages/MemberPage.vue` + `src/pages/styles/MemberPage.css`
하나씩만 늘리면 되고, 카드처럼 반복되는 부분만 `src/components/MemberCard.vue`로 뺍니다.

## 디자인 토큰

`src/style.css`의 `:root`에 색상(--cyan, --violet 등), 폰트(Space Grotesk / Inter / IBM Plex Mono),
레이아웃 변수가 정의되어 있습니다. 새 페이지를 추가할 때 이 토큰을 재사용하세요.

## 비동기 로딩 & 스켈레톤

지금은 프론트엔드만 만드는 단계라 대부분 정적 데이터지만, News 섹션은 이미 Firestore에서
데이터를 가져오는 구조로 되어 있어서 실제 API 연동 시 어떻게 로딩 상태를 처리할지 보여주는
예시 역할도 합니다.

- `useNews()`가 `{ news, loading, error }`를 반환
- `loading`이 true인 동안 `SkeletonLoader`로 뼈대만 표시
- 로딩이 끝났는데 데이터가 없으면(Firestore 미연결 또는 컬렉션 비어있음) 정적 `fallbackNews`로 대체

나중에 Member 페이지처럼 API 호출이 필요한 곳에도 같은 패턴(로딩 중엔 `SkeletonLoader`,
끝나면 실제 카드 렌더링)을 그대로 적용하면 됩니다.

## Firebase 연동

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. Firestore 데이터베이스 생성 시 **Standard 에디션**, Native 모드 선택 (기본값)
3. 웹 앱 등록 후 나온 설정값을 `.env.local`에 채워 넣기 (`.env.example` 참고, `.env.local`은 git에 커밋되지 않음)
4. `src/firebase.ts`가 값이 채워지면 자동으로 Firebase에 연결하고, 비어 있으면 정적 데이터로 동작합니다

### 데이터 모델 예시 (News)

Firestore에 `news` 컬렉션을 만들고 문서마다 아래 필드를 채우면 `HomePage`가 자동으로 가져옵니다.

```
news/{자동 ID}
  date: string   예) "2026.04"  (내림차순 정렬 기준)
  desc: string   소식 내용
```

## 다음 단계

- Research / Publications / Member / Internship / News / Contact 등 나머지 페이지 추가
  (`src/pages/`에 파일 추가 + Vue Router 도입 필요)
- Member/Alumni용 `MemberCard.vue` 컴포넌트 + `useMembers.ts` composable 추가 (News와 같은 패턴)
- 관리자 페이지 또는 Firebase 콘솔에서 직접 데이터 입력 방식 결정
- 실제 프로필 사진 및 로고 에셋 교체
