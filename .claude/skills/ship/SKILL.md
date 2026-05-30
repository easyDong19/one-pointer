---
name: ship
description: 현재 작업물을 커밋 → push → GitHub PR 생성 → 충돌 없으면 main 머지 → local main pull 최신화까지 한 번에 진행한다. "이거 올려줘", "커밋하고 PR", "머지까지", "ship", "배포 플로우" 등을 요청할 때 사용. one-pointer(Next.js) 레포 기준.
---

# Ship — 커밋→push→PR→머지→최신화 플로우

작업이 끝난 코드를 안전하게 `main` 에 반영하는 표준 절차. **사용자가 진행에 동의했을 때만** 실행한다 (작업 후 자동 실행 금지 — CLAUDE.md "작업 완료 후 절차" 참조).

## 사전 조건

1. **검증 먼저.** `npx tsc --noEmit` + `npx eslint <변경파일>` 가 통과해야 한다. 에러가 있으면 멈추고 보고.
2. **dev 서버 금지.** `next dev` 를 켜거나 localhost 로 접속해 확인하지 않는다. 런타임 확인은 사용자가 직접 한다. (memory: no-dev-server)
3. 대상 레포: `/Users/easydong/one-point-mono/one-pointer` (git repo). 모노레포 루트는 git repo 아님.

## 절차

작업 디렉토리는 항상 `one-pointer` 절대경로 기준.

### 1. 브랜치 확인 / 생성
- 현재 `main` 이면 **새 브랜치를 판다.** 절대 main 에 직접 커밋하지 않는다.
- 브랜치명 규칙: `feat/…`, `fix/…`, `redesign/…`, `chore/…` 등 작업 성격 + kebab-case.
- 이미 작업 브랜치면 그대로 사용.

### 2. 커밋
- `git add -A` 후 커밋. 메시지는 Conventional Commits + 한글 본문.
- 제목: `type(scope): 요약` (예: `fix(expert-profile): 배너 삭제 반영`).
- 본문에 무엇을/왜 를 bullet 로. 마지막 줄:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```

### 3. push
```
git push -u origin <branch>
```

### 4. PR 생성
```
gh pr create --base main --head <branch> --title "<제목>" --body "<본문>"
```
- 본문: 배경 / 변경 / (있으면)비고 / 검증 결과. 마지막에:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  ```

### 5. 충돌 검사
```
gh pr view <#> --json mergeable,mergeStateStatus -q '.mergeable+" "+.mergeStateStatus'
```
- `UNKNOWN` 이면 2~3초 간격으로 몇 번 재폴링 (GitHub 가 계산 중).
- `MERGEABLE` / `CLEAN` 이어야 다음 단계. **`CONFLICTING` 이면 머지하지 말고 멈춰서 보고**하고 사용자 지시를 기다린다.

### 6. 머지 + 브랜치 정리
```
gh pr merge <#> --merge --delete-branch
```
- merge commit 방식(`--merge`) 사용 (이 레포 관례).

### 7. local main 최신화
```
git checkout main && git pull origin main
```

### 8. 보고
- PR 링크(전체 URL), 머지 커밋 해시, 최신화 결과를 표로 요약.

## 주의
- 외부로 나가는(push/PR/merge) 동작이므로 사용자 동의 없이는 절대 시작하지 않는다.
- 충돌·CI 실패·권한 문제 등 예외는 임의로 해결하지 말고 보고 후 지시를 받는다.
- 백엔드(one-pointer-backend) 등 read-only 레포에는 적용하지 않는다 (이슈 등록은 별개).
