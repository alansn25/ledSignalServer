var socket = io();


function sendCommand (command) {    
    socket.emit('command',command);
}

function requestInfo (info) {
    socket.emit('infoRequest',info);
}

socket.on('connect', function(){
    socket.emit('authentication', {username: "framework", password: "a34R7u*24Cvb/@UG&sfnbZ"});
    socket.on('authenticated', function(err) {
        console.log("There was an error with the authentication:", err);
    });
  });

socket.on('commandFeedback', function (error, command, response) {
    console.log(`Received commandFeedback:`);
    console.log(`Error:${error}`);
    console.log(`command:${JSON.stringify(command)}`);
    console.log(`response:${JSON.stringify(response)}`);
});

socket.on('infoRequestFeedback', function (error, infoRequest, response) {
    console.log(`Received infoRequestFeedback:`);
    console.log(`Error:${error}`);
    console.log(`infoRequest:${JSON.stringify(infoRequest)}`);
    console.log(`response:${JSON.stringify(response)}`);
});

socket.on('newProduct', function (product) {
    console.log(`Received newProduct:`);
    console.log(`product:${JSON.stringify(product)}`);    
});

socket.on('productConnected', function (product) {
    console.log(`Received productConnected:`);
    console.log(`product:${JSON.stringify(product)}`);    
});

socket.on('productDisconnected', function (product) {
    console.log(`Received productDisconnected:`);
    console.log(`product:${JSON.stringify(product)}`);    
});



