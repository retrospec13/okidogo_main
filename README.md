# Okidogo

Internet radio globe: browse and play stations from radio-browser.info on a
3D world map. React + TypeScript + Vite + Mapbox, PWA-ready.

## Run locally

1. Open the `okidogo/` folder and run `npm ci --legacy-peer-deps` (the current lockfile has a React/kbar peer-version conflict).
2. Create `.env.local` in that folder with `VITE_MAPBOX_ACCESS_TOKEN=YOUR_PUBLIC_TOKEN`.
3. Replace `YOUR_PUBLIC_TOKEN` with your own Mapbox public token (`pk.` prefix).
4. Run `npm run dev`. Restart Vite after changing the token.

Use only the public scopes your map needs and restrict the token to your app's URLs in Mapbox. Include your local development URL when testing. Never put a secret (`sk.`) token in a `VITE_` variable: Vite includes these values in browser code. Keep `.env.local` out of Git.

For deployment, set `VITE_MAPBOX_ACCESS_TOKEN` in the build environment before running `npm run build`. There is no shared fallback token; the globe will not initialize without a public token.
