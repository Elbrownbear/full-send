# Full Send

A retro, top-down snowboarding game: ride an endless mountain, dodge Jerries, gapers and the crew sitting in the middle of the run, send kickers, and stay ahead of ski patrol. An original game in the spirit of the early-90s downhill classics, packed with today's ski and snowboard culture.

**Play it:** https://elbrownbear.github.io/full-send/ (phone or computer). Placeholder art for now; Ski Patrol ends every run. Read the plan in [PRD.md](PRD.md) and the joke-and-obstacle catalog in [CONTENT.md](CONTENT.md).

## Running it locally

The game is plain static files with no build step.

- **Easiest:** open `index.html` in a browser.
- **With a local server:**

  ```powershell
  npx --yes serve .
  ```

  then open the address it prints.

**Tests:**

```powershell
node --test
```

**Handy URL options:** `?seed=42` replays the same mountain; `?debug` shows hitboxes, speed and fps.

## Docs

- [PRD.md](PRD.md): what we're building and why
- [CONTENT.md](CONTENT.md): every person, obstacle, pickup and joke, with status
- [SYSTEMS.md](SYSTEMS.md): plain-language guide to how it works

## License

[MIT](LICENSE): reuse and remix the code, with credit.
