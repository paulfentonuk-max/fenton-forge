# Fenton Forge — Early-access release candidate

This branch is a separate, controlled early-access release candidate only. It contains the launch application, not production deployment.

## Release intent

- **Discover:** choose a website starting point and understand the clear scope.
- **Imagine:** enter three words.
- **Transform:** turn those words into a deterministic visual result.
- **Customise:** edit the name, headline, description, services, contact, colours, layout, motion and speed.
- **Export:** download one self-contained HTML file.

## What is deliberately not included

- No accounts.
- No remote AI generation.
- No payment processing or subscription.
- No managed hosting or publishing.
- No external requests from the launch application.
- No Hostinger deployment in this pull request.

## Deployment plan

When explicitly approved, publish only the contents of `launch/` to a new, separate Hostinger website or subdomain. Keep the existing production website, repository baseline and all protected Hostinger services untouched.

If a problem appears after controlled rollout, restore the previous launch folder contents from the last verified Hostinger copy. Do not publish the repository root, `api/`, `data/`, Node dependencies, environment variables or any administrative files.

## Verification

Run from the repository root:

```
node --check launch/builder.js
node --test tests/forge-journey.test.cjs
```

The automated tests cover:
- full journey structure,
- deterministic words,
- independent export,
- escaping and input limits,
- absence of external requests,
- absence of secret-like strings,
- reduced-motion and mobile affordances.

Manual checks still required before controlled release: Safari, iPhone, keyboard traversal, screen reader, contrast and real network/device conditions.

Current evidence: `release-ledger-2026-10-19.md`. Serve the repository with `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://127.0.0.1:8765/launch/`. Screenshots and the browser-downloaded example are in `artifacts/forge-review/`, outside the deployment payload. The example uses safe local content, without an AI provider.

The first-use iteration is recorded in `artifacts/first-use-review/`: actual downloaded pages for Glass Tide, Colour Current, Playful Forms and Quiet Structure, comparison screenshots and browser measurements. The first screen renders its example using the same HTML exporter as the editor. Example words select designed compositions; unsupported words produce repeatable variations without a claim of semantic AI interpretation. Transform applies word edits explicitly; content and design controls continue to update the preview live.
