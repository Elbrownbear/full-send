# Full Send

A retro, top-down snowboarding game: ride an endless mountain, dodge Jerries, gapers and the crew sitting in the middle of the run, send kickers, and stay ahead of ski patrol. An original game in the spirit of the early-90s downhill classics, packed with today's ski and snowboard culture.

**Status:** planning. Nothing is playable yet. Read the plan in [PRD.md](PRD.md) and the joke-and-obstacle catalog in [CONTENT.md](CONTENT.md).

## Running it (once there's a game)

The game is plain static files with no build step.

- **Easiest:** open `index.html` in a browser.
- **With a local server** (needed for some browsers to load the sprite files):

  ```powershell
  npx --yes serve .
  ```

  then open the address it prints.

Once it's live it will be at **https://elbrownbear.github.io/full-send/** (GitHub Pages).

## Docs

- [PRD.md](PRD.md): what we're building and why
- [CONTENT.md](CONTENT.md): every person, obstacle, pickup and joke, with status
- [SYSTEMS.md](SYSTEMS.md): plain-language guide to how it works

## License

[MIT](LICENSE): reuse and remix the code, with credit.
