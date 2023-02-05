#wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -

#echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

#sudo apt update

#sudo apt install mongodb-org -y

#sudo systemctl start mongod


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

echo "Adding MongoDB repository to sources list..."
if ! sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get install gnupg -y; then
  echo "Error: Failed to install required packages."
  exit 1
fi

if ! wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -; then
  echo "Error: Failed to add MongoDB key to apt."
  exit 1
fi

echo "deb [ arch=arm64 ] https://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

echo "Installing MongoDB..."
spin &
SPIN_PID=$!

if ! sudo apt-get update && sudo apt-get install mongodb-org -y; then
  echo "Error: Failed to install MongoDB."
  kill $SPIN_PID
  exit 1
fi

kill $SPIN_PID

echo "Starting MongoDB service..."
if ! sudo systemctl start mongod && sudo systemctl enable mongod; then
  echo "Error: Failed to start MongoDB service."
  exit 1
fi

echo "MongoDB installation complete."
