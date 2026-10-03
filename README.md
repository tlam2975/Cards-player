# Card draw

A browser card game with a 3D deck, four high-contrast palettes, an animated day/night toggle, and optional party effects. Midnight Blue in night mode is the default. Designed by Tung Lam. Built with plain HTML, CSS, and JavaScript; no build step or dependencies to install.

## Run locally

From this folder:

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

Open http://127.0.0.1:5173. Use a server so the quote JSON files can load.

## Controls

- **Draw a card** or **Enter** starts a turn.
- **Drink** adds one shot, up to the player's limit, then advances the turn.
- **Play** clears that player's shots and advances the turn.
- **Settings** controls players, language, theme, intensity, card packs, and custom cards.
- The **sun/moon switch** in the header changes the current palette between day and night. It saves with the existing five-minute session preferences and respects reduced motion.
- **No repeats** draws each enabled card once before offering a reshuffle.
- Set a round challenge on the revealed card to keep a timer across turns.

Use the cat, dog, and flower buttons beside the game for a one-time effect. In Settings → Party tricks, enable occasional pets and flowers. The hidden keys **C**, **D**, and **F** summon a cat, a dog, and flowers. Shortcuts ignore text fields. Effects don't intercept clicks or affect the game, and respect reduced motion.

## Files

- `cards.json` and `cards.en.json`: original Vietnamese quotes and their matching English translations, unchanged.
- `index.html`: page structure.
- `styles.css`: themes, layout, deck, and reveal animation.
- `design-system/card-draw/MASTER.md`: visual direction, colors, and accessibility decisions from ui-ux-pro-max.
- `app.js`: original game rules and interface behavior.
- `effects.js` / `effects.css`: optional decorative effects, separate from game state.

Quote and translation arrays correspond by index. Keep that correspondence when editing content.
