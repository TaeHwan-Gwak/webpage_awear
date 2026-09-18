# AWEAR Lab 웹사이트 — 작업 인계 문서

Claude 채팅에서 VS Code Claude 익스텐션으로 작업을 옮기면서 정리한 문서입니다.
새 세션에서 이 파일을 먼저 읽으면 지금까지 맥락을 빠르게 파악할 수 있어요.

## 프로젝트 개요

- **스택**: Vue 3 + Vite + TypeScript + Vue Router 4
- **배포**: Vercel (`https://webpageawearnew.vercel.app`, 커스텀 도메인 `awearlab.com` 아직 미연결)
- **데이터**: 백엔드 DB 없음. `src/data/*.json` 파일이 곧 데이터베이스 역할
- **이미지**: `public/{member,news,publications,equipment}/` 폴더에 저장, JSON엔 경로 문자열만 저장

## 사이트 구조 (라우트)

| 경로 | 페이지 |
|---|---|
| `/` | Home |
| `/research` | Research (BCI/뉴럴, 로보틱스/의수, AI/비전 3개 주제) |
| `/publication` | Publications (예전 Wix 주소가 단수형이라 맞춤. `/publications` 아님 주의) |
| `/member` | Member (PI, 포닥, 현재 학생, Alumni) |
| `/member/cv` | PI 이력서 |
| `/news` | News |
| `/equipment` | Equipment |
| `/contact` | Contact (예전 Internship 페이지 병합됨) |
| `/admin/login` | 관리자 로그인 |
| `/admin/stats` | 관리자 전용 통계 링크 페이지 (admin 로그인 시 nav 맨 끝에 탭 노출) |

예전 Wix 주소 리다이렉트는 `vercel.json`에 있음 (`/principal-investigator`→`/member`, `/internship`→`/contact#internship`, `/contact-me`→`/contact`).

## Admin / 편집 시스템 — 제일 중요한 개념

**"별도 관리자 페이지"가 아니라 "공개 페이지 위에서 바로 편집"하는 구조예요.**

- `/admin/login`에서 비밀번호(`.env.local`의 `VITE_ADMIN_PASSWORD`) 입력 → 로그인되면 세션에 더미 토큰 저장 (`useAdminAuth.ts`, `services/adminSession.ts` — JWT 비슷한 형태지만 진짜 인증 아님, 로컬 개발/테스트용)
- 로그인 상태면 News/Member/Publications/Equipment 페이지에 **수정(✎)/삭제(✕)/추가(+ Add)/드래그 순서변경(≡)** 버튼이 바로 나타남
- **admin 상태는 `useAdminMode()` 컴포저블로 전역 공유** (반응형이라 로그인/로그아웃 즉시 모든 컴포넌트에 반영됨)

### 편집은 "바로 저장" 아니라 "임시 반영 후 페이지 단위로 Save" 방식

- 수정/삭제/추가/드래그재정렬 하나하나는 **메모리(화면)에만 반영**되고, 바로 파일에 저장되지 않음
- 뭔가 바뀌면 화면 우측 상단(모바일은 하단)에 **"Unsaved changes" + Cancel/Save 버튼**이 뜸 (`UnsavedChangesBar.vue`, `usePendingChanges.ts`)
- **Save** 누르면 그제서야 `src/data/*.json`에 실제로 반영됨. **Cancel**은 마지막 저장 상태로 전부 되돌림
- 다른 페이지로 이동하려 하는데 저장 안 된 변경사항이 있으면 **모달**이 뜸 ("Save & Leave" / "Discard & Leave" / "Stay") — `LeaveConfirmModal.vue`, `useLeaveGuard.ts`. 바뀐 게 없으면 그냥 바로 이동
- 사진 업로드/삭제는 예외 — 파일 자체를 서버에 바로 쓰는 동작이라 즉시 실행됨 (Cancel 눌러도 이미 올라간 파일은 디스크에 남을 수 있음, 참조만 사라짐)

### ⚠️ 저장은 "로컬 개발 서버에서만" 동작함

- `npm run dev`로 로컬에서 켜놓고 있을 때만 저장/사진 업로드가 실제로 동작해요
- `vite-local-save-plugin.ts`가 로컬 전용 엔드포인트 3개를 제공함:
  - `POST /api/local-save` — `src/data/*.json` 파일에 직접 씀
  - `POST /api/upload-image` — `public/<폴더>/<파일명>`에 base64 이미지 저장
  - `POST /api/delete-image` — 해당 파일 삭제
- **배포된 사이트(Vercel)에서는 로그인은 되지만 저장 버튼 누르면 실패함** — 이 엔드포인트들이 존재하지 않기 때문 (의도된 동작, 버그 아님)
- **현재 워크플로우**: 로컬에서 admin으로 수정 → 페이지 상단 Save → `git commit` → `git push` → Vercel 자동 재배포

### 앞으로 할 일로 남겨둔 것

**GitHub PAT + Vercel 서버리스 함수 방식으로 저장 기능을 실제 배포 사이트에서도 되게 하기로 결정했었음** (Firestore 대신 이 방식 선택). 아직 구현 안 함. 이유: GitHub PAT를 프론트엔드에 직접 노출하면 안 되니, Vercel Function이 서버 사이드에서 PAT로 커밋하고, 그 함수 자체는 별도의 서버 전용 secret(`ADMIN_SAVE_SECRET`, `VITE_` 접두사 아님)으로 보호해야 함.

**추가로 논의된 아이디어 (아직 설계만, 구현 안 함)**: **로그아웃하는 시점에 그동안 로컬에 쌓인 변경사항을 GitHub에 자동으로 push하는 로직**도 같이 고려하기로 함. 지금 admin 페이지들은 "페이지 이동 시 저장/취소 확인" 방식(`usePendingChanges`, `useLeaveGuard`)으로 로컬 JSON 파일까지는 저장하는데, 그 다음 단계인 "로컬 저장 → 실제 배포 반영"을 로그아웃 액션에 연결하는 아이디어. 구현 시 고려할 것:
- 로그아웃 시점에 아직 저장 안 된 변경사항(`usePendingChanges`의 dirty 상태)이 있으면 어떻게 할지 (자동 저장 후 push? 경고하고 취소 옵션?)
- 로컬 저장(JSON 파일 write)과 GitHub push는 별개 단계임 — 로그아웃 로직이 "로컬에 저장된 것 전체를 push"하는 건지, "현재 세션에서 바뀐 것만 push"하는 건지 범위를 정해야 함
- 이것도 위의 Vercel 서버리스 함수(PAT 보유)를 거쳐야 함 — 로그아웃 버튼 클릭 시 그 함수를 호출하는 흐름이 될 것

### id 관리 규칙

- 각 항목의 `id`는 **처음 생성될 때 값으로 영구 고정**. 순서를 드래그로 바꿔도 id는 안 바뀜 (예전엔 재정렬할 때마다 id/사진파일명도 다시 매겼는데, 불필요한 복잡도라 판단해서 제거함 — 다시 만들지 말 것)
- 새 항목 추가 시 id는 `nextSequentialId()`(`utils/nextId.ts`)가 "현재 배열에 남아있는 것 중 가장 큰 숫자+1"로 계산 — 중간에 삭제된 번호(빈 번호)는 재사용 안 됨
- 접두사: postdocs=`p`, members=`g`, alumni=`a`, news=`n`, publications=`pub`, equipment=`eq`

### Member 페이지 특이사항

- **Alumni는 사진 없음** (카드 아님, 리스트 형태 — `AlumniItem.vue`)
- **"Graduate →" 버튼**: 현재 학생 → Alumni로 이동. 누르면 확인 모달 뜸 (이메일/관심분야/사진 없어진다고 경고). 확인하면 Alumni 맨 위(최신 졸업자 자리)에 새 id로 추가되고, 사진 있었으면 파일 삭제됨
- **Alumni의 "← Undo" 버튼**: 실수로 졸업시켰을 때 되돌리는 용도. Graduate Students 맨 끝에 새 id로 추가됨 (원래 자리로 복원하려던 시도가 있었는데, 그 사이 다른 변경사항이랑 꼬일 수 있어서 단순하게 "맨 끝에 새로 추가"로 확정함 — 다시 원위치 복원 로직 만들지 말 것)
- **Member 카드 호버**: 마우스 올리고 0.5초 후 스피너, 1.5초에 이메일/관심분야 패널이 카드 아래로 나타남. **admin 모드일 땐 이 호버 기능 전체가 꺼짐** (수정/삭제 버튼 누르는 데 방해돼서)

## SEO / AEO 작업 (완료)

- 라우트별 title/description 자동 갱신 (`router/updateHead.ts`, `router.afterEach`)
- Open Graph, Twitter Card, canonical URL 자동 갱신
- JSON-LD 구조화 데이터: 사이트 전체(`index.html`에 `ResearchOrganization`), PI 개인(`Person`, Member 페이지), 논문 목록(`ItemList`/`ScholarlyArticle`, Publications 페이지)
- `robots.txt`, `sitemap.xml` (`public/`에 있음, 도메인 값 `webpageawearnew.vercel.app`로 되어있음 — **커스텀 도메인 연결되면 이 값들 다 바꿔야 함**)
- 이미지 alt 텍스트 보강 (멤버 사진→이름, 뉴스 이미지→설명, 논문 이미지→제목)

## 성능 최적화 (완료)

- HomePage lazy-loading (다른 페이지와 동일하게) → 메인 청크 514KB→50KB
- Firebase SDK 동적 import로 전환 → Firebase 미설정 상태에서 SDK 자체가 로드 안 됨 (463KB→2.5KB)
- 안 쓰는 `firebase/storage`, `GoogleMap.vue`, 예전 Admin 대시보드 페이지들 삭제
- `tsconfig.app.json`/`tsconfig.node.json` 공통 설정을 `tsconfig.shared.json`으로 분리

## 인프라/배포 관련 이력 (알아두면 좋음)

- Supabase 통합이 Vercel에 연결돼있었는데 프로젝트가 suspended 상태라 배포가 매번 실패했었음 → **Supabase 통합 완전히 삭제함**. 지금은 Firebase/Supabase 둘 다 미사용 상태
- `middleware.ts`(루트)에 IP 제한 기능 있음, 지금은 `ENABLE_IP_RESTRICTION = false`로 꺼둔 상태
- `.env.local`은 git에 커밋 안 됨(`.gitignore`) → **Vercel 배포판에서 로그인되게 하려면 Vercel 대시보드에 `VITE_ADMIN_PASSWORD` 직접 등록하고 재배포 필요** (`VITE_` 접두사 값은 Type을 "Secret" 아니라 "Config"로 저장해야 경고 안 뜸 — 어차피 브라우저에 노출되는 값이라서)

## 아직 안 한 것 / TODO

1. **이미지 교체 작업** (진행 중) — 예전 Wix 링크로 남아있는 뉴스 2개 + 논문 이미지 43개를 실제 로컬 이미지로 교체 중 (`WIX_IMAGE_CHECKLIST.md` 참고). admin 수정 화면에서 "+ Upload image"로 하면 자동으로 id 기반 파일명(`n8.jpg`, `pub23-1.jpg` 등)으로 저장됨. Member(PI/포닥/학생) 사진도 아직 대부분 비어있음
2. **실제 배포 사이트에서 저장 가능하게 하기** — GitHub PAT + Vercel 서버리스 함수 (위 참고), 로그아웃 시 자동 push 로직도 같이 고려
3. **관리자 인증 강화** — 지금은 단순 비밀번호 하나. 배포 전에 Firebase Auth(Google 로그인) 등으로 교체 예정이라고 논의했었음
4. **커스텀 도메인 연결** — `awearlab.com`을 Wix에서 Vercel로 DNS 전환. 연결되면 `robots.txt`/`sitemap.xml`/`index.html`/`router/updateHead.ts`의 도메인 값도 다 바꿔야 함
5. **Google Search Console 등록** — 아직 안 함
6. **Analytics 연동** — Vercel Analytics 또는 GA4 중 선택 필요. `/admin/stats` 탭이 지금은 외부 대시보드 링크만 보여줌
7. **콘텐츠 채우기** — Home 페이지에 "Headline", "Section title" 같은 placeholder 텍스트 여전히 남아있음

## 자주 쓰는 명령어

```bash
npm install          # 의존성 설치 (node_modules 문제 생기면 삭제 후 재설치)
npm run dev           # 로컬 개발 서버 (admin 저장 기능 여기서만 동작)
npm run build         # 프로덕션 빌드 (vue-tsc -b && vite build)
npx vue-tsc --noEmit  # 타입체크만
```

## 이번 세션에서 특히 주의할 점

- `previousId`/`previousIndex` 같은 "위치 복원" 로직은 의도적으로 제거했음 — 다시 만들지 말 것
- 드래그 재정렬 시 id/파일명 재부여하는 로직도 의도적으로 제거했음 — 다시 만들지 말 것
- Admin 저장은 로컬 전용이 원래 의도임 — "배포 사이트에서 저장 안 됨"은 버그 리포트 아님
