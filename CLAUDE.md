# Fretboard Studies

A single-page guitar fretboard diagram tool. No build step — open `index.html` directly in a browser.

## Files

- `index.html` — all CSS (inline `<style>`) and HTML shell
- `boxfrets.js` — all application logic (no dependencies)

## Architecture

The fretboard is a single CSS Grid div (`#fretboard`) generated dynamically by `gen_fretboard()`. It fills the browser width responsively via a `window.resize` listener.

Key globals in `boxfrets.js`:
- `GUITAR_STRINGS[string][fret].td` — reference to every cell div
- `COLOR` — currently selected paint color
- `ERASER` — boolean eraser mode toggle

Fret widths follow the guitar physics ratio `2^(-1/12)` per fret, computed in `calculateFretWidths()`.

Diagrams are encoded in the URL hash (`#strings=...&diagram_title=...`) — see `uri_diagram_repr()` and `fill_from_repr()`.
