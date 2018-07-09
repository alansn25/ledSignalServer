"use strict";
const events = require('events');
const {mqttUtils} = require('./mqtt-utils');
const {messageUtils} = require('./message-utils');
const Joi = require('joi');

const feedbackTimeOut = 3000;
const ledSchema = Joi.object().keys({    
    yellow: Joi.string().required().valid('on','off'),
    green: Joi.string().required().valid('on','off')
});


class Product extends events {
    constructor (mac) {
        super();
        this.timeout=1;
        this.eventLine = [];
        this.mac=mac;
        this.startReceiving();
       
    }
    emitWriteFileEvent(){
        this.emit('writeFile');
    }
    putEventInLine(topic){
        var topicSufix=mqttUtils.getTopicSufix(topic);
        var timerId = setTimeout(() => {
            console.log(`Fineshed sending message...`);
            this.emit('finished sending');
        }, feedbackTimeOut);
        var event = {
            eventId:topicSufix,
            timerId: timerId
        }
        this.eventLine.push(event);
    }
    removeEventFromLine(topic){
        var topicSufix=MqttUtils.getTopicSufix(topic);
        var event = this.eventLine.find((event)=>element.eventId===topicSufix);
        clearTimeout(event.timerId);
        var index = this.eventLine.findIndex((event)=>element.eventId===topicSufix);
        this.eventLine = this.eventLine.slice(index,1);       
    }

    startReceiving(){
        this.on(this.mac, (message) => {
            removeEventFromLine(message.topic);
            
            switch(topic){
                case this.productToServerActiveTopic():
                    handleReceiveActiveMessage (this.mac, objMessage);
                break;
                case this.productToServerCommandFeedbackTopic():
                    handleReceiveCommandFeedbackMessage (this.mac, objMessage);
                break;
                case this.productToServerRequestLedStatusReplyTopic():
                    handleReceiveLedStatusReplyMessage (this.mac, objMessage)
                break;
                case this.productToServerRequestFirmwareInfoReplyTopic():
                    handleReceiveRequestFirmwareInfoReplyMessage (this.mac, objMessage);
                break;
                case this.productToServerRequestStatusInfoReplyTopic():
                    handleReceiveRequestStatusInfoReplyMessage (this.mac, objMessage);
                break;
                case this.productToServerRequestNetworkInfoReplyTopic():
                    handleReceiveRequestNetworkInfoReplyMessage (this.mac, objMessage);
                break;
                case this.productToServerRequestGlobalInfoReplyTopic():
                    handleReceiveRequestGlobalInfoReplyMessage (this.mac, objMessage);
                break;
                case this.productToServerFirmwareUpdateReplyTopic():
                    console.log(`Firmware Update Reply Message: `);
                    this.printMessage(topic, message);
                break;
                default:
                    console.log(`Unknowm Message:`);
                    this.printMessage(topic, message);

            }
        });
    }


    sendMessage(){
        console.log(`Start sending message...`);
        this.emit('start sending');
        this.timeout = setTimeout(() => {
            console.log(`Fineshed sending message...`);
            this.emit('finished sending');
        }, 1500);
    }
    
    startReceiving2(){
        this.on('received', () => {
            console.log('Received message event');
            clearTimeout(this.timeout);
          });
    }

    setProductId (id) {               
        product.id = id;
        emitWriteFileEvent();                
        return this;          
    };

    setProductLed (led) {
        var result = Joi.validate(led, ledSchema);        
        if(result.error===null){           
            this.led = led;
            return this;           
        }
    };
    
    setProductFirmware (firmware) {       
        this.firmware = firmware;
        return this;        
    };
    
    setProductStatus (status) {
        this.status = status;
        return this;        
    };
    
    setProductNetwork (network) {
        this.network = network;
        return this;               
    };
    setProductGlobal(global) {//not fastest because has to look up for the product 5 times but easier
        if(global.led){
            this.setProductLed(global.led);
        }
        if(global.firmware){
            this.setProductFirmware(global.firmware);
        }
        if(global.status){
            this.setProductStatus(global.status);
        }
        if(global.network){
            this.setProductNetwork(global.network);
        }  
        return this;         
    };

    setProductActive(active){
        var result= Joi.validate(active, Joi.string().valid('on','off').required());        
        if(result.error===null){         
            this.active=active;              
        }
    };
    
    isProductActive(){                
        if(this.active==='on'){
            return true;
        }else if(this.active==='off'){
            return false;
        }        
    };

    sendLedCommandParameters(mac, yellow, green) {
        var message={
            yellow,
            green,
        };             
        if(messageUtils.isLedMessageValid(message)){
            if(messageUtils.isMacValid(mac)){
                var topic = mqttUtils.serverToProductCommandTopic(mac);
                mqttUtils.publishMqttMessage(topic, JSON.stringify(message));
                return {topic,message}; 
            }            
        }
    };

    sendLedCommandObj(messageObj) {        
        if(messageUtils.isLedMessageValid(messageObj)){            
            if(messageUtils.isMacValid(mac)){                
                var topic = mqttUtils.serverToProductCommandTopic(mac);                
                mqttUtils.publishMqttMessage(topic, JSON.stringify(messageObj));
                return {topic:topic,message:messageObj};
            }
        }
    };

    sendFirmwareUpdate(mac, messageObj) {
        if(messageUtils.isFirmwareUpdateMessageValid(messageObj)){
            if(messageUtils.isMacValid(mac)){
                var topic = mqttUtils.serverToProductFirmwareUpdateTopic(mac);
                mqttUtils.publishMqttMessage(topic,JSON.stringify(messageObj));
                return {topic,messageObj};
            }
        }
    };

    requestLedStatus(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = mqttUtils.serverToProductRequestLedStatusTopic(mac);
            var message = '{}';
            mqttUtils.publishMqttMessage(topic,message); 
            return {topic,message}; 
        }
    }

    requestFirmwareInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = mqttUtils.serverToProductRequestFirmwareInfoTopic(mac);
            var message = '{}';
            mqttUtils.publishMqttMessage(topic, message); 
            return {topic, message};
        }
    }

    requestStatusInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = mqttUtils.serverToProductRequestStatusInfoTopic(mac);
            var message = '{}';
            mqttUtils.publishMqttMessage(topic, message); 
            return {topic, message}; 
        }
    }

    requestNetworkInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = mqttUtils.serverToProductRequestNetworkInfoTopic(mac);
            var message = '{}';
            mqttUtils.publishMqttMessage(topic, message); 
            return {topic, message};
        }
    }

    requestGlobalInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = mqttUtils.serverToProductRequestGlobalInfoTopic(mac);
            var message = '{}';
            mqttUtils.publishMqttMessage(topic, message); 
            return {topic, message};
        }
    }


    handleReceiveActiveMessage (mac, message) {
        return this.setProductActive(mac, message);
    };
    handleReceiveCommandFeedbackMessage (mac, message) {
        return this.setProductLed(mac, message);
    };
    handleReceiveLedStatusReplyMessage (mac, message) {
        return this.setProductLed(mac, message);
    };
    handleReceiveRequestFirmwareInfoReplyMessage (mac, message) {
        return this.setProductFirmware(mac, message);
    };
    handleReceiveRequestStatusInfoReplyMessage (mac, message) {
        return this.setProductStatus(mac, message);
    };
    handleReceiveRequestNetworkInfoReplyMessage (mac, message) {
        return this.setProductNetwork(mac, message);
    };
    handleReceiveRequestGlobalInfoReplyMessage (mac, message) {
        return this.setProductGlobal(mac, message);
    };

}

const myEmitter = new Product();
myEmitter.on('start sending', () => {
  console.log('Start sending message event');
});
myEmitter.on('finished sending', () => {
    console.log('Fineshed sending message event');
  });
myEmitter.sendMessage();
myEmitter.startReceiving();
myEmitter.emit('received');