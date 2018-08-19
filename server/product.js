"use strict";
//const events = require('events');
const _ = require ('lodash');
const {MqttUtils} = require('./mqtt-utils');
const {MessageUtils} = require('./message-utils');
const eventEmitter = require('./event-emitter');
const Joi = require('joi');
const {Firmwares} = require('./firmwares');

const feedbackTimeOut = 5000;
const ledSchema = Joi.object().keys({    
    led1: Joi.string().required().valid('on','off', 'flash'),
    led2: Joi.string().required().valid('on','off', 'flash')
});
const ledSchemaOld = Joi.object().keys({    
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
    emitFeedbackEvent(error, sendInfo, response){
        eventEmitter.emit('commandFeedback', error, sendInfo, response);
    }
    /* emitMessageFailureEvent(error, message){
        eventEmitter.emit('MessageFailure', error, message);
    } */
    putFeedbackOnQueue(sendInfo){        
        var topicSufix=messageUtils.getTopicSufix(sendInfo.message.topic);
        var timerId = setTimeout(() => {           
            this.removeFeedabackFromQueue(sendInfo.message);  
            this.emitFeedbackEvent('Time Out', sendInfo, this );             
        }, feedbackTimeOut, sendInfo);
        //var timerId = setTimeout(this.executeTimeOut.bind(this,sendInfo),feedbackTimeOut);
        var feeback = {
            id: topicSufix,
            timerId: timerId,
            sendInfo: sendInfo
        }
        this.feedbackQueue.push(feeback);
    }
   /*  executeTimeOut(sendInfo){
        this.removeFeedabackFromQueue(sendInfo.message);  
        this.emitFeedbackEvent('Time Out', sendInfo, this );
    } */
    removeFeedabackFromQueue(message){         
        if(this.feedbackQueue.length>0){
            var topicSufix = messageUtils.getTopicSufix(message.topic);
            var feedback = _.remove(this.feedbackQueue, (element)=>element.id == topicSufix);       
            if(feedback[0]){
                clearTimeout(feedback[0].timerId);                
                return feedback[0];
            }
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
            var error=null;
           
            
            switch(message.topic){
                case messageUtils.productToServerActiveTopic(this.mac):                    
                   this.setActive(message.data);
                   if(this.isActive()){
                       this.requestGlobalInfo();
                   }
                    
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
                    error=`Unknowm Message:`;  
            }

            if(feedback){
                this.emitFeedbackEvent(error, feedback.sendInfo, this,);
            }/*else{
                this.emitFeedbackEvent(error, null, this);
            }*/
        });
    }


    update () {

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
        result = Joi.validate(led, ledSchemaOld);        
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
            if(this.hasOwnProperty('active')){
                var currentActive = this.active;
                if(currentActive!=active){
                    this.active=active; 
                    if(this.isActive()){  
                        this.emitConnetEvent(this);
                        //this.requestGlobalInfo();
                    }else{
                        this.emitDisconnetEvent(this);
                    } 
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
    isFirmwareDifferent(major, minor, revision){
        if(this.firmware){
            if(this.major != major){
                return true;
            }else{
                if(this.minor != minor){
                    return true;
                }else{
                    if(this.revision != revision){
                        return true;
                    }else{
                        return false;
                    }
                }
            }
        }else{
            return undefined;
        }

    }

    isProductUsingV2Protocol(){
        if(this.hasOwnProperty('led')){
            if(_.has(this, 'led.green')){
                return false;
            }else if(_.has(this, 'led.led1')){
                return true;
            }
        }
    }

    sendLedCommandParameters(yellow, green, command=null) {
        
        
        
        var messageObj;
        var usingV2protocol = this.isProductUsingV2Protocol();
    
        if(usingV2protocol === true){
            messageObj = {
                led1: green,
                led2: yellow
            };
        }else if(usingV2protocol === false){
            messageObj = {
                green,
                yellow
            };
        }else{
            this.requestLedStatus();
            //return undefined;
            messageObj = {
                led1: green,
                led2: yellow
            };
        }                         
            
        if(messageUtils.isLedMessageValid(messageObj)){
                    
            var topic = messageUtils.serverToProductCommandTopic(this.mac);
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj),
                retain: true
            }  
            var sendInfo = {
                message,
                command,
            }             
            eventEmitter.emit('PublishMessage', message);
            if(command!=null){
                this.putFeedbackOnQueue(sendInfo);
            }
            //this.putFeedbackOnQueue(sendInfo);
            return message;                         
        }
    };

    sendLedCommandObj(messageObj, command=null) {        
        if(messageUtils.isLedMessageValid(messageObj)){
            var topic = messageUtils.serverToProductCommandTopic(this.mac);
            var usingV2protocol = this.isProductUsingV2Protocol();
        
            if(usingV2protocol === true){
                if(messageObj.hasOwnProperty('green')){               
                    messageObj.led1 = messageObj.green;               
                    delete messageObj.green;
                }
                if(messageObj.hasOwnProperty('yellow')){               
                    messageObj.led2 = messageObj.yellow;               
                    delete messageObj.yellow;
                }
            }else if(usingV2protocol === false){
                if(messageObj.hasOwnProperty('led1')){               
                    if(messageObj.led1 = 'flash'){
                        return undefined;
                    }
                    messageObj.green = messageObj.led1;               
                    delete messageObj.led1;
                }
                if(messageObj.hasOwnProperty('led2')){ 
                    if(messageObj.led2 = 'flash'){
                        return undefined;
                    }              
                    messageObj.yellow = messageObj.led2;               
                    delete messageObj.led2;
                }
            }else{
                this.requestLedStatus();
                //return undefined;
                 if(messageObj.hasOwnProperty('green')){               
                    messageObj.led1= messageObj.green;               
                    delete messageObj.green;
                }
                if(messageObj.hasOwnProperty('yellow')){               
                    messageObj.led2= messageObj.yellow;               
                    delete messageObj.yellow;
                } 
            }                    
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj),
                retain: true
            }             
            var sendInfo = {
                message,
                command,
            }            
            eventEmitter.emit('PublishMessage', message);
            if(command!=null){
                this.putFeedbackOnQueue(sendInfo);
            }
            
            return message;            
        }
    };

    sendFirmwareUpdate(messageObj, command=null) {
        if(messageUtils.isFirmwareUpdateMessageValid(messageObj)){            
            var topic = messageUtils.serverToProductFirmwareUpdateTopic(this.mac);
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj)
            }  
            var sendInfo = {
                message,
                command,
            }             
            eventEmitter.emit('PublishMessage', message);
            if(command!=null){
                this.putFeedbackOnQueue(sendInfo);
            }
           // this.putFeedbackOnQueue(sendInfo);
            //mqttUtils.publishMqttMessage(topic,JSON.stringify(messageObj));
            return message;            
        }
    };

    

    requestLedStatus(command=null){        
        var topic = messageUtils.serverToProductRequestLedStatusTopic(this.mac);            
        
        var message = {
            mac: this.mac,
            topic: topic,
            data:'',                       
        }     
        var sendInfo = {
            message,
            command,
        }    
        eventEmitter.emit('PublishMessage', message); 
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        //this.putFeedbackOnQueue(sendInfo);
        return message;         
    }

    requestFirmwareInfo(command=null){        
        var topic = messageUtils.serverToProductRequestFirmwareInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        }
        var sendInfo = {
            message,
            command,
        }  
        eventEmitter.emit('PublishMessage', message);
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        return message;        
    }

    requestStatusInfo(command=null){    
        var topic = messageUtils.serverToProductRequestStatusInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        }
        var sendInfo = {
            message,
            command,
        }  
       
        eventEmitter.emit('PublishMessage', message);
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        return message;         
    }

    requestNetworkInfo(command=null){        
        var topic = messageUtils.serverToProductRequestNetworkInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        } 
        var sendInfo = {
            message,
            command,
        }  
        eventEmitter.emit('PublishMessage', message);
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        return message;        
    }

    requestGlobalInfo(command=null){        
        var topic = messageUtils.serverToProductRequestGlobalInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                
        }   
        var sendInfo = {
            message,
            command,
        }       
        eventEmitter.emit('PublishMessage', message); 
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        return message;        
    }

     command(command){
        if(command.type){
            switch(command.type){
              case 'reqLed':              
                var result = this.requestLedStatus(command);
                if (result) {
                   // emitFeedback('Product not found', null, command);
                   return result;
                } else {
                console.log(`Message was not sent.`);
                
                }
                      
              break;
              case 'comLed':                   
                  var result = this.sendLedCommandObj(command.data, command);
                  if (result) {
                    return result;
                  } else {
                    console.log(`Message not sent.`);
                   // emitFeedback('Product not found', null, command);
                  }
                
                
                
              break;
              case 'reqFirmware':               
                  var result = this.requestFirmwareInfo(command);
                  if (result) {
                    console.log(`Message was sent:`);
                    return result;
                  } else {
                    console.log(`Message not sent.`);
                    //emitFeedback('Product not found', null, command);
                  }
                
              break;
              case 'reqNetwork':                         
                  var result = this.requestNetworkInfo(command);
                if (result) {
                  console.log(`Message was sent:`);
                  return result;
                } else {
                  console.log(`Message not sent.`);
                  //emitFeedback('Product not found', null, command);
                }
              
              break;
              case 'reqStatus':
                  var result = this.requestStatusInfo(command);
                if (result) {
                  console.log(`Message was sent:`);
                  return result;
                } else {
                  console.log(`Message not sent.`);
                  //emitFeedback('Product not found', null, command);
                }
               
              break;
              case 'reqGlobal':
                  var result = this.requestGlobalInfo(command);
                if (result) {
                  console.log(`Message was sent:`);
                  return result;
                } else {
                  console.log(`Message not sent.`);
                  //emitFeedback('Product not found.', null, command);
                }
              
              break;
              case 'update':
                var firmwares = new Firmwares();
                var lastFirmware = firmwares.getLastFirmware();
                if(lastFirmware.error === null){
                    var firmwareCopy = Object.assign({}, lastFirmware);
                    delete firmwareCopy.version;
                    var result = this.sendFirmwareUpdate(firmwareCopy, command);
                    if (result) {
                        console.log(`Message was sent:`);
                        return result;
                      } else {
                        console.log(`Message not sent.`);
                        //emitFeedback('Product not found', null, command);
                      }
                }
               



                

                  /* var result = this.requestGlobalInfo(command);
                if (result) {
                  console.log(`Message was sent:`);
                  return result;
                } else {
                  console.log(`Message not sent.`);
                  //emitFeedback('Product not found.', null, command);
                } */
              
              break;
              default:
                //emitFeedback('Command unknown.', null, command);
                console.log(`Trying to send Unknown Message:`);
                    
            }
          }
    }
     
}



module.exports = {Product};