# Charlie2M

Personal site of Carlos Alejandro Madrid Mata (Charlie2M). Built with Astro, GSAP and Lenis, in English, Spanish and German.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where to edit things

| What | File |
| --- | --- |
| All text (EN / ES / DE) | `src/i18n/en.ts`, `es.ts`, `de.ts` |
| Links, email, rates, stack graph, project demo output | `src/data/profile.ts` |
| Colours, fonts, layout | `src/styles/global.css`, `gaming.css`, `future.css` |
| Animations | `src/scripts/core.ts` (shared), `home.ts`, `gaming.ts`, `future.ts` |
| Voxel logo and Minecraft-style landscape | `src/components/VoxelArt.astro` |

Pages: `/` (portfolio), `/gaming`, `/future`. Spanish and German live under `/es/…` and `/de/…`.

Every animation turns off for visitors with "reduce motion" enabled.

## Before going live

- Set `site` in `astro.config.mjs` to your real domain.
- Replace the placeholder ideas in the future projects list (`future.items` in the i18n files).
- `public/CarlosMadridMata_CV.pdf` is public once deployed and includes your phone number.

Secret on the gaming page: ↑ ↑ ↓ ↓ ← → ← → B A
