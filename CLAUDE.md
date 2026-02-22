# CLAUDE.md

## 도메인 & 비즈니스 로직

기획서 및 도메인별 비즈니스 로직은 `.claude/skills/` 디렉토리에 정리되어 있다.
새로운 기능 구현이나 도메인 파악이 필요할 때 반드시 해당 디렉토리를 먼저 확인할 것.

단, skills에 정의된 모델은 백엔드 Entity 기준이다.
프론트엔드에서는 Entity를 그대로 사용하지 않고 DTO 기반으로 API 통신하므로, 모델 구조가 다를 수 있다.

```
.claude/skills/
├── category
├── chat
├── coupon
├── delivery
├── review
├── ticket
└── user
```
