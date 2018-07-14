console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
//var moment = require('moment');
console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
const {MqttUtils} = require('./mqtt-utils');
console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
const {Products} = require('./products');
//var program = require('commander');
const {InputCommands} = require('./input-commands');

const publicPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000;



var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var products = new Products();
products.readProductsFromFile((err)=>{                   
  if(err){
      console.log(`Error reading from file: ${err}`);
  }else{
      console.log(`Read from file successful.`);
  }
});
var mqttUtils = new MqttUtils(products);
var inputCommands = new InputCommands(products,mqttUtils);

app.use(express.static(publicPath));

process.stdin.resume();
process.stdin.setEncoding('utf8');



io.on('connection', (socket) => {
  console.log('New user connected');
  //var formattedTime = moment(message.createdAt).format('h:mm a');
  socket.emit('subscribed', {
    topic: `${topicPrefix}/#`
  });




  socket.on('publishMQTTMessage', (message) => {
    //publishMQTTMessage(message.message, message.id);
    console.log('publishMQTTMessage', message);
  });


  socket.on('disconnect', () => {
    console.log('User was disconnected from server');
  });
  

});
  
