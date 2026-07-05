# Off the Wall

Strength & stretching PWA for the days between climbs.

## Structure
- `src/app.jsx` — all app code (React, single file)
- `docs/` — built site, served by GitHub Pages (bundle + manifest + service worker + icons)

## Making changes
1. Edit `src/app.jsx`
2. `npm install` (first time only)
3. `npm run build`
4. Bump the cache version in `docs/sw.js` (`otw-v4` → `otw-v5`) so installed phones pick up the update
5. Commit and push — GitHub Pages redeploys automatically

## Install on phone
Open the GitHub Pages URL in Safari → Share → Add to Home Screen.
Data lives in localStorage on the device.
