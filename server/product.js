"use strict";
//const events = require('events');
const _ = require ('lodash');
const {MqttUtils} = require('./mqtt-utils');
const {MessageUtils} = require('./message-utils');
const eventEmitter = require('./event-emitter');
const Joi = require('joi');

const feedbackTimeOut = 3000;
const ledSchema = Joi.object().keys({    
    yellow: Joi.string().required().valid('on','off'),
    green: Joi.string().required().valid('on','off')
});
const messageUtils =new MessageUtils();
//const mqttUtils = new MqttUtils();

class Product {
    constructor (mac, id=null) {
        
        //this.timeout=0;
        this.feedbackQueue = [];
        this.mac=mac;
        if(id){
            this.id=id;
        }
        this.startReceiving();
       
    }
    emitWriteFileEvent(){
        eventEmitter.emit('writeFile');
    }
    emitConnetEvent(product){
        eventEmitter.emit('connect', product);
    }
    emitDisconnetEvent(product){
        eventEmitter.emit('disconnect', product);
    }
    emitMessageSuccessEvent(response, message){
        eventEmitter.emit('MessageSuccess', response, message);
    }
    emitMessageFailureEvent(error, message){
        eventEmitter.emit('MessageFailure', error, message);
    }
    putFeedbackOnQueue(message){        
        var topicSufix=messageUtils.getTopicSufix(message.topic);
        var timerId = setTimeout(() => {           
            this.emitMessageFailureEvent('Time Out', message);
            this.removeFeedabackFromQueue(message);   
        }, feedbackTimeOut, message);
        var feeback = {
            id: topicSufix,
            timerId: timerId,
            message: message
        }
        this.feedbackQueue.push(feeback);
    }

    removeFeedabackFromQueue(message){         
        var topicSufix = messageUtils.getTopicSufix(message.topic);
        var feedback = _.remove(this.feedbackQueue, (element)=>element.id == topicSufix);       
        if(feedback[0]){
            clearTimeout(feedback[0].timerId);                
            return feedback[0];
        }                   
    }

    printFeedbackQueue(){
        var feedbackQueueCopy = this.feedbackQueue.map((element)=>{
            return{
                id:element.id,
                message: element.message
            };
        });
        console.log(JSON.stringify( feedbackQueueCopy,undefined,2));
    }

    startReceiving(){
        eventEmitter.on(this.mac, (message) => {
        
            var feedback =this.removeFeedabackFromQueue(message);
            if(feedback){
                this.emitMessageSuccessEvent(message,feedback.message);
            }else{
                this.emitMessageSuccessEvent(message,null);
            }
           
            
            switch(message.topic){
                case messageUtils.productToServerActiveTopic(this.mac):                    
                    this.setActive(message.data);
                    
                break;
                case messageUtils.productToServerCommandFeedbackTopic(this.mac):                    
                    this.setLed(message.data);

                break;
                case messageUtils.productToServerRequestLedStatusReplyTopic(this.mac):                    
                    this.setLed(message.data);

                break;
                case messageUtils.productToServerRequestFirmwareInfoReplyTopic(this.mac):                    
                    this.setFirmware(message.data);

                break;
                case messageUtils.productToServerRequestStatusInfoReplyTopic(this.mac):                    
                    this.setStatus(message.data);

                break;
                case messageUtils.productToServerRequestNetworkInfoReplyTopic(this.mac):                    
                    this.setNetwork(message.data);

                break;
                case messageUtils.productToServerRequestGlobalInfoReplyTopic(this.mac):                   
                    this.setGlobal(message.data);

                break;
                case messageUtils.productToServerFirmwareUpdateReplyTopic(this.mac):
                    console.log(`Firmware Update Reply Message: `);                   
                break;
                default:
                    console.log(`Unknowm Message:`);  
            }
        });
    }


    
        

    setId (id) {               
        this.id = id;
        this.emitWriteFileEvent();                
        return this;          
    };

    setLed (led) {
        var result = Joi.validate(led, ledSchema);        
        if(result.error===null){           
            this.led = led;
            return this;           
        }
    };
    
    setFirmware (firmware) {       
        this.firmware = firmware;
        return this;        
    };
    
    setStatus (status) {
        this.status = status;
        return this;        
    };
    
    setNetwork (network) {
        this.network = network;
        return this;               
    };
    setGlobal(global) {//not fastest because has to look up for the product 5 times but easier
        if(global.led){
            this.setLed(global.led);
        }
        if(global.firmware){
            this.setFirmware(global.firmware);
        }
        if(global.status){
            this.setStatus(global.status);
        }
        if(global.network){
            this.setNetwork(global.network);
        }  
        return this;         
    };

    setActive(active){       
        var result = Joi.validate(active, Joi.string().valid('on','off').required());             
        if(result.error===null){         
            if(this.active){
                this.active=active; 
                if(this.isActive()){  
                    this.emitConnetEvent(this);
                }else{
                    this.emitDisconnetEvent(this);
                }   
            }else{
                this.active=active; 
            }       
            return this;           
        }
    };
    
    isActive(){                
        if(this.active==='on'){
            return true;
        }else if(this.active==='off'){
            return false;
        }        
    };

    sendLedCommandParameters(yellow, green) {
        var messageObj={
            yellow,
            green,
        };                  

        if(messageUtils.isLedMessageValid(messageObj)){            
            var topic = messageUtils.serverToProductCommandTopic(this.mac);
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj)
            }             
            eventEmitter.emit('PublishMessage', message);
            this.putFeedbackOnQueue(message);
            return message;                         
        }
    };

    sendLedCommandObj(messageObj) {        
        if(messageUtils.isLedMessageValid(messageObj)){                         
            var topic = messageUtils.serverToProductCommandTopic(this.mac);                
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj)
            }             
            eventEmitter.emit('PublishMessage', message);
            this.putFeedbackOnQueue(message);
            return message;            
        }
    };

    sendFirmwareUpdate(messageObj) {
        if(messageUtils.isFirmwareUpdateMessageValid(messageObj)){            
            var topic = messageUtils.serverToProductFirmwareUpdateTopic(this.mac);
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj)
            }             
            eventEmitter.emit('PublishMessage', message);
            this.putFeedbackOnQueue(message);
            //mqttUtils.publishMqttMessage(topic,JSON.stringify(messageObj));
            return message;            
        }
    };

    requestLedStatus(){        
        var topic = messageUtils.serverToProductRequestLedStatusTopic(this.mac);            
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        }         
        eventEmitter.emit('PublishMessage', message); 
        this.putFeedbackOnQueue(message);
        return message;         
    }

    requestFirmwareInfo(){        
        var topic = messageUtils.serverToProductRequestFirmwareInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        }
        eventEmitter.emit('PublishMessage', message);
        this.putFeedbackOnQueue(message);
        return message;        
    }

    requestStatusInfo(){    
        var topic = messageUtils.serverToProductRequestStatusInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        }
       
        eventEmitter.emit('PublishMessage', message);
        this.putFeedbackOnQueue(message);
        return message;         
    }

    requestNetworkInfo(){        
        var topic = messageUtils.serverToProductRequestNetworkInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        } 
        
        eventEmitter.emit('PublishMessage', message);
        this.putFeedbackOnQueue(message);
        return message;        
    }

    requestGlobalInfo(){        
        var topic = messageUtils.serverToProductRequestGlobalInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        }        
        eventEmitter.emit('PublishMessage', message); 
        this.putFeedbackOnQueue(message);
        return message;        
    }

    /* command(command){
        if(command.type){
            switch(command.type){
              case 'reqLed':              
                var result = this.requestLedStatus();
                if (result) {
                
                } else {
                console.log(`Message was not sent.`);
                emitFeedback('Product not found', null, command);
                }
                      
              break;
              case 'comLed':
                var product =  products.getProduct(command.mac);
                if(product){
                  var result = product.sendLedCommandObj(command.data);
                  if (result) {
                    console.log(`Message was sent:`);
                    mqttUtils.printMessage(result.topic, result.message);
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
                    mqttUtils.printMessage(result.topic, result.message);
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
                  mqttUtils.printMessage(result.topic, result.message);
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
                  mqttUtils.printMessage(result.topic, result.message);
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
                  mqttUtils.printMessage(result.topic, result.message);
                } else {
                  console.log(`Message not sent.`);
                  emitFeedback('Product not found.', null, command);
                }
              }
              break;
              default:
                emitFeedback('Command unknown.', null, command);
                console.log(`Trying to send Unknown Message:`);
                mqttUtils.printMessage(result.topic, result.message); 
        
            }
          }
    }
     */
}



module.exports = {Product};