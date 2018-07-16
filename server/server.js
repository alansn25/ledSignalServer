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
const eventEmitter = require('./event-emitter');
const {InputCommands} = require('./input-commands');

const publicPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000;
//var eventEmitter = new events.EventEmitter();


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


eventEmitter.on('SendMessage', (message)=>{
  processMessage(message);
});

eventEmitter.on('MessageSuccess', (message)=>{
  console.log('The message was sent Successfully:');
});

eventEmitter.on('MessageFailure', (error, message)=>{
  console.log('The message was a failure:');
});


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

function processMessage(message){
  if(message.type){
    switch(message.type){
      case 'reqLed':
        var product =  products.getProduct(message.mac);
        if(product){
          var result = product.requestLedStatus();
          if (result) {
            console.log(`Message was sent:`);
            mqttUtils.printMessage(result.topic, result.message);
          } else {
            console.log(`Message was not sent.`);
          }
        }       
      break;
      case 'comLed':
        var product =  products.getProduct(message.mac);
        if(product){
          var result = product.sendLedCommandObj(message.data);
          if (result) {
            console.log(`Message was sent:`);
            mqttUtils.printMessage(result.topic, result.message);
          } else {
            console.log(`Message not sent.`);
          }
        }
        
        
      break;
      case 'reqFirmware':
        var product =  products.getProduct(message.mac);
        if(product){
          var result = product.requestFirmwareInfo(message.mac);
          if (result) {
            console.log(`Message was sent:`);
            mqttUtils.printMessage(result.topic, result.message);
          } else {
            console.log(`Message not sent.`);
          }
        }
      break;
      case 'reqNetwork':
        var product =  products.getProduct(message.mac);         
        if(product){           
          var result = product.requestNetworkInfo(message.mac);
        if (result) {
          console.log(`Message was sent:`);
          mqttUtils.printMessage(result.topic, result.message);
        } else {
          console.log(`Message not sent.`);
        }
      }
      break;
      case 'reqStatus':
        var product =  products.getProduct(message.mac);         
        if(product){           
          var result = product.requestStatusInfo(message.mac);
        if (result) {
          console.log(`Message was sent:`);
          mqttUtils.printMessage(result.topic, result.message);
        } else {
          console.log(`Message not sent.`);
        }
      }
      break;
      case 'reqGlobal':
        var product =  products.getProduct(message.mac);         
        if(product){           
          var result = product.requestGlobalInfo(message.mac);
        if (result) {
          console.log(`Message was sent:`);
          mqttUtils.printMessage(result.topic, result.message);
        } else {
          console.log(`Message not sent.`);
        }
      }
      break;
      default:
        console.log(`Trying to send Unknown Message:`);
        mqttUtils.printMessage(result.topic, result.message); 

    }
  }
    
 
}  
