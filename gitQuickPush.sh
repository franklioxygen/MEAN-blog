#!/bin/bash

git add .
git commit -a -m '${BASH_ARGV[0]}'
git push origin master

