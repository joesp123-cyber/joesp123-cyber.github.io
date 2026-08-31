# tools

Dev harnesses. None of this ships — `out/` is the site.

| script | what it does |
|---|---|
| `entry_test.py` | Drives the entry game in a real browser: 26 assertions over first visit, skip, return, reduced motion and replay. Runs in real time and reports back over HTTP, because the game's rAF loop exhausts Chrome's virtual clock. |
| `qa.py` | Screenshots the built site in vertical slices. Pins `[data-reveal]` visible and skips the entry game — neither survives a headless capture otherwise. |
| `shot_game.py` | Screenshots the entry game mid-run by stubbing `requestAnimationFrame` after N frames so the virtual clock can settle. |
| `make_og.py` | Regenerates `app/opengraph-image.png`. Renders HTML and screenshots it, so the card uses the real Manrope and the real tokens. |
| `live_probe.py` | Proxies the deployed site through a local origin to instrument it. `python live_probe.py reduced` forces `prefers-reduced-motion`. |
| `hydration_check.py` | Points at a running Next app and reports React hydration errors under forced reduced motion. |

All of them expect `npm run build` to have run first, and Chrome at the path
each script names.
