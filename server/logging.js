'use strict';
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');
const logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const resultsFilename = path.join(logDir, 'results.log');
const exceptionFilename = path.join(logDir, 'exceptions.log');



const logger = createLogger({
    level: 'debug',
    exitOnError: false,    
    format: format.combine(
     // format.colorize(), 
           
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss:SSS'
      }),
      //myFormat
      format.printf(info => `${info.timestamp}-${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.Console({
          level: 'debug',
          handleExceptions: true,
          humanReadableUnhandledException: true,
          format: format.combine(
             format.colorize(), 
                  
             format.timestamp({
               format: 'YYYY-MM-DD HH:mm:ss:SSS'
             }),
             //myFormat
             format.printf(info => `${info.timestamp}-${info.level}: ${info.message}`)
           )
            

          
        }),
        new transports.File({ 
            filename: resultsFilename,
            level: 'debug',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            maxsize: 10485760, //10MB
            maxFiles: 10,
            format: format.combine(
                //format.colorize(), 
                     
                format.timestamp({
                  format: 'YYYY-MM-DD HH:mm:ss:SSS'
                }),
                //myFormat
                format.printf(info => `${info.timestamp}-${info.level}: ${info.message}`)
              )
            

        })
      ],
      exceptionHandlers: [
        new transports.File({ 
            filename: exceptionFilename,
            humanReadableUnhandledException: true 
        })
      ]
  });
/* logger.info('Hello world');
logger.warn('Warning message');
console.log('hahaha');
logger.debug('trying label','Debugging info');
setTimeout(function() {
    logger.debug('Debugging info 2');
}, 300); */
class Logging {
    constructor () {

    }
    logSendSocketCommand(command){
        var message = `WebPage Sending Socket Command->Type:Command|Command:${JSON.stringify(command)}`;
        logger.info(message);
    }
    logSendSocketInforequest(info){
        var message = `WebPage Sending Socket InfoRequest->Type:infoRequest|InfoRequest:${JSON.stringify(info)}`;
        logger.info(message);
    }
    logProductReceivedCommand(command){
        var message = `Product Received Command-> Command:${JSON.stringify(command)}`;
        logger.info(message);
    }
    logEmmitEvent(fileName, eventType, data){
        var message = `Emmitting Internal Event-> File:${fileName}|Type:${eventType}|Data:${JSON.stringify(data)}`;
        logger.info(message);
    }
    logReceiveEvent(fileName, eventType, data){
        var message = `Receiving Internal Event-> File:${fileName}|Type:${eventType}|Data:${JSON.stringify(data)}`;
        logger.info(message);
    }
    logInternalReceiveCommandFeedbackEvent(error,sendInfo,product){
        var message = `Receiving Internal Event-> Type:commandFeedback|Error:${error}|SendInfo:${JSON.stringify(sendInfo)}|Product:${JSON.stringify(product)}`;
        logger.info(message);
    }
    logInternalEmmitCommandFeedbackEvent(error,sendInfo,response){
        var message = `Emmiting Internal Event-> Type:commandFeedback|Error:${error}|SendInfo:${JSON.stringify(sendInfo)}|Response:${JSON.stringify(response)}`;
        logger.info(message);
    }
    logInternalReceiveRequestInfoFeedbackEvent(error, infoRequest, feedback){
        var message = `Receiving Internal Event-> Type:infoRequestFeedback|Error:${error}|InfoRequest:${JSON.stringify(infoRequest)}|Feedback:${JSON.stringify(feedback)}`;
        logger.info(message);
    }
    
    logInternalEmmitInfoRequestFeedbackEvent(error, infoRequest, feedback){
        var message = `Emmitting Internal Event-> Type:infoRequestFeedback|Error:${error}|InfoRequest:${JSON.stringify(infoRequest)}|Feedback:${JSON.stringify(feedback)}`;
        logger.info(message);
    }

    logSocketEmitCommandFeedback(error, command, response){
        var message = `Emmiting Socket Event-> Type:commandFeedback|Error:${error}|Command:${JSON.stringify(command)}|Response:${JSON.stringify(response)}`;
        logger.info(message);
    }
   

    logSocketEmitInfoFeedback(error, infoRequest, response){
        var message = `Emmiting Socket Event-> Type:infoRequestFeedback|Error:${error}|InfoRequest:${JSON.stringify(infoRequest)}|Response:${JSON.stringify(response)}`;
        logger.info(message);
    }    
    
    logReceiveSocketEvent(eventType, data, ip){
        var message = `Receiving Socket Event-> IP:${ip} Type:${eventType}|Data:${JSON.stringify(data)}`;
        logger.info(message);
    }
    logEmmitSocketEvent(eventType, data){
        var message = `Emmitting Socket Event-> Type:${eventType}|Data:${JSON.stringify(data)}`;
        logger.info(message);
    }

    logReceiveMqttMessage(brokerVersion,mac,topic,message){
        var message = `Received MQTT Message -> Broker:${brokerVersion}|MAC:${mac}|Topic:${topic}|Message:${JSON.stringify(message)}`;
        logger.info(message);
    }
    logPublishMqttMessage(brokerVersion,topic,data,retain){
        var message = `Publish MQTT Message-> Broker:${brokerVersion}|Retain:${retain}|Topic:${topic}|Message:${JSON.stringify(data)}`;
        logger.info(message);
    }
       
    logMessageInfo(message){
        logger.info(message);
    }

    logApplicationStart(){
        var message = `------------Aplication Starting-----------`;
        logger.info(message);
    }
    
}
module.exports = {Logging};