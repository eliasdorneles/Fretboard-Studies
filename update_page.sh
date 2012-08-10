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
echo "Commiting to gh-pages"
git commit -m "* updated gh-pages" -a
git checkout master
echo "Everything done, push to publish it!"
rm -f $tmpfile
