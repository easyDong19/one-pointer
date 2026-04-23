# CLAUDE.md

## 도메인 & 비즈니스 로직

기획서 및 도메인별 비즈니스 로직은 `.claude/skills/` 디렉토리에 정리되어 있다.
새로운 기능 구현이나 도메인 파악이 필요할 때 반드시 해당 디렉토리를 먼저 확인할 것.

## 레이아웃

`(main)` 하위 페이지는 반드시 `@/shared/ui/page-shell` 의 `PageShell` 을 루트로 사용한다.
tier (`shell` / `content` / `list` / `form`) 만 고르면 max-width · padding · pb-24 · md:pt-14
등이 자동 적용되며, 개별 페이지가 `mx-auto max-w-* px-*` 를 직접 선언하지 않는다.
세부 정책: `../docs/design/LAYOUT.md`.
