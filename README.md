# AWEAR Lab Frontend

## 시작하기

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
```

`.env.example`을 복사해서 `.env.local`

## 페이지 구성

| 경로 | 파일 |
|---|---|
| `/` | `pages/HomePage.vue` |
| `/research` | `pages/ResearchPage.vue` |
| `/publications` | `pages/PublicationsPage.vue` |
| `/member` | `pages/MemberPage.vue` |
| `/news` | `pages/NewsPage.vue` |
| `/contact` | `pages/ContactPage.vue` (인턴 모집 정보 포함) |
| `/internship` | `/contact#internship`으로 리다이렉트 |
| `/admin/login`, `/admin` | 비밀번호로 보호되는 관리자 영역, nav에는 링크 없음 |

## 구조 원칙

- 한 페이지 = 한 파일 (`src/pages/`), 섹션별로 쪼개지 않음
- 여러 페이지에서 재사용되거나 리스트로 반복되는 것만 `src/components/`로 분리
  (`TheNav`, `TheFooter`, `PageHeader`, `SignalDivider`, `SkeletonLoader`, `NewsItem`, `MemberCard`, `PublicationItem`)
- CSS는 항상 별도 파일 + `<style src="./styles/파일명.css" scoped>`로 불러옴
- 관리자 페이지는 `src/pages/admin/`, 라우트는 `router/index.ts`의 `/admin` 항목 `children`에 추가

## 색상 테마

`src/style.css`의 `:root`에서 관리 (흰 배경 + 오렌지 액센트).
`--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--orange`, `--orange-deep`

## 할 일

- [ ] 실제 로고/사진으로 교체 (`.webp`) — 지금은 `public/logo.webp`가 임시 로고,
      Home 히어로(`heroImages`)는 picsum.photos 예시 사진, 나머지는 회색 placeholder
- [ ] 모든 페이지의 placeholder 텍스트(이름, 소개 문구 등) 실제 내용으로 교체
- [ ] Publications 호버 요약 카드(`PublicationItem.vue`)에 실제 논문 요약 연결
- [ ] Media 섹션(Home)에 실제 영상/링크 연결
- [ ] Firebase 프로젝트 생성 후 `.env.local`에 값 채우기, News처럼 Member/Publications용
      composable(`useMembers.ts`, `usePublications.ts`) 추가
- [ ] Kakao Maps 앱 키 발급 후 `.env.local`에 채우기 (Contact 페이지 지도)
- [ ] 관리자 페이지: 지금은 비밀번호 하나로 막아둔 임시 버전(`useAdminAuth.ts`).
      실제 운영 전에 Firebase Authentication + Firestore 보안 규칙으로 교체 필요
- [ ] 관리자 하위 페이지(뉴스/논문/멤버 관리 등) 추가
