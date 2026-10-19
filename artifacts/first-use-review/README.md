# First-use and Glass Tide review

This is a bounded continuation of PR #9 after founder feedback on `0050138`. All examples use local deterministic styling and safe fixture content. No AI generation, merge or deployment occurred. Visual acceptance remains pending.

## Before and after

Before: `../forge-review/01-portal-desktop.jpg` and `../forge-review/02-builder-desktop.jpg`.

After: `01-after-first-screen.jpg` and `02-after-builder.jpg`.

## Actual browser downloads

- `glass-tide.html` — ocean / calm / water; serif type and curved glass.
- `colour-current.html` — crazy / cool / fun; oversized bold type and overlapping coloured glass. Customised name: Glass Tide Studio.
- `playful-forms.html` — friendly / playful / joyful; rounded objects and heavy sans type.
- `quiet-structure.html` — precise / structured / professional; light sans type, grid and architectural planes.

Each download was compared byte-for-byte with its editor preview, then opened as a separate localhost page and visually inspected. Screenshots 03–06 show those independent outputs. Output is scrollable in the editor, and a viewport screenshot may show only its first section.

## Browser checks

- `world-measurements.json`: actual submitted words, layout, computed type family/weight, columns and material shape. The prior crazy/cool/fun mapping changed only palette, background choice, speed and seed; this iteration changes composition and typography as well.
- `mobile-results.json`: all four actual outputs at 390px and 320px, with no horizontal overflow and three services.
- `fold-results.json`: first action and actual example location on desktop/mobile.
- Calm sculpture animation is `none`; closed-stage form validation and pending-word export guard work.
- All 18 local Node journey/safety tests pass. A full browser network trace, system-level reduced-motion emulation, Safari and physical-device testing are not claimed.

The preview server is local-only: `http://127.0.0.1:8765/launch/`. Review only; no approval for production is implied.
