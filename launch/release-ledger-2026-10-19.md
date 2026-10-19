# Forge continuation release ledger — 19 October 2026

## Recovery and baseline

- Repository: Fenton-Creative-Ltd/fenton-forge; default branch: main.
- Continued draft PR #9, `codex/living-glass-visual-20261016`, from `82ab807ba03d57b8e6fc8e3b550cd8a9d0b565ca`.
- Main observed at `d837058e50d6d7ffe3f3cf89f7bf52ab930bfca4`.
- Previous Work directory inherits an unrelated home-level repository. Recovered `forge-rc-push` is a standalone one-commit master repository with no remote; its duplicate sections were not used as the remote baseline. Historical files remain intact.
- Continued checkout: `/Users/paulfenton/Documents/ChatGPT/Fenton Creative HQ/forge-continuation`. Existing remote branch recovered into the writable workspace.

## Implemented

- Load the existing portal stylesheet in the actual launch page and apply Living Portal / Glass Tide to its hero, with no duplicate sections or IDs.
- Repair undefined glass background token, header alignment and mobile spacing; keep the desktop preview visible alongside longer controls.
- Preserve separate service items through repeated state validation so preview and download agree.
- Calm motion actually stops animation; speed scales duration rather than adding an animation delay.
- Export uses valid mobile alignment, a single main element, a centred glass panel and a properly hidden accessibility note.
- Discover selection exposes pressed state and moves focus to the three-word builder. Transform rejects incomplete words.

## Verified locally

- `node --check launch/builder.js` succeeds; `node --test tests/forge-journey.test.cjs`: 15 tests pass.
- Actual Chrome: Discover Agency selection populates words and selected state; Imagine edits ocean / calm / water; Transform works; Customise updates name, headline, services, palette and motion in the preview.
- Calm mode computed animation name: `none`. Standard mode at speed 0.5 computes a 35-second animation duration.
- Download HTML saved `fenton-forge-website (1).html` in Downloads. Browser download-event observer timed out, but the saved file was recovered and SHA-256 matched the evidence copy: `4ba46dff6d4578040e07f7a6b4221fd9b0ba69a9c3318fb75355a9b7e1059079`.
- Opened that exact downloaded artifact as a separate local page outside the editor. Verified Glass Tide Studio, customised headline, three individual services, email link, one main element and 35-second motion duration.
- Launch has no horizontal document overflow at 390px and 320px; independent export checked at 390px. Temporary viewport overrides reset.
- Screenshots and actual exported file: `artifacts/forge-review/`, outside the deployment payload.
- Source tests confirm no remote assets/API calls in the checked launch payload and no external export runtime dependencies. Browser network trace was not captured; zero runtime requests is not claimed as separately observed.

## CI and remaining acceptance

- Existing PR #9 RC job failed before steps began: "The job was not started because your account is locked due to a billing issue." https://github.com/Fenton-Creative-Ltd/fenton-forge/actions/runs/38983345252 . Existing CodeQL checks also show failure. No billing changes attempted.
- Local checks are independent of CI. Updated remote CI must be inspected after pushing; no passing CI claim here.
- Safari, physical iPhone/iPad, complete keyboard/screen-reader review, all custom-colour contrast and system-level reduced-motion emulation remain unverified. Calm control browser-tested; system reduced-motion CSS source-tested only.
- Artifact rendered independently over localhost; disconnected/offline `file://` launch has not been verified in this continuation.
- No AI provider called. Demonstration is deterministic local generation with safe fixture content.
- Founder visual acceptance pending. Production baseline not inspected; main is not asserted to be deployed production.

## Release decision and rollback

### Founder feedback iteration

The founder accepted export fidelity and the Glass Tide direction, but did not accept the visual impact or first-use clarity. Acceptance remains open. This iteration continues the same branch after `005013801b648835f56314400df7242a5f12c0fc`.

- Diagnosis: the old mapping for crazy / cool / fun returned ocean, aurora, speed 1.37 and seed 306365. It changed state but not the composition or typography. Waves, particles and aurora shared a gradient renderer; the last recognised word could override earlier ones. A screenshot alone did not establish a failed submit or mapping failure.
- The first screen now states input, outcome and first action beside an actual renderer-produced sample. Three example sets can be compared without entering the editor. At the observed 1280×720 viewport, the primary action ends at y=592 and the example begins at y=163. At 390×844 the action ends at y=534 and the example begins at y=709.
- Imagine, story and fine-tuning controls use keyboard-accessible native disclosure stages. Transform explicitly applies words and advances to the story. Editing words no longer silently transforms on each keystroke. Downloads are blocked if word changes have not been applied. Invalid fields reopen their containing stage; this was browser-tested with a required name in a closed stage.
- Four supported compositions retain the glass material: curved tidal panes with serif type; rounded playful forms with heavy sans type; overlapping coloured glass with oversized bold type; architectural planes with light sans type and a measured grid. Recognised words vote for styles rather than the last one silently winning. Unsupported vocabulary is explained in the product.
- 18 local tests pass. Actual browser measurements confirm layout, type family/weight and object-shape differences; see `artifacts/first-use-review/world-measurements.json`.
- Repeated Discover → Imagine → Transform → Customise → Export in the actual in-app browser. The founder's crazy / cool / fun set selected Colour Current. Customised name, headline and services survived export. All four actual browser downloads were compared byte-for-byte with the editor's `srcdoc` and matched. Each was opened independently over localhost and visually inspected.
- All four independent exports passed horizontal-fit checks at both 390px and 320px, with one main heading and three services. The editor page also fit at both widths. Viewport overrides reset afterwards.
- Calm mode was checked against computed sculpture animation and returned `none`. System reduced-motion CSS now covers glass and light layers as well; system-level preference emulation remains unverified.
- Current before/after screenshots, independent HTML downloads and measurements live in `artifacts/first-use-review/`. Prior `artifacts/forge-review/` and `artifacts/walkthrough/` evidence is retained. New CI status is reported on PR #9; a billing lock previously prevented both RC and CodeQL jobs from starting.
- No paid services, production changes or broader redesign were introduced. Safari, physical devices, full accessibility, runtime network tracing, offline file launch and founder visual acceptance remain open.

Ready for founder local visual review; not approved for release. Preview: http://127.0.0.1:8765/launch/ . Current independent artifact: http://127.0.0.1:8765/artifacts/first-use-review/glass-tide.html . Prior outputs remain preserved under `artifacts/forge-review/`.

No merge, deployment, Hostinger change, paid call or Raffles modification performed. Main unchanged. To discard the candidate, close the local preview and retain branch/evidence; do not reset historical working directories. To undo a subsequently approved branch update, revert its continuation commit on the same review branch. A production rollback package requires identifying and backing up the actual deployed package during an authorised release.
