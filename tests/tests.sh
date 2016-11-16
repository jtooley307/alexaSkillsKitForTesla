#!/bin/bash
# set PROJECT HOME
HOME="/Users/jtooley2/dev/alexaSkills"
Echo "Running tests local with JSON files"
lambda-local -l $HOME/index.js -h handler -e $HOME/tests/CarWakeRequest.json
echo "completed test, pause 5 sec"
sleep 5
lambda-local -l $HOME/index.js -h handler -e $HOME/tests/CarStatusRequest.json
echo "completed test, pause 5 sec"
sleep 5
lambda-local -l $HOME/index.js -h handler -e $HOME/tests/CarLocationRequest.json
echo "completed test, pause 5 sec"
sleep 5
lambda-local -l $HOME/index.js -h handler -e $HOME/tests/CarDistanceRequest.json
echo "completed test, pause 5 sec"
sleep 5
lambda-local -l $HOME/index.js -h handler -e $HOME/tests/SetClimateRequest.json
echo "completed test, pause 5 sec"
sleep 5
lambda-local -l $HOME/index.js -h handler -e $HOME/tests/ClimateStatusRequest.json
sleep 5
lambda-local -l $HOME/index.js -h handler -e $HOME/tests/VentRoofRequest.json
echo "DONE with tests"