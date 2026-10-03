# Card draw interface

Applied with ui-ux-pro-max on 2026-10-03. Plain HTML, CSS, and JavaScript.

## Direction

A tactile game table designed primarily for nighttime play. Midnight Blue is the default, with navy surfaces, warm gold actions, ice-blue printed cards, restrained physical depth, and large readable controls. Ink Blue, Evergreen, and Cherry also start dark. Each palette has a light variant through the animated sun/moon switch. Players sit at the left, deck and draw action in the center, session information and optional playful effects at the right. Mobile puts the deck first.

The skill search returned relevant tactile/3D guidance, reduced-motion requirements, SVG icon guidance, 44px minimum targets, and keyboard alternatives to dragging. Its marketing-page pattern and generic felt-green palette do not fit this game and are overridden here. No animation framework is needed.

## Tokens

| Role (night) | Ink blue | Midnight blue | Evergreen | Cherry |
| --- | --- | --- | --- | --- |
| Background | #141D38 | #14233B | #102C25 | #2B1828 |
| Surface | #1E2A47 | #1D304B | #183A30 | #392337 |
| Text | #F6F3FF | #FFF9EB | #FFF7DF | #FFF4E9 |
| Muted text | #C7CDEA | #C4D0E0 | #C0D6C9 | #DAC5D6 |
| Primary | #B9C7FF | #FFD66B | #B9DDB1 | #F3BBCB |
| On primary | #18223D | #14233B | #143327 | #421A31 |

Night mode also darkens revealed quotes, BINGO cards, and eliminated-player cards. Light mode retains the original ivory/cobalt, green, and cherry surfaces, plus a pale-blue Midnight variant.

The header switch has a 50px target height, localized switch semantics, and a brief CSS moon/sun, stars, and clouds transition. No continuous animation runs. Reduced motion presents the final state immediately. Mode persists with existing five-minute settings; old saved settings without a mode default to night.

Display: Bricolage Grotesque. Body: Be Vietnam Pro, with Vietnamese support. Text inputs use at least 16px. Supporting labels use 12–14px. Primary actions are at least 60px tall; other controls have at least 44px targets.

## Interaction and invariants

- Quotes in cards.json and cards.en.json remain unchanged.
- Card selection, pack filtering, shots, player turns, countdown timing, and deck exhaustion rules remain unchanged.
- Player reorder has both drag and button alternatives.
- Shot counts include numbers rather than relying on colored dots.
- Optional pets and flowers never intercept pointer events or affect game state.
- Reduced motion skips deck choreography and limits effect movement.
- No product name is added. Footer credit: Designed by Tung Lam.

## Verification

Check desktop, tablet, narrow mobile, and short landscape screens; verify drawn-card modal and settings separately. Normal text must meet 4.5:1 contrast and keyboard focus must remain visible on every theme.

Verified at 360×640, 375×812, 768×1024, 844×390, 1280×720, and 1440×900. Draw/Drink/Play, countdown activation and expiry, keyboard reorder, theme/language switching, one-card deck completion and reshuffle, and one-shot effects passed. Audited text contrast exceeds AA on all four themes. Quote file hashes match the original files.

Night-mode update: verified touch and keyboard switching, day-mode reload persistence, fresh-session Midnight Blue default, dark quote readability, and the 320px English/Vietnamese layout. All eight day/night variants pass text contrast (minimum 4.96:1 for audited text) and focus contrast (minimum 4.73:1).
