//const {Logging}=  require('./logging');

//const logs = new Logging();

var socket = io();
var currentMac = null;

function sendCommand (command) {    
    socket.emit('command',command);
    //logs.logSendSocketCommand(command);
}

function requestInfo (info) {
    socket.emit('infoRequest',info);
    //logs.logSendSocketInforequest(info);    
}

function appendMessage(mac,event,text){
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: text,
        from: `${ moment().format('HH:mm:ss:SSS')} MAC: ${mac} - ${event}:`        
    });

    jQuery('#messages').append(html);
    scrollToBottom();
}

var clearButton = jQuery('#clear-button');
clearButton.on('click', function (e) {
    console.log("The clear button was clicked."); 
    currentMac=jQuery('[name=mac_field]').val();   
    console.log(`The current mac is ${currentMac}`); 
    jQuery('#messages').empty();
});
var onButton = jQuery('#on-button');
onButton.on('click', function (e) {
    console.log("The on button was clicked."); 
    currentMac=jQuery('[name=mac_field]').val();   
    console.log(`The current mac is ${currentMac}`); 
    sendCommand({
        type:"comLed",
        id:currentMac,
        data:{
            led1:"on",
            led2:"on"
        }
    });
});
var offButton = jQuery('#off-button');
offButton.on('click', function (e) {
    console.log("The off button was clicked."); 
    currentMac=jQuery('[name=mac_field]').val();   
    console.log(`The current mac is ${currentMac}`); 
    sendCommand({
        type:"comLed",
        id:currentMac,
        data:{
            led1:"off",
            led2:"off"
        }
    });
});

var checkButton = jQuery('#check-button');
checkButton.on('click', function (e) {
    console.log("The check button was clicked."); 
    currentMac=jQuery('[name=mac_field]').val();   
    console.log(`The current mac is ${currentMac}`); 
    sendCommand({
        type:"reqGlobal",
        id:currentMac,
        data:""
    });
});

var updateButton = jQuery('#update-button');
updateButton.on('click', function (e) {
    console.log("The update button was clicked."); 
    currentMac=jQuery('[name=mac_field]').val();   
    console.log(`The current mac is ${currentMac}`);   
    sendCommand({
        type:"update",
        id:currentMac,
        data:""
    });
});

var pairButton = jQuery('#pair-button');
pairButton.on('click', function (e) {
    console.log("The pair button was clicked."); 
    currentMac=jQuery('[name=mac_field]').val();   
    console.log(`The current mac is ${currentMac}`); 
    sendCommand({
        type:"pairStatic",
        id:currentMac,
        data:{
            ssid:jQuery('[name=ssid_field]').val(),
            password:jQuery('[name=password_field]').val(),
            ip:jQuery('[name=ip_field]').val(),
            mask:jQuery('[name=mask_field]').val(),
            gw:jQuery('[name=gateway_field]').val()
        }
    });
});
//"ssid":"LCSN_AD2.4","password":"bai55acu", "ip":"192.168.0.112","mask":"255.255.255.0","gw":"192.168.0.1" }
pairButton.on('submit', function (e) {
    e.preventDefault();
    
    console.log("The pair button was submitted.");    
    console.log(`MAC:${jQuery('[name=mac_field]').val()}`);
    console.log(`SSID:${jQuery('[name=ssid_field]').val()}`);
    console.log(`Password:${jQuery('[name=password_field]').val()}`);
    console.log(`IP:${jQuery('[name=ip_field]').val()}`);
    console.log(`Mask:${jQuery('[name=mask_field]').val()}`);
    console.log(`Gateway:${jQuery('[name=gateway_field]').val()}`);
    //var message = 'append!!!';
    
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: 'mey test',
        from: 'meu mac',
        createdAt: '123456'
    });

    jQuery('#messages').append(html);
    scrollToBottom();
    
});


socket.on('commandFeedback', function (error, command, response) {
    if((currentMac!=null)&&(response!=null)){
        if(response.hasOwnProperty('mac')){
            if(response.mac==currentMac){
                var message = `Erro: ${error}| Response:${JSON.stringify(response,null,2)}`;
                appendMessage(response.mac,`Received Command Feedback`,message);
            }      
        }  
    }
    console.log(`Received commandFeedback:`);
    console.log(`Error:${error}`);
    console.log(`command:${JSON.stringify(command)}`);
    console.log(`response:${JSON.stringify(response)}`);
    
});

socket.on('infoRequestFeedback', function (error, infoRequest, response) {
    if((currentMac!=null)&&(response!=null)){
        if(response.hasOwnProperty('mac')){
            if(response.mac==currentMac){
                var message = `Erro: ${error}| Response:${JSON.stringify(response,null,2)}`;
                appendMessage(response.mac,`Received Info Feedback`,message);
            }   
        }     
    }
    
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
    if(currentMac!=null){
        if(product.mac==currentMac){
            var message = `${JSON.stringify(product,null,2)}`;
            appendMessage(product.mac,"Product Connected",message);
        }        
    }
    console.log(`Received productConnected:`);
    console.log(`product:${JSON.stringify(product)}`);    
});

socket.on('productDisconnected', function (product) {
    if(currentMac!=null){
        if(product.mac==currentMac){
            var message = `Product Disconnected-> ${JSON.stringify(product,null,2)}`;
            appendMessage(product.mac,"Product Disconnected",message);
        }        
    }
    console.log(`Received productDisconnected:`);
    console.log(`product:${JSON.stringify(product)}`);    
});
function scrollToBottom () {
    //Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');
    //Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
        //console.log('Should scroll');
        messages.scrollTop(scrollHeight);
    }

}