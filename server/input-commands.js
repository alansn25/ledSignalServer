var program = require('commander');
var readline = require('readline');
const mochStdin = require('readline');
const {MqttUtils} = require('./mqtt-utils');
const {Products} = require('./products');
const eventEmitter = require('./event-emitter');





class InputCommands {
    constructor (products, mqttUtils) {
      this.products = products;
      this.mqttUtils = mqttUtils;
      this.eventEmitter = eventEmitter;    
          
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      process.stdin.on('data', function (text) {          
        var textArray=text.trim().split(" ");         
        textArray.unshift('nothing');
        textArray.unshift('nothing');
        program.parse(textArray);
      }); 

      program
  .command('reqLed <mac> ')
  .alias('rl')
  .description('Request Led Status')
  .action((mac) => {
    var message = {
      type: 'reqLed',
      mac,
      data:''
    }    
    this.emitSendMessageEvent(message);
  });
  program
  .command('comLed <mac> <yellow> <green> ')
  .alias('cl')
  .description('Command Led')
  .action((mac, yellow, green) => {        
    //var emiter = new events.EventEmitter(); 
    var message = {
      type: 'comLed',
      mac,
      data:{
        yellow,
        green
      }
    }
    this.emitSendMessageEvent(message);
  });

  program
  .command('reqFirmware <mac>')
  .alias('rf')
  .description('Request Firmware Info ')
  .action((mac) => {        
    var message = {
      type: 'reqFirmware',
      mac,
      data:''
    }
    this.emitSendMessageEvent(message);
  });

  program
  .command('reqNetwork <mac>')
  .alias('rn')
  .description('Request Network Info')
  .action((mac) => {        
    var message = {
      type: 'reqNetwork',
      mac,
      data:''
    }
    this.emitSendMessageEvent(message);
  });

  program
  .command('reqStatus <mac>')
  .alias('rs')
  .description('Request Status Info')
  .action((mac) => {        
    var message = {
      type: 'reqStatus',
      mac,
      data:''
    }
    this.emitSendMessageEvent(message);
  });

  program
  .command('reqGlobal <mac>')
  .alias('rg')
  .description('Request Global Info')
  .action((mac) => {        
    var message = {
      type: 'reqGlobal',
      mac,
      data:''
    }
    this.emitSendMessageEvent(message);
  });

  /* program
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
  .command('reqGlobal <mac>')
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
  }); */

  program
  .command('getProduct <param>')
  .alias('gp')
  .description('Get Product')
  .action((param) => {        
    var result = products.getProduct(param);
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
  .action((mac, id) => {        
    var product = products.getProduct(mac);
    if(product){
      var result = product.setId(id);
      if (result) {
        console.log(`The id was set:`);
        products.printProduct(result);
      } else {
        console.log(`Product was not found.`);
      }
    }   
  });

  program
  .command('addProduct <mac> [id]')
  .alias('ap')
  .description('Set Product Id')
  .action((mac, id) => {    
    if(id){
      result = products.addProductbyMacAndId(mac, id);
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
    program.outputHelp();
  });
       
    }

    emitSendMessageEvent(message){
      this.eventEmitter.emit('command', message);
    }
}
module.exports = {InputCommands};