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
  .command('reqLed <id/mac> ')
  .alias('rl')
  .description('Request Led Status')
  .action((id) => {
    var command = {
      type: 'reqLed',
      id,
      data:''
    }    
    this.emitSendCommandEvent(command);
  });
  program
  .command('comLed <id/mac> <yellow> <green> ')
  .alias('cl')
  .description('Command Led')
  .action((id, yellow, green) => {        
    //var emiter = new events.EventEmitter(); 
    var command = {
      type: 'comLed',
      id,
      data:{
        yellow,
        green
      }
    }
    this.emitSendCommandEvent(command);
  });

  program
  .command('reqFirmware <id/mac>')
  .alias('rf')
  .description('Request Firmware Info ')
  .action((id) => {        
    var command = {
      type: 'reqFirmware',
      id,
      data:''
    }
    this.emitSendCommandEvent(command);
  });

  program
  .command('reqNetwork <id/mac>')
  .alias('rn')
  .description('Request Network Info')
  .action((id) => {        
    var command = {
      type: 'reqNetwork',
      id,
      data:''
    }
    this.emitSendCommandEvent(command);
  });

  program
  .command('reqStatus <id/mac>')
  .alias('rs')
  .description('Request Status Info')
  .action((id) => {        
    var command = {
      type: 'reqStatus',
      id,
      data:''
    }
    this.emitSendCommandEvent(command);
  });

  program
  .command('reqGlobal <id/mac>')
  .alias('rg')
  .description('Request Global Info')
  .action((id) => {        
    var command = {
      type: 'reqGlobal',
      id,
      data:''
    }
    this.emitSendCommandEvent(command);
  });

  /* program
  .command('reqLed <id/mac> ')
  .alias('rl')
  .description('Request Led Status')
  .action((id) => {
    var result = mqttUtils.requestLedStatus(id);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.command);
    } else {
      console.log(`Message was not sent.`);
    }
  });
  program
  .command('comLed <id/mac> <yellow> <green> ')
  .alias('cl')
  .description('Command Led')
  .action((id, yellow, green) => {        
    var result = mqttUtils.sendLedCommandParameters(id, yellow, green);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.command);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('reqFirmware <id/mac>')
  .alias('rf')
  .description('Request Firmware Info ')
  .action((id) => {        
    var result = mqttUtils.requestFirmwareInfo(id);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('reqNetwork <id/mac>')
  .alias('rn')
  .description('Request Network Info')
  .action((id) => {        
    var result = mqttUtils.requestNetworkInfo(id);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('reqStatus <id/mac>')
  .alias('rs')
  .description('Request Status Info')
  .action((id) => {        
    var result = mqttUtils.requestStatusInfo(id);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  });

  program
  .command('reqGlobal <id/mac>')
  .alias('rg')
  .description('Request Global Info')
  .action((id) => {        
    var result = mqttUtils.requestGlobalInfo(id);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  }); */

  program
  .command('getProduct <id/mac>')
  .alias('gp')
  .description('Get Product')
  .action((id) => {        
    var result = products.getProduct(id);
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
    var info = {
      type: 'setId',
      mac,
      id
    }
    this.emitRequestInfoEvent(info);
   /*  var product = products.getProduct(mac);
    if(product){
      var result = product.setId(id);
      if (result) {
        console.log(`The id was set:`);
        products.printProduct(result);
      } else {
        console.log(`Product was not found.`);
      }
    }    */
  });

  program
  .command('addProduct <mac> [id]')
  .alias('ap')
  .description('Add product with mac and optional id')
  .action((mac, id) => {
    var info = {
      type: 'addProduct',
      mac,      
    }
    if(id){
      info.id=id;
    }    
    this.emitRequestInfoEvent(info);    
   /*  if(id){
      result = products.addProductbyMacAndId(mac, id);
    }else{
      result = products.addProductbyMac(mac);
    }         
    if (result) {
      console.log(`The product was added:`);
      products.printProduct(result);
    } else {
      console.log(`Product was not added.`);
    } */
  });

  program
  .command('list')
  .alias('li')
  .description('List All Products')
  .action(() => {  
    var info = {
      type: 'list'         
    }
    this.emitRequestInfoEvent(info);  
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

    emitSendCommandEvent(command){
      this.eventEmitter.emit('command', command);
    }
    emitRequestInfoEvent(info){
      this.eventEmitter.emit('infoRequest', info);
    }
}
module.exports = {InputCommands};