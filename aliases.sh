#!/bin/bash

#Useful aliases for the Maven
ARRAY[1]="mvn --batch-mode release:branch \
    -Dproject.rel.com.example.maven:parent=$VERSION \
    -Dproject.dev.com.example.maven:parent=$VERSION-SNAPSHOT"

alias rmrealeaseBackup='find . -name "*release*" -exec rm {} +;'
alias release='echo "Command: $ARRAY[1]\n\n"; eval $ARRAY[1]'

# default variables
VERSION=1.0.0