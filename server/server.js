//const _ = require('lodash');
const yargs = require('yargs');
const express = require('express');
const path = require('path');
//const mqtt = require('mqtt');
const socketIO = require('socket.io');
const http = require('http');
var moment = require('moment');
const {
  MqttUtils
} = require('./mqtt-utils');
const {
  Products
} = require('./products');
var program = require('commander');
var readline = require('readline');

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

app.use(express.static(publicPath));

 //aqui funciona
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
}); 


 process.stdin.resume();
process.stdin.setEncoding('utf8');


/* process.stdin.on('data', function (text) {
  console.log(`Chegou aqui:${text}`);
 var textArray=text.split(" ");
 console.log(`Chegou aqui2:${textArray}`);
 textArray.unshift('nothing');
 textArray.unshift('nothing');
 program.parse(textArray);
}); 
 */
rl.on('line', function (line) {
  //console.log(`Chegou aqui:${text}`);
 var textArray=line.split(" ");
 console.log(`Chegou aqui2:${textArray}`);
 textArray.unshift('nothing');
 textArray.unshift('nothing');
 program.parse(textArray);
}); 

program
  .command('reqLed <mac> ')
  .alias('rl')
  .description('Request Led Status')
  .action((mac) => {
    var result = mqttUtils.requestLedStatus(mac);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message was not sent.`);
    }
  });
  program
  .command('comLed <mac> <yellow> <green> ')
  .alias('cl')
  .description('Command Led')
  .action((mac, yellow, green) => {        
    var result = mqttUtils.sendLedCommandParameters(mac, yellow, green);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('reqFirmware <mac>')
  .alias('rf')
  .description('Request Firmware Info ')
  .action((mac) => {        
    var result = mqttUtils.requestFirmwareInfo(mac);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('reqNetwork <mac>')
  .alias('rn')
  .description('Request Network Info')
  .action((mac) => {        
    var result = mqttUtils.requestNetworkInfo(mac);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('reqStatus <mac>')
  .alias('rs')
  .description('Request Status Info')
  .action((mac) => {        
    var result = mqttUtils.requestStatusInfo(mac);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('reqGloba <mac>')
  .alias('rg')
  .description('Request Global Info')
  .action((mac) => {        
    var result = mqttUtils.requestGlobalInfo(mac);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('getProduct <param>')
  .alias('gp')
  .description('Get Product')
  .action((param) => {        
    var result = products.getProduc(param);
    if (result) {
      console.log(`Product was found:`);
      products.printProduct(result);
    } else {
      console.log(`Product was not found.`);
    }
  });

  program
  .command('setId <mac> <id>')
  .alias('si')
  .description('Set Product Id')
  .action((mac) => {        
    var result = products.setProductId(mac, id);
    if (result) {
      console.log(`The id was set:`);
      products.printProduct(result);
    } else {
      console.log(`Product was not found.`);
    }
  });

  program
  .command('addProduct <mac> [id]')
  .alias('ap')
  .description('Set Product Id')
  .action((mac, id) => {    
    if(id){
      result = products.addProductbyMacAndId(mac);
    }else{
      result = products.addProductbyMac(mac);
    }         
    if (result) {
      console.log(`The product was added:`);
      products.printProduct(result);
    } else {
      console.log(`Product was not added.`);
    }
  });

  program
  .command('list')
  .alias('li')
  .description('List All Products')
  .action(() => {    
    products.printAllProducts();
  });

  program
  .command('help')
  .alias('h')
  .description('Help')
  .action(() => {    
    program.help();
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
  
