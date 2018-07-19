const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
//var moment = require('moment');
const {MqttUtils} = require('./mqtt-utils');
const {Products} = require('./products');
const eventEmitter = require('./event-emitter');
const {InputCommands} = require('./input-commands');
const {MessageUtils} = require('./message-utils');

const publicPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000;
//var eventEmitter = new events.EventEmitter();

console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var messageUtils =new MessageUtils();

var products = new Products();
products.readProductsFromFile((err)=>{                   
  if(err){
      console.log(`Error reading from file: ${err}`);
  }else{
      console.log(`Read from file successful.`);
  }
});
var mqttUtils = new MqttUtils();
var inputCommands = new InputCommands(products,mqttUtils);

app.use(express.static(publicPath));

process.stdin.resume();
process.stdin.setEncoding('utf8');


eventEmitter.on('command', (command)=>{
  processCommand(command);
});

eventEmitter.on('addProduct', (mac)=>{
  io.sockets.emit('newProduct', mac);
});

eventEmitter.on('disconnect', (product)=>{
  console.log('The product was disconnected');
  io.sockets.emit('disconnect', product);
});

eventEmitter.on('connect', (product)=>{
  console.log('The product was connected.');
  io.sockets.emit('connect', product);
});

eventEmitter.on('MessageFailure', (error, message)=>{
  console.log('The message was a failure:');
});


io.on('connection', (socket) => {
  console.log('New Product Connected');
  //var formattedTime = moment(message.createdAt).format('h:mm a');
  socket.emit('subscribed', {
    topic: `${topicPrefix}/#`
  });
  
  socket.on('connect', (product) => {
    console.log('Received socket connect.');
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected from server');
  });

  socket.on('command', (command) => {
    
    processCommand(command);
  });

  socket.on('feedback', () => {
    console.log('User was disconnected from server');
  });
  

});
function emitFeedback(error, response, command){
  io.sockets.emit('feedback', error, response, command);
}
function processCommand(command){
  if(command.type){
    switch(command.type){
      case 'reqLed':
        var product =  products.getProduct(command.mac);
        if(product){
          var result = product.requestLedStatus();
          if (result) {
            console.log(` `);
            console.log(`Message was sent:`);
            messageUtils.printMessage(result.topic, result.message);
          } else {
            console.log(` `);
            console.log(`Message was not sent.`);
            emitFeedback('Product not found', null, command);
          }
        }       
      break;
      case 'comLed':
        var product =  products.getProduct(command.mac);
        if(product){
          var result = product.sendLedCommandObj(command.data);
          if (result) {
            console.log(`Message was sent:`);
            messageUtils.printMessage(result.topic, result.message);
          } else {
            console.log(`Message not sent.`);
            emitFeedback('Product not found', null, command);
          }
        }
        
        
      break;
      case 'reqFirmware':
        var product =  products.getProduct(command.mac);
        if(product){
          var result = product.requestFirmwareInfo(command.mac);
          if (result) {
            console.log(`Message was sent:`);
            messageUtils.printMessage(result.topic, result.message);
          } else {
            console.log(`Message not sent.`);
            emitFeedback('Product not found', null, command);
          }
        }
      break;
      case 'reqNetwork':
        var product =  products.getProduct(command.mac);         
        if(product){           
          var result = product.requestNetworkInfo(command.mac);
        if (result) {
          console.log(`Message was sent:`);
          messageUtils.printMessage(result.topic, result.message);
        } else {
          console.log(`Message not sent.`);
          emitFeedback('Product not found', null, command);
        }
      }
      break;
      case 'reqStatus':
        var product =  products.getProduct(command.mac);         
        if(product){           
          var result = product.requestStatusInfo(command.mac);
        if (result) {
          console.log(`Message was sent:`);
          messageUtils.printMessage(result.topic, result.message);
        } else {
          console.log(`Message not sent.`);
          emitFeedback('Product not found', null, command);
        }
      }
      break;
      case 'reqGlobal':
        var product =  products.getProduct(command.mac);         
        if(product){           
          var result = product.requestGlobalInfo(command.mac);
        if (result) {
          console.log(`Message was sent:`);
          messageUtils.printMessage(result.topic, result.message);
        } else {
          console.log(`Message not sent.`);
          emitFeedback('Product not found.', null, command);
        }
      }
      break;
      default:
        emitFeedback('Command unknown.', null, command);
        console.log(`Trying to send Unknown Message:`);
        messageUtils.printMessage(result.topic, result.message); 

    }
  }
    
 
}  
