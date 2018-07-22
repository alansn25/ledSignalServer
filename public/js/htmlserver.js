var socket = io();


function sendCommand (command) {
    /* var command = {
        type,
        id,
        data
    } */
    socket.emit('command',command);
}

function requestInfo (info) {
    socket.emit('infoRequest',info);
}

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
    console.log(`myconnect Received myconnect:`);
    console.log(`product:${JSON.stringify(product)}`);    
});

socket.on('productDisconnected', function (product) {
    console.log(`Received disconnect:`);
    console.log(`product:${JSON.stringify(product)}`);    
});



