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

### 편집은 즉시 반영됨 (임시저장 아님)

- 수정/삭제/추가/드래그재정렬 하나하나가 **그 즉시 `src/data/*.json` 파일에 실제로 저장**돼요. 페이지별 Cancel/Save 임시저장 방식은 한 번 만들었다가 의도적으로 되돌렸음 — **다시 만들지 말 것** (`usePendingChanges`, `usePendingUploads`, `UnsavedChangesBar`, `LeaveConfirmModal` 전부 삭제된 상태)
- 사진 업로드/삭제도 마찬가지로 즉시 실행됨

### nav의 "Save" 버튼 = Git push 전용

- admin 로그인 시 nav에 **Logout 옆에 "Save" 버튼**이 있음 — 이건 위의 즉시 저장된 로컬 파일 변경사항을 **Git에 commit + push**하는 용도임 (`POST /api/git-push`, `vite-local-save-plugin.ts`)
- 내부적으로 `git add -A && git commit -m "..." && git push` 실행. "nothing to commit"은 실패로 안 취급함
- 버튼 옆에 결과 메시지가 잠깐 떴다 사라짐 ("Pushed to GitHub ✓" / "Nothing to push" / "Push failed (단계)")
- 로컬 컴퓨터에 이미 설정된 git 계정/인증정보를 그대로 사용함 (별도 토큰 설정 필요 없음)

### 저장 방식이 로컬 dev와 배포 환경에서 서로 다름 (이제 둘 다 실제로 동작함)

**로컬 dev (`npm run dev`)**: `vite-local-save-plugin.ts`가 제공하는 로컬 전용 엔드포인트가 그대로 처리
  - `POST /api/local-save` — `src/data/*.json` 파일에 직접 씀
  - `POST /api/upload-image` — `public/<폴더>/<파일명>`에 base64 이미지 저장
  - `POST /api/delete-image` — 해당 파일 삭제
  - `POST /api/git-push` — `git add -A && commit && push` (nav의 "Save" 버튼, **로컬 dev에서만 보임**)

**배포 환경 (Vercel)**: 같은 URL(`/api/local-save`, `/api/upload-image`, `/api/delete-image`)을 이제 `api/` 폴더의 **Vercel 서버리스 함수**가 처리함 (`api/local-save.ts`, `api/upload-image.ts`, `api/delete-image.ts`, 공용 로직은 `api/_github.ts`). 로컬 파일시스템이나 git CLI 대신 **GitHub Contents API**를 PAT로 직접 호출함. 커밋 메시지에 요청자 IP까지 남겨서(`api/_github.ts`의 `getClientIp()`) 커밋 히스토리 자체가 활동 로그 역할을 함

- **⚠️ 수정 액션 하나하나가 바로 커밋되는 게 아님** — 커밋이 너무 자주 쌓이는 걸 피하려고, 배포 환경에서는 `saveJsonFile`/`uploadImage`/`deleteImage`(`src/services/localSave.ts`)가 실제 네트워크 요청 대신 **메모리 큐에 쌓아두기만** 함. 화면은 Vue 반응형 상태 덕분에 그 자리에서 바로 바뀌어 보이지만, 실제 GitHub 커밋은 **nav의 "Save" 버튼을 눌러야** `flushPendingChanges()`가 큐에 쌓인 것들을 한꺼번에(파일당 한 커밋) 실제로 반영함
  - 사진 업로드도 큐잉됨 — Save 누르기 전까진 `blob:` 미리보기 URL을 화면에 그대로 씀. `flushPendingChanges()`가 실제 업로드하면서 그 blob URL을 실제 경로로 JSON 안에서 바꿔치기함(`deepReplaceUrls()`)
  - 이 큐는 `localSave.ts` 모듈 레벨 상태라, **페이지 이동해도 안 사라짐**(SPA 안에서는). 탭을 닫거나 새로고침하면 사라지므로, `App.vue`에 `beforeunload` 경고를 걸어둠(`hasPendingChanges()`)
  - **로컬 dev는 원래대로 즉시 저장** — `import.meta.env.DEV` 체크로 분기함(`localSave.ts`의 `isDev`). nav의 "Save" 버튼은 로컬에선 `gitPush()`(git add/commit/push), 배포에선 `flushPendingChanges()`(GitHub API 큐 flush)를 호출 — **양쪽 다 이제 Save 버튼이 보임**, 예전엔 배포 환경에서 숨겼었는데 그거 되돌림
  - **Save 누르면 커밋이 정확히 1개만 생김** — `api/commit-batch.ts` + `api/_github.ts`의 `commitBatch()`가 GitHub **Git Data API**(blob 여러 개 만들고 → tree 하나로 묶고 → commit 하나 만들고 → branch ref 업데이트)로 여러 파일 변경사항을 커밋 하나에 다 담음. 이전엔 Contents API로 파일마다 따로 커밋했었는데, 이제 그 방식(`putFile`/`deleteFile`, `api/local-save.ts` 등의 개별 엔드포인트)은 **로컬 dev 전용**으로만 남아있고, 배포 환경의 `flushPendingChanges()`는 이 배치 엔드포인트 하나만 호출함
  - 이미지 최종 경로(`/<폴더>/<파일명>`)는 업로드 전에도 이미 알 수 있는 값이라, 실제 GitHub 요청 없이 미리 계산해서 JSON 안의 blob: URL을 치환함 — 그래서 이미지 업로드까지 포함해서 정말 한 번에, 한 커밋으로 나감

- 어느 경로로 가는지는 클라이언트 코드가 신경 안 써도 됨 — `src/services/localSave.ts`는 URL 그대로 두고, 로컬이면 Vite 플러그인이, 배포면 Vercel 함수가 알아서 그 요청을 가로챔
- 인증은 `x-admin-password` 헤더로 함 (`localSave.ts`의 `authHeaders()`) — 서버 쪽(`api/_github.ts`의 `isAuthorized()`)에서 `process.env.VITE_ADMIN_PASSWORD`랑 비교함. Vercel Function은 `VITE_` 접두사 여부 상관없이 프로젝트에 등록된 모든 환경변수를 `process.env`로 읽을 수 있어서, 별도 서버 전용 비밀번호 변수를 안 만들어도 됨
- **⚠️ `vercel.json`의 SPA catch-all rewrite가 `/api/*`까지 삼켜버리는 실제 버그가 있었어서 고쳐둠** — `"source": "/(.*)"` → `"source": "/((?!api(?:/|$)).*)"`. 이 정규식 다시 원래대로 되돌리면 배포 환경에서 API 함수가 전부 안 먹힘

**배포 환경에서 이 기능이 실제로 동작하려면 Vercel에 아래 4개 환경변수를 등록해야 함** (Settings → Environment Variables):
  - `GITHUB_TOKEN` — GitHub Personal Access Token. Classic PAT면 `repo` 스코프, Fine-grained PAT면 이 저장소에 "Contents: Read and write" 권한
  - `GITHUB_OWNER` — `TaeHwan-Gwak`
  - `GITHUB_REPO` — `webpage_awear`
  - `GITHUB_BRANCH` — (선택, 기본값 `main`이라 안 넣어도 됨)
  - 이 값들 다 Type을 "Secret"으로 등록해도 됨 — 서버 전용이라 브라우저에 노출 안 됨 (`VITE_ADMIN_PASSWORD`랑 다름)

이 4개 환경변수를 안 넣으면, 배포 환경에서 저장 시도 시 `api/_github.ts`의 `env()` 헬퍼가 에러를 던지고 500 응답이 나감 (기능이 조용히 실패하는 게 아니라 명확히 실패함)

**아직 안 한 것**: 저장 실패 시 화면에 명확한 에러 피드백을 주는 부분이 페이지마다 다 되어있진 않음 (일부 `alert()`만 있음) — GitHub API 호출은 로컬 파일쓰기보다 실패 가능성이 높으니(네트워크, 토큰 만료 등), 나중에 보강하면 좋음

### 관리자 활동 로그 (로컬 dev 전용, 화면에는 안 보임, GitHub엔 올라감)

- `logs/admin-activity.log`에 요청자 IP + SAVE/UPLOAD/DELETE/GIT-PUSH가 타임스탬프와 함께 한 줄씩 쌓임 (예: `[2026-09-21T05:21:28.608Z] [127.0.0.1] UPLOAD equipment/ip-test.jpg`) — **로컬 dev에서만 기록됨**, 배포 환경은 위에서 설명한 대로 커밋 히스토리 자체가 로그 역할
- **의도적으로 `.gitignore`에서 이 파일만 예외 처리해서 커밋됨** (`!logs/admin-activity.log`) — 다른 사람들이 누가 뭘 언제 수정했는지 볼 수 있게 하려는 목적. 다른 잡다한 `*.log` 파일들은 여전히 무시됨
- nav의 "Save" 버튼(Git push, 로컬 dev 전용)을 누르면 `git add -A`가 이 로그 파일 변경분도 같이 커밋해감
- 로깅 로직은 `vite-local-save-plugin.ts`의 `logAction()`/`getClientIp()` 함수

### tsconfig 관련 주의사항

- **`vue-tsc --noEmit`만으로는 `tsconfig.node.json`/`api/`가 제대로 체크 안 될 수 있음** (project reference를 안 따라감). 진짜 검증하려면 `npx vue-tsc -b` (필요하면 `--force`로 캐시 무시)로 확인할 것. `npm run build`는 정상적으로 `vue-tsc -b`를 쓰니 괜찮음
- `tsconfig.node.json`의 `include`에 `api/**/*.ts` 추가해둠 — 새 api 파일 만들 때 이 include에서 안 빠지는지 확인
- `api/` 안의 상대 import는 `nodenext` 모듈 해석 때문에 **확장자(`.js`)를 명시해야 함** (예: `from './_github.js'`, 실제 파일은 `.ts`여도 이렇게 씀) — 안 그러면 로컬 타입체크는 통과해도 `-b` 빌드에서 에러남

### 앞으로 할 일로 남겨둔 것


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
6. **Analytics 연동** — `@vercel/analytics` 패키지 코드는 넣어뒀음(`App.vue`). **Vercel 대시보드에서 프로젝트 → Analytics 탭 → Enable만 누르면 바로 수집 시작됨** (dev 모드에선 데이터 안 쌓임, 배포 환경에서만 동작). `/admin/stats` 탭은 여전히 외부 대시보드 링크만 보여줌
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
- **"배포 사이트에서 저장 안 됨"은 이제 옛날 얘기임** — `api/*.ts` + GitHub Contents API로 실제 동작하게 만들어뒀음 (위 섹션 참고). Vercel에 4개 환경변수(`GITHUB_TOKEN`/`GITHUB_OWNER`/`GITHUB_REPO`/`GITHUB_BRANCH`) 등록 안 했으면 그것부터 확인할 것 — 코드 문제가 아닐 가능성이 큼
- **`vercel.json`의 rewrite 정규식(`/((?!api(?:/|$)).*)`)을 단순 `/(.*)`로 되돌리지 말 것** — 그러면 `/api/*` 요청이 SPA로 흡수돼서 배포 환경 저장 기능이 통째로 죽음
- **화면 반영은 항상 즉시** (Vue 상태 변경이라 로컬/배포 상관없이 그때그때 보임). 근데 **실제 GitHub 커밋 타이밍은 환경마다 다름** — 로컬 dev는 파일 저장까지 즉시, git push만 Save 버튼. 배포 환경은 저장/업로드/삭제 전부 큐에 쌓아두다가 **Save 버튼 눌러야** 실제 커밋됨(`flushPendingChanges()`). 페이지 단위로 "Cancel 누르면 롤백" 같은 모달 방식은 예전에 만들었다가 명시적으로 되돌렸으니 다시 만들지 말 것 — 지금 방식(즉시 반영 + Save로 커밋 시점만 제어)이 맞음
- `ImageComposer.vue`: 캔버스에 선택 테두리/리사이즈 핸들을 그리는 로직이 있는데, `useImage()`(내보내기)에서 `draw(false)`로 그 오버레이 없이 한 번 다시 그린 다음 `toBlob()` 해야 함 — 안 그러면 주황 테두리가 최종 이미지에 그대로 박힘. 배경은 흰색(`#ffffff`)이 맞음, 다른 색으로 바꾸지 말 것
