#!/bin/bash

[ -f fretboard.html ] || { echo "dir gh-pages doesn't exist! aborting..."; exit 1; }
echo -n "Generating page... "
sed '/src=.boxfrets.js/ {
    a <script type="text/javascript">
    r boxfrets.js
    a </script>
    d
}' fretboard.html > page-index.html
echo DONE
