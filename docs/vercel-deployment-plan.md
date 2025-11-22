# Vercel Deployment Plan

This document outlines the steps to configure the project for Vercel deployment.

## 1. Create `vercel.json`

Create a new file named `vercel.json` in the root of the project with the following content:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/web/next.config.js",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/packages/web/$1"
    }
  ]
}
```

This configuration tells Vercel that the Next.js application is in the `packages/web` directory.

## 2. Update `packages/web/package.json`

Vercel needs a `build` script to prepare your application. We will add a `vercel-build` script to the `package.json` inside the `packages/web` directory.

The `package.json` at `packages/web/package.json` should be updated to include the following script:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "vercel-build": "yarn install --production=false && yarn build"
}
```

This ensures that all dependencies are installed before the build process starts on Vercel.