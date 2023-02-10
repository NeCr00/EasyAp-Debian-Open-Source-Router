#!/bin/bash

spin() {
  spinner="/|\\-/|\\-"
  while :; do
    for i in $(seq 0 7); do
      echo -n "${spinner:$i:1}"
      echo -en "\010"
      sleep 0.2
    done
  done
}

# Run spinner and save its PID
spin &
SPIN_PID=$!

# Install the necessary tools
./toolsInstallation.sh

# Configure the environment
./configureAccessPoint.sh

# Kill the spinner
kill $SPIN_PID