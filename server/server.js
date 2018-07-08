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

/* const macOptions = {
  describe: 'The Mac of the product',
  demand: true,
  alias: 'm'
};

const greenOptions = {
  describe: 'The command of the green Led. Only accepted on or off',
  demand: true,
  alias: 'g'
};
const yellowOptions = {
  describe: 'The command of the yellow Led. Only accepted on or off',
  demand: true,
  alias: 'y'
};
const idOptions = {
  describe: 'The ID of the product',
  demand: true,
  alias: 'i'
};
program
  .command('sled <mac> <yellow> <green>')
  .alias('l')
  .description('command Led')
  .action((mac, yellow, green) => {
    console.log(`Disparou sled com o mac:${mac} y:${yellow} g:${green}`);
  });


program
  .command('rled <mac> ')
  .alias('r')
  .description('request Led')
  .action((mac) => {
    console.log(`Disparou rled com o mac:${mac}`);
  });



const argv = yargs
  .command('sled', 'Send a Led command to a especific product', {
    mac: macOptions,
    yellow: yellowOptions,
    green: greenOptions
  })
  .command('rled', 'Request the led status of a especific product', {
    mac: macOptions
  })
  .command('rfirmware', 'Request the firmware info of a especific product', {
    mac: macOptions
  })
  .command('rnetwork', 'Request the network info of a especific product', {
    mac: macOptions
  })
  .command('rstatus', 'Request the status info of a especific product', {
    mac: macOptions
  })
  .command('rglobal', 'Request the global info of a especific product', {
    mac: macOptions
  })
  .command('getmac', 'Get a especific product by the mac', {
    mac: macOptions
  })
  .command('getid', 'Get a especific product by the ID', {
    id: idOptions
  })
  .command('setid', 'Set the ID of a especific product', {
    mac: macOptions,
    id: idOptions
  })
  .command('list', 'List all saved products')
  .help()
  .argv; */

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





  //program.parse(process.stdin);

//aqui é onde funciona
/*rl.on('line', function (line) {
  var res = line.split(' ');
  var command = res[0];
  if (command == 'sled') {
    var result = mqttUtils.sendLedCommandParameters(res[1], res[2], res[3]);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message not sent.`);
    }
  } else if (command == 'rled') {

    var result = mqttUtils.requestLedStatus(res[1]);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message was not sent.`);
    }
  } else if (command == 'rfirmware') {

    var result = mqttUtils.requestFirmwareInfo(res[1]);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message was not sent.`);
    }
  } else if (command == 'rnetwork') {
    var result = mqttUtils.requestNetworkInfo(res[1]);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message was not sent.`);
    }
  } else if (command == 'rstatus') {
    var result = mqttUtils.requestStatusInfo(res[1]);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message was not sent.`);
    }
  } else if (command == 'rglobal') {

    var result = mqttUtils.requestGlobalInfo(res[1]);
    if (result) {
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic, result.message);
    } else {
      console.log(`Message was not sent.`);
    }
  } else if (command == 'getmac') {
    var result = products.getProductByMac(res[1]);
    if (result) {
      console.log(`Product was found:`);
      products.printProduct(result);
    } else {
      console.log(`Product was not found.`);
    }
  } else if (command == 'getid') {
    var result = products.getProductById(res[1]);
    if (result) {
      console.log(`Product was found:`);
      products.printProduct(result);
    } else {
      console.log(`Product was not found.`);
    }
  } else if (command == 'setid') {
    var result = products.setProductId(res[1], res[2]);
    if (result) {
      console.log(`The id was set:`);
      products.printProduct(result);
    } else {
      console.log(`Product was not found.`);
    }
  } else if (command == 'list') {
    products.printAllProducts();
  } else if (command == 'addMac') {
    var result = products.addProductByMac(res[1]);
    if (result) {
      console.log(`Product was added:`);
      products.printProduct(result);
    }
  } else if (command == 'addId') {
    var result = products.addProductByMacAndId(res[1], res[2]);
    if (result) {
      console.log(`Product was added:`);
      products.printProduct(result);
    } else {
      console.log(`Product was not added.`);
    }
  } else {
    console.log('default:' + command);
  }
});*/




/* var command = argv._[0];
switch(command){
  case command==='sled':
    var result = mqttUtils.sendLedCommandParameters(argv.mac, argv.yellow, argv.green);
    if(result){
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic,result.message);
    }else{
      console.log(`Message not sent:`);
    }
  break;
  case command==='rled':
    var result = mqttUtils.requestLedStatus(argv.mac);
    if(result){
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic,result.message);
    }else{
      console.log(`Message was not sent.`);
    }
  break;
  case command==='rfirmware':
    var result = mqttUtils.requestFirmwareInfo(argv.mac);
    if(result){
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic,result.message);
    }else{
      console.log(`Message was not sent.`);
    }
  break;
  case command==='rnetwork':
    var result = mqttUtils.requestNetworkInfo(argv.mac);
    if(result){
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic,result.message);
    }else{
      console.log(`Message was not sent.`);
    }
  break;
  case command==='rstatus':
    var result = mqttUtils.requestStatusInfo(argv.mac);
    if(result){
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic,result.message);
    }else{
      console.log(`Message was not sent.`);
    }
  break;
  case command==='rglobal':
    var result = mqttUtils.requestGlobalInfo(argv.mac);
    if(result){
      console.log(`Message was sent:`);
      mqttUtils.printMessage(result.topic,result.message);
    }else{
      console.log(`Message was not sent.`);
    }
  break;
  case command==='getmac':
    var result = products.getProductByMac(argv.mac);
    if(result){
      console.log(`Product was found:`);
      products.printProduct(result);
    }else{
      console.log(`Product was not found.`);
    }
  break;
  case command==='getid':
    var result = products.getProductById(argv.id);
    if(result){
      console.log(`Product was found:`);
      products.printProduct(result);
    }else{
      console.log(`Product was not found.`);
    }
  break;
  case command==='setid':
    var result = products.setProductId(argv.mac, argv.id);
    if(result){
      console.log(`The id was set:`);
      products.printProduct(result);
    }else{
      console.log(`Product was not found.`);
    }
  break;
  case command==='list':
    products.printAllProducts();     
  break;
} */


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



  /* mqttClient.on('message', (topic, message) => {
    console.log(`Received message: Topic=${topic} Message=${message}`);
    //var mac = getMacFromTopic(topic);

    socket.emit('receivedMQTTMessage',{
      topic: topic,
      message: message.toString(),
      createdAt: moment().valueOf()
    });
    //console.log(`No hadler for topic=${topic} Message=${message}`);
      
  }); */

});

/* function getMacFromTopic(topic){
    var splittedTopic = topic.split('/');
    return splittedTopic[2];
};

function publishMQTTMessage (msg, id) {
  console.log(`Message:${msg}  Topic:${topicPrefix}/${id}/command`);
  mqttClient.publish(`${topicPrefix}/${id}/command`, msg);   
}; */

/* server.listen(port, () =>{
  console.log(`Server is up on port ${port}`);
});
 */



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