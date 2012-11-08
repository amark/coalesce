#!/bin/bash
#
#Determines Operating system and hands off the install to node


#determine kernel
#Operating System is a Linux/Unix
	if apt-cache search bash = true;
#Debian-Based
then	sudo apt-get update; sudo apt-get upgrade; sudo apt-get install wget curl zsh git-core build-essential openssl libssl-dev upstart monit libtool autoconf uuid-dev mdadm lvm2 xfsprogs;




if `uname | grep darwin` = true;

then ruby -e "$(curl -fsSkL raw.github.com/mxcl/homebrew/go)"; brew update; brew install openssl dpkg autoconf node mongodb redis redis-tools phantomjs czmq;

node ./js/index.js;
