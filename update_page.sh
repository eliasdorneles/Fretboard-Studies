#!/bin/bash

die(){
    echo "Erro: $*"
    exit 1
}
[ -f fretboard.html ] || die "dir gh-pages doesn't exist! aborting..."

gitstatus=`git status -s`
[ "x$gitstatus" == "x" ] || die "there are changes to be commited!"

tmpfile=`mktemp`
echo Updating page...
sed '/src=.boxfrets.js/ {
    a <script type="text/javascript">
    r boxfrets.js
    a </script>
    d
}' fretboard.html > $tmpfile
git checkout gh-pages
cat $tmpfile > index.html
echo "Page generated!"
ls -l index.html
echo "Commit and push to publish it!"
