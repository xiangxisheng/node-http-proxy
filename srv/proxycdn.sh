#!/bin/bash
cd $(dirname $0)

export NODE_PATH=./node_modules

while true
do
	node proxycdn.js $1
	sleep 1
done
