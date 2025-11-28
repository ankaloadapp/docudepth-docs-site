# DocuDepth Docs Site Deployment Guide

## Overview

The docs-site serves generated documentation at `docs.docudepthai.com`. It dynamically renders MDX content stored in S3 using Nextra theme.

## Architecture

```
docs.docudepthai.com/[generationId]/[page-slug]
         │                  │              │
         │                  │              └── MDX page from S3
         │                  └── UUID for the generation
         └── AWS Amplify SSR hosting
```

### S3 Structure

Documentation is stored in the `docudepth-storage` S3 bucket:

```
docudepth-storage/
└── docs-sites/
    └── [generationId]/
        ├── meta.json          # Navigation structure
        ├── table-of-contents.mdx
        ├── executive-summary.mdx
        ├── api-reference.mdx
        └── ... other pages
```

**meta.json format:**
```json
{
  "title": "Project Name",
  "pages": [
    "table-of-contents",
    "executive-summary",
    "architecture-overview",
    "api-reference"
  ]
}
```

## Local Development

```bash
cd docs-site
npm install
npm run dev
```

Visit `http://localhost:3000/[generationId]` to test with a real generation ID.

## Deployment to AWS Amplify

### Prerequisites

- AWS CLI configured with appropriate credentials
- GitHub repo connected to Amplify: `ankaloadapp/docudepth-docs-site`

### Deploy Process

1. **Push to main branch:**
   ```bash
   git add -A
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Amplify auto-deploys** on push to main branch

3. **Check build status:**
   ```bash
   aws amplify list-jobs --app-id dv9sxk3zsnvfi --branch-name main --max-items 3
   ```

### Amplify Configuration

**App ID:** `dv9sxk3zsnvfi`
**Domain:** `docs.docudepthai.com`
**Build Spec:** `amplify.yml`

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## Key Files

| File | Purpose |
|------|---------|
| `app/[generationId]/layout.tsx` | Nextra Layout with pageMap |
| `app/[generationId]/[[...slug]]/page.tsx` | MDX page renderer |
| `lib/source.ts` | S3 fetching utilities |
| `mdx-components.tsx` | MDX component overrides |
| `next.config.mjs` | Nextra configuration |

## Environment Variables

None required - docs are fetched from public S3 URLs.

## Troubleshooting

### Build Fails
```bash
# Check logs
aws amplify get-job --app-id dv9sxk3zsnvfi --branch-name main --job-id [JOB_ID]
```

### 404 on Pages
- Verify meta.json exists in S3 for the generationId
- Check page slug matches filename in S3 (without .mdx)

### Styling Issues
- Ensure `nextra-theme-docs/style.css` is imported in root layout
- Check Tailwind classes use `nx-` prefix for Nextra compatibility

## Useful Commands

```bash
# Build locally
npm run build

# Check Amplify app info
aws amplify get-app --app-id dv9sxk3zsnvfi

# List recent deployments
aws amplify list-jobs --app-id dv9sxk3zsnvfi --branch-name main

# View S3 docs for a generation
aws s3 ls s3://docudepth-storage/docs-sites/[generationId]/
```

## Current Stack

- **Framework:** Next.js 14 (App Router)
- **Theme:** Nextra 4.6.0 + nextra-theme-docs
- **Hosting:** AWS Amplify SSR
- **Storage:** AWS S3 (public bucket for docs-sites/*)
