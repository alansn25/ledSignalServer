"use strict";
//const events = require('events');
const _ = require ('lodash');
const {MqttUtils} = require('./mqtt-utils');
const {MessageUtils} = require('./message-utils');
const eventEmitter = require('./event-emitter');
const Joi = require('joi');
const {Firmwares} = require('./firmwares');
const {Logging}=  require('./logging');
const path = require('path');

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
const logs = new Logging();
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
        //this.brokerVersion = {};
       
    }
    emitWriteFileEvent(){
        eventEmitter.emit('writeFile');
        logs.logEmmitEvent('product','writeFile', null);
    }
    emitConnetEvent(product){
        eventEmitter.emit('connect', product);
        logs.logEmmitEvent('product','connect', product);
    }
    emitDisconnetEvent(product){
        eventEmitter.emit('disconnect', product);
        logs.logEmmitEvent('product','disconnect', product);
    }
    emitFeedbackEvent(error, sendInfo, response){
        eventEmitter.emit('commandFeedback', error, sendInfo, response);
        logs.logInternalEmmitCommandFeedbackEvent(error,sendInfo,response);
    }
    /* emitMessageFailureEvent(error, message){
        eventEmitter.emit('MessageFailure', error, message);
    } */
    putFeedbackOnQueue(sendInfo){        
        var topicSufix=messageUtils.getTopicSufix(sendInfo.message.topic);
        //var timerId = {};
        
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
      /*   if(sendInfo.message.topic === messageUtils.serverToProductFirmwareUpdateTopic(this.mac)){
            var feeback = {
                id: topicSufix,
                timerId: null,
                sendInfo: sendInfo
            }
            this.feedbackQueue.push(feeback);
        } */
    }
   /*  executeTimeOut(sendInfo){
        this.removeFeedabackFromQueue(sendInfo.message);  
        this.emitFeedbackEvent('Time Out', sendInfo, this );
    } */
    removeFeedabackFromQueue(message){         
        if(this.feedbackQueue.length>0){
            var topicSufix = messageUtils.getTopicSufix(message.topic);
            var feedback = _.remove(this.feedbackQueue, (element)=>element.id == topicSufix);       
            //if(feedback.length>1){
            if(feedback[0]){                    
                clearTimeout(feedback[0].timerId);                                                
                return feedback[0];
            }
            //}
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
    setBrokerVersion(brokerVersionParam){
        this.brokerVersion = brokerVersionParam;
    }
    startReceiving(){
        eventEmitter.on(this.mac, (message) => {
            logs.logReceiveEvent('product',this.mac, message);
            var feedback = this.removeFeedabackFromQueue(message);
            var error=null;
            var isUpdateMessage = false;
            
            
            switch(message.topic){
                case messageUtils.productToServerActiveTopic(this.mac):                    
                   
                    //this.setActive(message.data);

                    if(this.isActive(message.data)===true){
                        this.setActive(message.data);
                        if(message.hasOwnProperty('brokerVersion')===true){
                            //this.setBrokerVersion(message.brokerVersion);
                            this.brokerVersion = message.brokerVersion;
                        }
                       this.requestGlobalInfo();
                    }else if(this.isActive(message.data)===false){
                        if(message.hasOwnProperty('brokerVersion')===true){
                           if(this.hasOwnProperty('brokerVersion')===true){
                                if(this.brokerVersion == message.brokerVersion){
                                    this.setActive(message.data);
                                }
                           }else{
                                this.setActive(message.data);
                           }
                        }
                    }
                    /* if(this.isActive()===true){
                        if(message.hasOwnProperty('brokerVersion')===true){
                            //this.setBrokerVersion(message.brokerVersion);
                            this.brokerVersion = message.brokerVersion;
                        }
                       this.requestGlobalInfo();
                    } */
                    
                break;
                case messageUtils.productToServerCommandFeedbackTopic(this.mac):                    
                   
                    if(message.hasOwnProperty('brokerVersion')){
                        this.brokerVersion = message.brokerVersion;
                    }
                    this.setLed(message.data);

                break;
                case messageUtils.productToServerRequestLedStatusReplyTopic(this.mac):                    
                   
                    if(message.hasOwnProperty('brokerVersion')===true){
                        this.brokerVersion = message.brokerVersion;
                    }
                    this.setLed(message.data);

                break;
                case messageUtils.productToServerRequestFirmwareInfoReplyTopic(this.mac):                    
                    
                    if(message.hasOwnProperty('brokerVersion')===true){
                        this.brokerVersion = message.brokerVersion;
                    }
                    this.setFirmware(message.data);

                break;
                case messageUtils.productToServerRequestStatusInfoReplyTopic(this.mac):                    
                    
                    if(message.hasOwnProperty('brokerVersion')===true){
                        this.brokerVersion = message.brokerVersion;
                    }
                    this.setStatus(message.data);
                break;
                case messageUtils.productToServerRequestNetworkInfoReplyTopic(this.mac):                    
                    
                    if(message.hasOwnProperty('brokerVersion')===true){
                        this.brokerVersion = message.brokerVersion;
                    }
                    this.setNetwork(message.data);
                break;
                case messageUtils.productToServerRequestGlobalInfoReplyTopic(this.mac):                   
                    
                    if(message.hasOwnProperty('brokerVersion')===true){
                        this.brokerVersion = message.brokerVersion;
                    }
                    this.setGlobal(message.data);
                break;
                case messageUtils.productToServerFirmwareUpdateReplyTopic(this.mac):
                    console.log(`Firmware Update Reply Message: `);    
                    isUpdateMessage = true;               
                break;
                case messageUtils.productToServerPairStaticIpReplyTopic(this.mac):
                    console.log(`Firmware Update Reply Message: `);    
                    this.setNetwork(message.data);               
                break;
                
                default:
                    error=`Unknown Message:`;  
            }

            if(feedback){
                if(isUpdateMessage === false){
                    this.emitFeedbackEvent(error, feedback.sendInfo, this);
                }else{
                    message.data.mac = this.mac;
                    this.emitFeedbackEvent(error, feedback.sendInfo, message.data);
                }                
            }else if(isUpdateMessage === true){
                message.data.mac = this.mac;
                this.emitFeedbackEvent(error, null, message.data);
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
                    if(this.isActive()===true){  
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
    
    isActive(data=null){                
        var parameterToCheck;
        if(data===null){
            parameterToCheck=this.active;
        }else{
            parameterToCheck=data;
        }             
        if( parameterToCheck==='on'){
            return true;
        }else if( parameterToCheck==='off'){
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
        }else{
            this.requestGlobalInfo();
        }
    }

    

    sendPublishMessageEvent(message){
        if(this.hasOwnProperty('brokerVersion')===true){
            eventEmitter.emit(`PublishMessage${this.brokerVersion}`, message);
            logs.logEmmitEvent('product',`PublishMessage${this.brokerVersion}`, message);
        }else{
            eventEmitter.emit('PublishMessage1', message);
            logs.logEmmitEvent('product','PublishMessage1', message);
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
            
        if(messageUtils.isLedMessageValid(messageObj)===true){
                    
            var topic = messageUtils.serverToProductCommandTopic(this.mac);
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj),
                retain: true                
            };  
            var sendInfo = {
                message,
                command
            };            
            this.sendPublishMessageEvent(message);
            if(command!=null){
                this.putFeedbackOnQueue(sendInfo);
            }
            //this.putFeedbackOnQueue(sendInfo);
            return message;                         
        }
    };

    sendLedCommandObj(messageObj, command=null) {        
        var result = {};
        if(messageUtils.isLedMessageValid(messageObj)===true){
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
                    if(messageObj.led1 == 'flash'){
                        return undefined;
                    }
                    messageObj.green = messageObj.led1;               
                    delete messageObj.led1;
                }
                if(messageObj.hasOwnProperty('led2')){ 
                    if(messageObj.led2 == 'flash'){
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
            };             
            var sendInfo = {
                message,
                command
            };            
            this.sendPublishMessageEvent(message);
            if(command!=null){
                this.putFeedbackOnQueue(sendInfo);
            }
            result.error = null;
            result.data = message;           
        }else{
            result.error = "The led message is not valid"
        }
        return result;
    };

    sendFirmwareUpdate(messageObj, command=null) {
        var result = {};
        if(messageUtils.isFirmwareUpdateMessageValid(messageObj)===true){            
            var topic = messageUtils.serverToProductFirmwareUpdateTopic(this.mac);
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj)               
            }; 
            var sendInfo = {
                message,
                command
            };             
            this.sendPublishMessageEvent(message);
            if(command!=null){
                this.putFeedbackOnQueue(sendInfo);
            }
           // this.putFeedbackOnQueue(sendInfo);
            //mqttUtils.publishMqttMessage(topic,JSON.stringify(messageObj));
             
            result.error = null;
            result.data = message;           
        }else{
            result.error = "The update message is not valid."  
        }
        return result;
    };
    //{"type":"pairStatic","id":"p2","data":{"ssid":"bruna","password":"assasasasas", "ip":"192.168.1.1","mask":"255.255.255.0","gw":"192.168.1.1" }}
    sendPairStaticIp(messageObj, command=null) {
        var result = {};
        if(messageUtils.isPairStaticIpMessageValid(messageObj)===true){            
            var topic = messageUtils.serverToProductPairStaticIpTopic(this.mac);
            var message = {
                mac: this.mac,
                topic: topic,
                data: JSON.stringify(messageObj)               
            }; 
            var sendInfo = {
                message,
                command
            };             
            this.sendPublishMessageEvent(message);
            if(command!=null){
                this.putFeedbackOnQueue(sendInfo);
            }
           // this.putFeedbackOnQueue(sendInfo);
            //mqttUtils.publishMqttMessage(topic,JSON.stringify(messageObj));
            result.error = null;
            result.data = message;           
        }else{
            result.error = "The pair static IP message is not valid."
        }
        return result;
    };

    

    requestLedStatus(command=null){        
        var result = {};
        var topic = messageUtils.serverToProductRequestLedStatusTopic(this.mac);            
        
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                                  
        };     
        var sendInfo = {
            message,
            command
        };    
        this.sendPublishMessageEvent(message); 
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        //this.putFeedbackOnQueue(sendInfo);
        result.error = null;
        result.data = message;
        return result;         
    }

    

    requestFirmwareInfo(command=null){  
        var result = {};      
        var topic = messageUtils.serverToProductRequestFirmwareInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                        
        }
        var sendInfo = {
            message,
            command
        };  
        this.sendPublishMessageEvent(message);
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        result.error = null;
        result.data = message;
        return result;        
    }

    requestStatusInfo(command=null){ 
        var result = {};   
        var topic = messageUtils.serverToProductRequestStatusInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''
                            
        };
        var sendInfo = {
            message,
            command
        };  
       
        this.sendPublishMessageEvent(message);
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        result.error = null;
        result.data = message;
        return result;         
    }

    requestNetworkInfo(command=null){
        var result = {};        
        var topic = messageUtils.serverToProductRequestNetworkInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                         
        };
        var sendInfo = {
            message,
            command
        };  
        this.sendPublishMessageEvent(message);
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        result.error = null;
        result.data = message;
        return result;        
    }

    requestGlobalInfo(command=null){  
        var result = {};      
        var topic = messageUtils.serverToProductRequestGlobalInfoTopic(this.mac);
        var message = {
            mac: this.mac,
            topic: topic,
            data:''                          
        };
        var sendInfo = {
            message,
            command
        };       
        this.sendPublishMessageEvent(message); 
        if(command!=null){
            this.putFeedbackOnQueue(sendInfo);
        }
        result.error = null;
        result.data = message;
        return result;        
    }

    updateFirmware(command = null){
        var firmware; 
        var result = {};
        var firmwares = new Firmwares();
        if((command===null)||(!!command.data===false)){            
            firmware = firmwares.getLastFirmware();
        }else if(process.env.PORT){
            firmware = firmwares.getFirmware(command.data);
        }        
        if(firmware.error === null){
            var firmwareCopy = Object.assign({}, firmware.result);
            delete firmwareCopy.version;
            var localResult = this.sendFirmwareUpdate(firmwareCopy, command);
            if (localResult.error === null) {
                result.error = null;
                result.data = localResult.data;                
            } else {
                console.log(`Message not sent.`);
                result.error = `Could not send the update command: ${localResult.error}`;
            }
        }else{
            result.error = `Could not get the Firmware to update: ${firmware.error}`; 
        }
        return result;
    }
    
    command(command){
        logs.logProductReceivedCommand(command);
        var result = {};
        if(command.type){
            switch(command.type){
              case 'reqLed':              
                var localResult = this.requestLedStatus(command);
                if (localResult.error === null) {
                   // emitFeedback('Product not found', null, command);
                   result.error = null;
                   result.data = localResult.data;                   
                } else {
                    console.log(`Message was not sent.`);
                    result.error = `Could not Resquest Led Status: ${localResult.error}`;                   
                }
                //return result;
              break;
              case 'comLed':                   
                  var localResult = this.sendLedCommandObj(command.data, command);
                  if (localResult.error === null) {
                     result.error = null;
                     result.data = localResult.data;                   
                  } else {
                    console.log(`Message not sent.`);
                    result.error = `Could not send Led command: ${localResult.error}`;
                  }
                  //return result;
                
                
              break;
              case 'reqFirmware':               
                  var localResult = this.requestFirmwareInfo(command);
                  if (localResult.error === null) {
                    result.error = null;
                    result.data = localResult.data;                    
                  } else {
                    console.log(`Message not sent.`);
                    result.error = `Could not request Firmware Info: ${localResult.error}`;
                  }
                  //return result;
                
              break;
              case 'reqNetwork':                         
                  var localResult = this.requestNetworkInfo(command);
                if (localResult.error === null) {
                    result.error = null;
                    result.data = localResult.data;                  
                } else {
                  console.log(`Message not sent.`);
                  result.error = `Could not request Network Info: ${localResult.error}`;
                }
                //return result;
              break;
              case 'reqStatus':
                  var localResult = this.requestStatusInfo(command);
                if (localResult.error === null) {
                    result.error = null;
                    result.data = localResult.data;                  
                } else {
                  console.log(`Message not sent.`);
                  result.error = `Could not request Status Info: ${localResult.error}`;
                }
                //return result;
              break;
              case 'reqGlobal':
                    var localResult = this.requestGlobalInfo(command);
                    if (localResult.error === null) {
                        result.error = null;
                        result.data = localResult.data;                  
                    } else {
                        console.log(`Message not sent.`);
                        result.error = `Could not request Global Info: ${localResult.error}`;
                    }
                    //return result;
              break;
               case 'pairStatic':
                    var localResult = this.sendPairStaticIp(command.data, command);
                    if (localResult.error === null) {
                        result.error = null;
                        result.data = localResult.data;                  
                    } else {
                        console.log(`Message not sent.`);
                        result.error = `Could not send pair Static IP message: ${localResult.error}`;
                    }
                     //return result;              
              break;
              case 'update':
                var localResult = this.updateFirmware(command);
                if (localResult.error === null) {
                    result.error = null;
                    result.data = localResult.data;                  
                } else {
                    console.log(`Message not sent.`);
                    result.error = `Could not update the firmware: ${localResult.error}`;
                }                
                //return result;
              break;
              default:
                //emitFeedback('Command unknown.', null, command);
                console.log(`Trying to send Unknown Message:`);
                result.error = "command.type is unknown."
                    
            }
        }else{
            result.error = 'The command.type was not defined.'
        }
        return result;
    }
     
}



module.exports = {Product};