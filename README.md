# Fretboard Studies

A browser-based tool for drawing guitar fretboard diagrams — useful for studying scales, chords, and note patterns.

Live at: http://eliasdorneles.github.com/Fretboard-Studies/

## Features

- Fretboard with realistic progressive fret widths (wider near the nut, narrower toward the body)
- 6 strings × 21 frets, fills the browser window and adapts on resize
- Paint notes with 6 colors to highlight patterns and differences
- Every diagram is shareable via URL
- Quiz mode: share a link that hides the answer until the student clicks "Check answer"
- Game modes track private progress stats in browser local storage (with options to clear last game or all stats)

## Usage

Open `index.html` in a browser — no build step or server required.

Click any fret cell to paint it in the selected color. Click a painted cell again to clear it. Use the Eraser button to wipe cells by hovering over them.

The **Link** button generates a shareable URL for the current diagram. The **Quiz link** generates a version where painted cells are hidden until the student checks their answer.

## Examples

- [A minor pentatonic](http://eliasdorneles.github.com/Fretboard-Studies/#strings=5:2,8:0;5:0,8:0;5:0,7:0;5:0,7:2;5:0,7:0;5:2,8:0&diagram_title=A%20minor%20pentatonic)
- [C major pentatonic](http://eliasdorneles.github.com/Fretboard-Studies/#strings=5:0,8:2;5:0,8:0;5:2,7:0;5:0,7:0;5:0,7:0;5:0,8:2&diagram_title=C%20major%20pentatonic)

## Contributing

Ideas, suggestions, or feedback? Email eliasdorneles (at) gmail com.

## License

MIT — see `LICENSE.txt`.
