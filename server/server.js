//const _ = require('lodash');
//const yargs = require('yargs');
const express = require('express');
const path = require('path');
const mqtt = require('mqtt');

const publicPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000;
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

var topicPrefix = 'jkldd684hsg26os';
var topicID = '0001';
var app = express();

var state = {LEDG: 'off', LEDY: 'off'};

app.use(express.static(publicPath));







mqttClient.on('connect', () => {
    mqttClient.subscribe(`${topicPrefix}/${topicID}/connected`);
    console.log(`Subscribed to ${topicPrefix}/${topicID}/connected`);
});

mqttClient.on('message', (topic, message) => {
    console.log(`Received message: Topic=${topic} Message=${message}`);
    switch (topic) {
        case `${topicPrefix}/${topicID}/connected`:
          return handleConnectedMesssage(message);
        case `${topicPrefix}/${topicID}/state`:
          return handleStateMessage(message);
    }
    
    console.log(`No hadler for topic=${topic} Message=${message}`);
      
  });


  function controlLed () {
    console.log(`Command: state=${JSON.stringify(state)}`);
    mqttClient.publish(`${topicPrefix}/${topicID}/command`, JSON.stringify(state));
   
  };

  function handleConnectedMesssage (message) {
    console.log(`Handled Connected message: ${message}`);
    //connected = (message.toString() === 'true')
  };
  
  function handleStateMessage (message) {
    //garageState = message
    console.log(`Handled State message: ${message}`);
  };

  setTimeout(() => {
    console.log('timeout');
    controlLed();
  }, 5000);

//const http = require('http');
//const path = require('path');
//const socketIO = require('socket.io');



//const publicPath = path.join(__dirname,'../public' );

//var app = express();
//var server = http.createServer(app);
//var io = socketIO(server);




app.listen(port, () =>{
    console.log(`Server is up on port ${port}`);
});