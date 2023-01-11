#!/usr/bin/env bash

host='192.168.2.6'

if ping -c 1 -W 1 $host; then
  echo "true"
else
  echo "false"
fi