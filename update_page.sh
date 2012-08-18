#!/bin/bash

die(){
    echo "Erro: $*"
    exit 1
}
[ -f fretboard.html ] || die "dir gh-pages doesn't exist! aborting..."

set -e # exits if encounters an error
gitstatus=`git status -s`
[ "x$gitstatus" == "x" ] || die "there are changes to be commited!"

tmpfile=`mktemp`
echo Updating page...
sed '
s|jquery-1.4.4.min.js|http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js|;
/src=.boxfrets.js/ {
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
