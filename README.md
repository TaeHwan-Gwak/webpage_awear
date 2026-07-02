# AWEAR Lab Frontend

GIST AWEAR Lab(AI-based WEArable Robotics Laboratory) 웹사이트 개편 프론트엔드.
Vue 3 + Vite + TypeScript로 작성되었으며, 현재는 Home 페이지만 구현되어 있습니다.
백엔드/미들웨어(Next.js)는 별도 저장소로 분리해서 붙일 예정입니다.

## 시작하기

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
```

## 구조

```
src/
  components/
    TheNav.vue          상단 고정 내비게이션
    HeroSection.vue      히어로 + 시그널 라인 애니메이션
    SignalDivider.vue    섹션 구분용 재사용 컴포넌트 (바이오시그널 모티프)
    MissionSection.vue   미션 선언 + 통계
    ResearchSection.vue  연구 분야 4개 카드
    NewsSection.vue      최신 소식 타임라인
    PISection.vue        지도교수 소개
    JoinSection.vue      인턴 모집 CTA
    TheFooter.vue        푸터
  App.vue                 섹션 조립
  style.css               디자인 토큰 (색상/타이포/레이아웃)
```

## 디자인 토큰

`src/style.css`의 `:root`에 색상(--cyan, --violet 등), 폰트(Space Grotesk / Inter / IBM Plex Mono),
레이아웃 변수가 정의되어 있습니다. 새 섹션을 추가할 때 이 토큰을 재사용하세요.

## Firebase 연동

백엔드는 Next.js 대신 Firebase(Firestore + Storage)를 사용합니다.

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. Firestore 데이터베이스 생성 시 **Standard 에디션**, Native 모드 선택 (기본값)
3. 웹 앱 등록 후 나온 설정값을 `.env.local`에 채워 넣기 (`.env.example` 참고, `.env.local`은 git에 커밋되지 않음)
4. `src/firebase.ts`가 값이 채워지면 자동으로 Firebase에 연결하고, 비어 있으면 정적 데이터로 동작합니다 (초기 개발 중에도 앱이 깨지지 않음)

### 데이터 모델 예시 (News)

Firestore에 `news` 컬렉션을 만들고 문서마다 아래 필드를 채우면 `NewsSection`이 자동으로 가져옵니다.

```
news/{자동 ID}
  date: string   예) "2026.04"  (내림차순 정렬 기준)
  desc: string   소식 내용
```

컬렉션이 비어 있거나 아직 Firebase를 연결하지 않았다면 `NewsSection.vue`에 있는 `fallbackNews` 배열이 대신 표시됩니다.

관련 코드: `src/firebase.ts`(초기화), `src/composables/useNews.ts`(조회 로직)

## 다음 단계

- Research / Publications / Member / Internship / News / Contact 등 나머지 페이지 추가 (Vue Router 도입 필요)
- Member/Alumni, 사진(Storage) 등 나머지 컬렉션 및 composable 추가
- 관리자 페이지 또는 Firebase 콘솔에서 직접 데이터 입력 방식 결정
- 실제 프로필 사진 및 로고 에셋 교체
