const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
var moment = require('moment');
const {MqttUtils} = require('./mqtt-utils');
const {Products} = require('./products');
const eventEmitter = require('./event-emitter');
const {InputCommands} = require('./input-commands');
const {MessageUtils} = require('./message-utils');
const socketIOAuth = require('socketio-auth');
const fs = require('fs');
const bcrypt = require('bcryptjs'); 

const publicPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000;








console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var messageUtils =new MessageUtils();

var products = new Products();
 /* products.readProductsFromFile((err)=>{                   
  if(err){
      console.log(`Error reading from file: ${err}`);
  }else{
      console.log(`Read from file successful.`);
  }
}); */ 
var mqttUtils = new MqttUtils();
var inputCommands = new InputCommands(products, mqttUtils);

app.use(express.static(publicPath));

process.stdin.resume();
process.stdin.setEncoding('utf8');


eventEmitter.on('command', (command)=>{
  command.timestamp = moment().format('HH:mm:SSS');
    var product = products.getProduct(command.id);
    if(product){
      product.command(command);
    }else{
      emitCommandFeedback('Product not found', command, null);
    }
});

 

eventEmitter.on('newProduct', (product)=>{
  io.sockets.emit('newProduct', product);
});

eventEmitter.on('disconnect', (product)=>{
  console.log('The product was disconnected');
  io.sockets.emit('productDisconnected', product);
});

eventEmitter.on('connect', (product)=>{
  console.log('The product was connected.');
  io.sockets.emit('productConnected', product);
});



eventEmitter.on('commandFeedback', (error, sendInfo, product)=>{
  console.log('Enter on commandFeedback');
  if(sendInfo){
    emitCommandFeedback(error, sendInfo.command, product);
  }else{
    emitCommandFeedback(error, null, product);
  }    
});

eventEmitter.on('infoRequestFeedback', (error, infoRequest, feedback)=>{
  console.log('Enter on info');  
    emitInfoFeedback(error, infoRequest, feedback);     
});

//var product = products.getProduct('p2');
//product.requestLedStatus();

/* setTimeout(()=>{
    var product = products.getProduct('p2');
    product.requestLedStatus(); 
    product.requestFirmwareInfo(); 
},5000); */


io.on('connection', (socket) => {
  console.log('New listener is up');
  
  /* socket.emit('subscribed', {
    topic: `${topicPrefix}/#`
  }); */
  
  /* socket.on('connect', (product) => {
    console.log('Received socket connect.');
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected from server');
  }); */

  /* socketIOAuth(io, {
    authenticate: authenticate,
    postAuthenticate: postAuthenticate,
    disconnect: disconnect,
    timeout: 1000
  }); */

   socket.on('command', (command) => {
    command.timestamp = moment().format('HH:mm:SSS');
    var product = products.getProduct(command.id);
    if(product){
      var result = product.command(command);
      if(!result){
        emitCommandFeedback('could not handle the command', command, null);
      }
    }else{
      emitCommandFeedback('Product not found', command, null);
    }    
  });
 
  socket.on('infoRequest', (info) => {
    info.timestamp = moment().format('HH:mm:SSS');
   products.requestInfo(info);    
  }); 
  

  


});


/* socketIOAuth(io, {
  authenticate: function (socket, data, callback) {
    //get credentials sent by the client
    var username = data.username;
    var password = data.password;
    
    checkCredentials(username, password, function(err, data){
      if(err){
        return callback(err);
      }else{
        return callback(err, data);
      }
    })      
  },
  disconnect: function (socket){
    console.log(socket.id + ' disconnected');
  },
  timeout: 1000
}); */

/*
const disconnect = socket => {
  console.log(socket.id + ' disconnected');
}
const authenticate = async (socket, data, callback) => {
  var username = data.username;
  var password = data.password;
  
  checkCredentials(username, password, function(err, data){
    if(err){
      callback(err);
    }else{
      callback(err, data);
    }
  })
};

const postAuthenticate = socket => {
  socket.on('command', (command) => {
    command.timestamp = moment().format('HH:mm:SSS');
    var product = products.getProduct(command.id);
    if(product){
      var result = product.command(command);
      if(!result){
        emitCommandFeedback('could not handle the command', command, null);
      }
    }else{
      emitCommandFeedback('Product not found', command, null);
    }    
  });

  socket.on('infoRequest', (info) => {
    info.timestamp = moment().format('HH:mm:SSS');
    products.requestInfo(info);    
  });
};

socketIOAuth(io, { authenticate, postAuthenticate, disconnect, timeout:1000 });
*/
function emitCommandFeedback(error, command, response){
  io.sockets.emit('commandFeedback', error, command, response);
};
function emitInfoFeedback(error, infoRequest, response){
  io.sockets.emit('infoRequestFeedback', error, infoRequest, response);
};

function checkCredentials(username, password, callback){
  fs.readFile('users.json', (err, data) => {
    if(!err){
        var users;
        try {
          users = JSON.parse(data);
        } catch (e) {
          callback("Could not fecth any users", false);
        }

        var authorizedUser = users.filter((user) => (user.username === username));             
        if(authorizedUser.length===0){
          callback(null, false);
        }else{          
          bcrypt.compare(password, authorizedUser[0].password, (err, res)=>{
            callback(err, res);
          });          
        }                         
    }else{
      callback(err, false);
    }
    
});
}

server.listen(port, ()=>{
  console.log(`Server is up on the port ${port}`);
});

