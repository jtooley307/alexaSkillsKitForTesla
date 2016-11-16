'use strict';

const util = require('util');
const teslams = require('teslams');
const geocoder = require('geocoder');
var Alexa = require("alexa-sdk");
var distance = require('google-distance-matrix');
require('dotenv').config();


// tesla creditials
var creds = {
  email: process.env.T_USERNAME,
  password: process.env.T_PASSWORD
};
// local variable holding reference to the Alexa SDK object
var alexa;

//OPTIONAL: replace with "amzn1.ask.skill.[your-unique-value-here]";
//var APP_ID = null;
var APP_ID = "amzn1.ask.skill.4e93b479-6620-4a63-bebb-cc4f39823814";

// Skills name
var skillName = "Tesla Skills App";

// Message when the skill is first called
var welcomeMessage = "You can ask for information about the car, give some simple commands, or say help. What would you like? ";

// Message for help intent
var HelpMessage = "Here are some things you can say: Honk horn, flash lights, status";

// Used when an event is asked for
var killSkillMessage = "Ok, great, see you next time.";

// used for title on companion app
var cardTitle = "Tesla Skills notes";

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `Tesla Skill - ${title}`,
            content: `Tesla Skill says - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

function pr( stuff ) {
    console.log( util.inspect(stuff) );
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const speechOutput = welcomeMessage;
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'HelpMessage';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getStatusResponse(callback) {
    teslams.get_vid( { email: creds.email, password: creds.password }, function ( vid ) {
        if (vid == undefined) {
            console.log("Error: Undefined vehicle id");
        } else {
    
            teslams.wake_up(vid, wakeUpResponse => {
        
                teslams.get_charge_state(vid, chargeStateResponse => {
                    const sessionAttributes = {};
                    const cardTitle = 'Status';
                    const speechOutput = 'Battery is currently at ' + chargeStateResponse.battery_level + '%. You have ' + parseInt(chargeStateResponse.est_battery_range, 10) + ' miles of range left';
                    const shouldEndSession = true;
                    pr("INFO:" + cardTitle + ": " + speechOutput)
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
                });
            });

        }
      }
    );
}

function getCarTempResponse(callback) {
    teslams.get_vid( { email: creds.email, password: creds.password }, function ( vid ) {
        if (vid == undefined) {
            console.log("Error: Undefined vehicle id");
        } else { 

            teslams.wake_up(vid, wakeUpResponse => {

                teslams.get_climate_state(vid, climateStateResponse => {
                    const sessionAttributes = {};
                    const cardTitle = 'Climate Status';
                    const speechOutput = 'The inside temperature is ' + String(parseFloat(climateStateResponse.inside_temp) * 1.8 + 32);
                    const shouldEndSession = true;
                    pr("INFO:" + cardTitle + ": " + speechOutput)
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
                });
            });
        }
      }
    );
}

function honkHornRequest(callback) {
    teslams.get_vid( { email: creds.email, password: creds.password }, function ( vid ) {
        if (vid == undefined) {
            console.log("Error: Undefined vehicle id");
        } else { 

            teslams.wake_up(vid, wakeUpResponse => {

                teslams.honk( vid , honkHornResponse => {
                    const sessionAttributes = {};
                    const cardTitle = 'Horn Status';
                    const speechOutput = 'HONK';
                    const shouldEndSession = true;
                    pr("INFO:" + cardTitle + ": " + speechOutput)
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
                });
            });
        }
      }
    );
}

function getCarDistanceResponse(callback) {
    teslams.get_vid( { email: creds.email, password: creds.password }, function ( vid ) {
        if (vid == undefined) {
            console.log("Error: Undefined vehicle id");
        } else { 

            teslams.wake_up(vid, wakeUpResponse => {

                teslams.get_drive_state( vid, driveStateResponse => {
                    if (driveStateResponse == undefined) {
                        pr('Error: car location is undefined');
                    } else {
                        const sessionAttributes = {};
                        var carLong = driveStateResponse.longitude;
                        var carLat = driveStateResponse.latitude;
                        
                        var origins = [process.env.HOME_ORIGIN];
                        var destinations = [carLat + ','+carLong];

                        distance.matrix(origins, destinations, function(err, data) {
                            if (err) return console.log(err);
                            console.log(data);
//                            pr(data.rows[0].elements[0].duration.text);

                            const cardTitle = 'Drive Distance';
                            var carDistance = data.rows[0].elements[0].duration.text;
                            var carDistanceValue = data.rows[0].elements[0].distance.value;
                            if (data.status == 'OK' ) {
                                var speechOutput = 'the car is  '+ carDistance;
                                pr('INFO:'+carLat+','+carLong+' '+ carDistanceValue);
                            } else {
                                var speechOutput = 'the car status is unknown';
                                pr('INFO: car distance is unknown' + carDistanceValue);
                            }
                            const shouldEndSession = true;
                            pr("INFO:" + cardTitle + ": " + speechOutput)
                            callback(sessionAttributes,
                                buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
                        });
                    }
                });
            });
        }
      });
}
function getCarLocationResponse(callback) {
    teslams.get_vid( { email: creds.email, password: creds.password }, function ( vid ) {
        if (vid == undefined) {
            console.log("Error: Undefined vehicle id");
        } else { 

            teslams.wake_up(vid, wakeUpResponse => {

                teslams.get_drive_state( vid, driveStateResponse => {
                    if (driveStateResponse == undefined) {
                        pr('Error: car location is undefined');
                    } else {
                        const sessionAttributes = {};
                        var carLong = driveStateResponse.longitude;
                        var carLat = driveStateResponse.latitude;
                        geocoder.reverseGeocode( carLat, carLong, function ( err, data ) {
                            const cardTitle = 'Drive Status';
                            if (data.status == "OK" ) {
                                var speechOutput = 'the car is located '+ data.results[0].address_components[3].short_name;
                                pr('INFO:'+carLat+','+carLong+' '+data.status + data.results[0].address_components[3].short_name);
                            } else {
                                var speechOutput = 'the car status is unknown,' + data.status;
                                pr('INFO:'+carLat+', '+ +carLong+ ' '+data.status);
                            }
                            const shouldEndSession = true;
                            pr("INFO:" + cardTitle + ": " + speechOutput)
                            callback(sessionAttributes,
                                buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
                        });
                    }
                });
            });
        }
      });
}


function ventRoofRequest(callback) {
    teslams.get_vid( { email: creds.email, password: creds.password }, function ( vid ) {
        if (vid == undefined) {
            console.log("Error: Undefined vehicle id");
        } else { 

            teslams.wake_up(vid, wakeUpResponse => {

                teslams.sun_roof( vid, "vent" , roofStateResponse => {
                    const sessionAttributes = {};
                    const cardTitle = 'Roof Vent Status';
                    const speechOutput = 'the sun roof is vented';
                    const shouldEndSession = true;
                    pr("INFO:" + cardTitle + ": " + speechOutput)
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
                });
            });
        }
      }
    );
}

function setCarTempatureRequest(CarTemp, callback) {
    teslams.get_vid( { email: creds.email, password: creds.password }, function ( vid ) {
        if (vid == undefined) {
            console.log("Error: Undefined vehicle id");
        } else { 

            teslams.auto_conditioning(vid, true, climateControlResponse => {
                teslams.wake_up(vid, wakeUpResponse => {

                    teslams.set_temperature( vid, CarTemp , carTempResponse => {
                        const sessionAttributes = {};
                        const cardTitle = 'Setting Car Temperature';
                        const speechOutput = 'Interior tempature is '+ CarTemp;
                        const shouldEndSession = true;
                        pr("INFO:" + cardTitle + ": " + speechOutput)
                        callback(sessionAttributes,
                            buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
                    });
                });
            });
        }
      }
    );
}


function wakeUpCarRequest(callback) {
    teslams.get_vid( { email: creds.email, password: creds.password }, function ( vid ) {
        if (vid == undefined) {
            console.log("Error: Undefined vehicle id");
        } else { 
                teslams.wake_up( vid , carAwakeStateResponse => {
                    const sessionAttributes = {};
                    const cardTitle = 'Tesla Status';
                    const speechOutput = 'I am awake, and ready to obey';
                    const shouldEndSession = true;
                    pr("INFO:" + cardTitle + ": " + speechOutput)
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
                });
        }
      }
    );
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for trying the Alexa Skills Kit sample. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`INFO: onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`INFO: onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);
    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

function handleTestIntent(){}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`INFO: onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    if (intentName === 'CarStatusIntent') {
        getStatusResponse(callback);
    } else if (intentName === 'CarInteriorTempIntent') {
        getCarTempResponse(callback);
    } else if (intentName === 'CarLocationIntent') {
        getCarLocationResponse(callback);
    } else if (intentName === 'CarDistanceIntent') {
        getCarDistanceResponse(callback);
    } else if (intentName === 'CarWakeUpIntent') {
        wakeUpCarRequest(callback);
    } else if (intentName === 'CarVentRoofIntent') {
        ventRoofRequest(callback);
     } else if (intentName === 'CarSetTemperatureIntent') {
         // parse the temp from the intent slot
        var carTemp = intentRequest.intent.slots.CarTemp.value;
        carTemp = Math.round((carTemp -32)*5/9);
        setCarTempatureRequest(carTemp, callback);
    } else if (intentName === 'CarHonkHornIntent') {
        honkHornRequest(callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else if (intentName == 'testIntent') {
        handleTestIntent();
    }
    else {
        throw new Error('INFO: Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.

exports.handler = (event, context, callback) => {
    try {

        var alexa = Alexa.handler(event, context);

        if (event.session.application.applicationId !== APP_ID) {
             callback('Invalid Application ID: '+ event.session.application.applicationId);
        }


        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }
        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }

    } catch (err) {
        callback(err);
    }
};

