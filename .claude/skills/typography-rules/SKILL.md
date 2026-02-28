---
name: typography-rules
description: Rules for mapping text hierarchy (headline, body, meta, label) to consistent typography tokens when building or refactoring UI pages and components. Use for any screen that uses the shared Text component (`@/shared/ui/text`) and for typography decisions in forms, cards, lists, tables, and button labels.
---

# Typography Rules (UI Common)

## Goal

- Keep text hierarchy semantic and consistent.
- Avoid ad-hoc font size/weight combinations per screen.
- Use the same token for the same meaning.

## Core Rules

1. Role first:
Treat `h1-bold` as a page-level title and `body1-regular` as default body copy.
2. Keep token count low:
Use around 3 to 5 typography tokens per screen.
3. Use restrained emphasis:
Prefer weight changes (`regular -> medium -> bold`) before increasing size.
4. Prioritize readability:
Use `body1` and `body2` for main reading content; keep `caption` for supporting info.

## Token Role Mapping

### Heading Layer
- `h0-bold`: Hero title for marketing/landing
- `h1-bold`: Primary page title
- `h2-bold`, `h3-bold`: Section/subsection titles
- `title-bold`: Major card/panel title
- `subtitle1-bold`, `subtitle2-bold`: Block or modal title
- `subtitle2-medium`: Intermediate tier between heading and body

### Body Layer
- `body1-regular`: Default body copy
- `body1-medium`: Light emphasis in body text
- `body1-bold`: Strong emphasis in body text (use sparingly)
- `body2-regular`: Card descriptions, list/table cells
- `body2-medium`: Label-like lines, short emphasis text
- `body3-regular/medium`: Button/chip/supporting body text

### Meta/Support Layer
- `caption1-medium`, `caption2-medium`: Helper text, hints, time, status
- `caption1-bold`, `caption2-bold`: Small labels, badges, table headers
- `caption3-bold`: Very small supporting text (do not overuse)

## Recommended Tokens by Component

1. Page title: `h1-bold` or `title-bold`
2. Card title: `subtitle1-bold` or `subtitle2-bold`
3. Card description/body: `body2-regular`
4. Button label: `body3-medium` (small button: `caption1-medium`)
5. Input label: `body3-medium`
6. Input placeholder/helper text: `caption1-medium` or `caption2-medium`
7. Table header: `caption1-bold`
8. Table cell: `body2-regular`
9. Badge/tag: `caption2-bold`

## Mobile Rules

1. Reduce only large heading tiers:
`h1-bold -> title-bold`, `title-bold -> subtitle1-bold`.
2. Keep body/support tiers stable:
Maintain the same semantic roles for `body1`, `body2`, and `caption`.
3. Solve high density with layout first:
Use wrapping/spacing before shrinking tokens too much.

## Application Sequence

1. Classify text by meaning:
headline / body / meta / label
2. Choose tokens from the mapping table above.
3. Keep total token variety on a screen under five when possible.
4. Check for semantic duplicates using different tokens and normalize.

## Implementation Rules

1. Prefer the shared `Text` component from `@/shared/ui/text`.
2. Direct ad-hoc `text-*` classes without typography tokens are exceptions only.
3. Document the reason for exceptions in PR/code review notes.
