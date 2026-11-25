# HowWeMove

> **⚠️ View only — not open source.**
> This code is public for viewing only. Copying, modifying, deploying, redistributing or reusing any part of it (code, design, texts or branding), or using it to train AI models, is not allowed without written permission. See [LICENSE](LICENSE).

An interactive 3D exercise anatomy explorer. Pick an exercise, and a realistic human model (skeleton plus individual muscles) shows which muscles work, how hard and how, phase by phase.

Educational only, not medical advice.

Live: https://howwemove.milos300399.workers.dev

## Development

```sh
npm install
npm run dev      # Vite dev server on http://localhost:5173
npm test         # Vitest
npm run deploy   # build, then deploy to Cloudflare Workers (static assets)
```

The 3D model is built from BodyParts3D source data by the scripts in `pipeline/` (see `CLAUDE.md`).

## Credits

3D anatomy geometry adapted from **BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International** (https://creativecommons.org/licenses/by/4.0/). Changes: selection of muscles and bones, unit and axis conversion, smoothing, decimation, generated muscles, rigging.

## License

Copyright © 2026 Miloš Milinkov. All rights reserved.

This project is proprietary and **not** open source. No licence is granted to use, copy, modify, deploy or distribute it. See [LICENSE](LICENSE) for the full terms. For permission requests, contact milos300399@gmail.com.

Security issues: see [SECURITY.md](SECURITY.md).
