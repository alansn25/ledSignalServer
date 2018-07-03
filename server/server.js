//const _ = require('lodash');
//const yargs = require('yargs');
const express = require('express');
const path = require('path');
const mqtt = require('mqtt');
const socketIO = require('socket.io');
const http = require('http');
var moment = require('moment');

const publicPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000;
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

var topicPrefix = 'jkldd684hsg26os';
//var topicID = '0001';
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

mqttClient.on('connect', () => {
  console.log(`Connected`);
  mqttClient.subscribe(`${topicPrefix}/#`);
  //console.log(`Subscribed to ${topicPrefix}/#`);
 
});



io.on('connection', (socket)=>{
  console.log('New user connected');
  //var formattedTime = moment(message.createdAt).format('h:mm a');
  socket.emit('subscribed',{
    topic: `${topicPrefix}/#`   
  });

  


  socket.on('publishMQTTMessage', (message)=>{
    publishMQTTMessage(message.message, message.id);
    console.log('publishMQTTMessage', message);
  });


  socket.on('disconnect', ()=>{
    console.log('User was disconnected from server');
  });

  

  mqttClient.on('message', (topic, message) => {
    console.log(`Received message: Topic=${topic} Message=${message}`);
    //var mac = getMacFromTopic(topic);

    socket.emit('receivedMQTTMessage',{
      topic: topic,
      message: message.toString(),
      createdAt: moment().valueOf()
    });
    //console.log(`No hadler for topic=${topic} Message=${message}`);
      
  });

});

function getMacFromTopic(topic){
    var splittedTopic = topic.split('/');
    return splittedTopic[2];
};

function publishMQTTMessage (msg, id) {
  console.log(`Message:${msg}  Topic:${topicPrefix}/${id}/command`);
  mqttClient.publish(`${topicPrefix}/${id}/command`, msg);   
};

server.listen(port, () =>{
  console.log(`Server is up on port ${port}`);
});




/* var currentState = {LEDG: 'off', LEDY: 'off'};









  function controlLed (state) {
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
    controlLed({LEDG: 'off', LEDY: 'off'});
  }, 5000); */

//const http = require('http');
//const path = require('path');
//const socketIO = require('socket.io');



//const publicPath = path.join(__dirname,'../public' );

//var app = express();
//var server = http.createServer(app);
//var io = socketIO(server);




