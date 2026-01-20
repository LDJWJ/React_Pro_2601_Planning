# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HookHook is a mobile-first React video editing web application with Google OAuth authentication. Users go through an onboarding flow to select their video creation preferences (purpose, topics, platforms), then access a template-based home screen and a feature-rich video editor.

## Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### Application Flow
The app is state-machine driven via `currentScreen` in App.jsx:
1. **login** → Google OAuth via @react-oauth/google
2. **purpose** → CategoryPurpose (single selection)
3. **topic** → CategoryTopic (multi-select)
4. **platform** → CategoryPlatform (multi-select)
5. **home** → Main app with bottom navigation tabs (home/search/edit/my)

### Key Directories
- `src/components/` - All React components with co-located CSS files
- `src/utils/logger.js` - Analytics logging to Google Apps Script
- `src/assets/` - Static images

### Editor Component (src/components/Editor.jsx)
The video editor is the most complex component with:
- Media upload (video/image) with preview
- Timeline with multiple tracks (media, subtitles, text overlays, music, voice)
- Text overlay system with position/size controls and time-based visibility
- Voice recording via MediaRecorder API
- Two export methods:
  - **Canvas export** (WebM) - Includes text overlays via real-time canvas rendering
  - **FFmpeg export** (MP4) - Uses @ffmpeg/ffmpeg WASM for encoding

### Environment Variables
Required in `.env` (see `.env.example`):
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_GOOGLE_SCRIPT_URL` - Google Apps Script endpoint for analytics

### Vite Configuration
- COOP/COEP headers enabled for FFmpeg WASM SharedArrayBuffer support
- @ffmpeg packages excluded from dependency optimization

## Tech Stack
- React 19 with Vite 7
- @ffmpeg/ffmpeg for browser-based video encoding
- @react-oauth/google for authentication
- ESLint with react-hooks and react-refresh plugins
