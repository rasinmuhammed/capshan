# Contributing to Capshan

Thanks for helping make private, open-source creator tooling better.

## Local Setup

```bash
npm install
npm run dev
```

Optional MP4 export helper:

```bash
cd server
npm install
npm start
```

## Before Opening a PR

Run:

```bash
npm run lint
npm run build
```

Keep changes focused. If you are adding a creator-facing feature, include a short note in the PR explaining the user workflow it improves.

## Good First Areas

- Caption preset polish and export parity.
- Transcript editing ergonomics.
- Hook/filler/silence heuristics.
- Accessibility and keyboard controls.
- Docs, sample clips, screenshots, and setup fixes.

## Product Principles

- Browser-first and local-first.
- No watermark, no signup wall, no hidden cloud upload.
- Preview and export should match as closely as technically possible.
- A first-time creator should be able to produce a captioned short in under 10 minutes.

