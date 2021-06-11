#!/bin/bash

TRIES=30
WAIT=10

while /bin/netstat -an | /bin/grep \:8000 | /bin/grep LISTEN ; [ $? -ne 0 ]; do
    let TRIES-=1
    if [ $TRIES -gt 1 ]; then
            sleep $WAIT
    fi
done
/usr/bin/python3 /home/pi/websocketClient.py 
