const mqtt = require('mqtt');
const {MessageUtils} = require('./message-utils');
const eventEmitter = require('./event-emitter');
const {Product} = require('./product');
//const {Products} = require('./products');
var moment = require('moment');
var fs = require('fs');
const {Logging} =  require('./logging');
var logs = new Logging();



var messageUtils =new MessageUtils();

class MqttUtils {
    constructor(){
        //this.products = products;
         var CAfileV3 = [fs.readFileSync(__dirname +'/../server/ca.crt')];
         
         //var CAfile = [process.env.CA_CERT];
         var optionsV3 = {
            host: 'araujoapp.com.br',
            port: 7710,
            protocol: 'mqtts',           
            //ca: CAfileV3,   
            //clientId: 'Local_test', 
            clientId: 'Araujo_Prod_Server',            
            username: process.env.MQTT_USERNAME,            
            password:process.env.MQTT_PASSWORD, 
            rejectUnauthorized: false                      
        }; 

        this.mqttClientV3 = mqtt.connect(optionsV3);
        this.mqttClientV3.on('connect', () => {
            this.mqttClientV3.subscribe(messageUtils.receiveAllTopic ());
            this.mqttClientV3.subscribe(messageUtils.receiveActiveTopic ());  
            //console.log("Broker V3: Conectou aqui!!");
            logs.logMessageInfo('Conectou no Broker V3.');

        });

        this.mqttClientV3.on('message', (topic, data) => {
            var stringData=data.toString().replace(/\0/g, "");//removes null character           
            var objData;
            try {
                objData = JSON.parse(stringData);
                //console.log(`converted message:${objData}`);
            } catch (e) {
                objData = stringData;
                //console.log(`catch error message:${objData}`);
            }
            logs.logReceiveMqttMessage('V3',messageUtils.getMacFromTopic(topic),topic,objData);
            //logReceiveMqttMessage(brokerVersion,mac,topic,message){
            //console.log(` `);
            //console.log(`Received MQTT message V3 :`);  
            //messageUtils.printMessage(topic,objData);  
            
            
            var topicMac = messageUtils.getMacFromTopic(topic);
            if(eventEmitter.listenerCount(topicMac)==0){
                eventEmitter.emit('newProductMessage',topicMac); 
                logs.logEmmitEvent('mqtt-utils','newProductMessage',topicMac);               
            }            
            var message={
                mac:topicMac,
                topic: topic,
                data:objData, 
                timestamp: moment().format('HH:mm:SSS'),
                brokerVersion:3
            }
            eventEmitter.emit(message.mac,message);
            logs.logEmmitEvent('mqtt-utils',message.mac,message);           
        }); 

        eventEmitter.on('PublishMessage3', (message) => {
            logs.logReceiveEvent('mqtt-utils','PublishMessage3',message);
            //console.log(`Publishing Message V3:`);
            
            //messageUtils.printMessage(message.topic, message.data);            
             
            if(message.retain==true){
                this.mqttClientV3.publish(message.topic, message.data,{ qos: 2, retain: false } );
 
	          logs.logPublishMqttMessage('V3',message.topic,message.data,false);
            }else{
                this.mqttClientV3.publish(message.topic, message.data, { qos: 2 } );
                logs.logPublishMqttMessage('V3',message.topic,message.data,false);
            }            
        });


        var CAfileV2 = [fs.readFileSync(__dirname +'/../server/ca.crt')];
          var optionsV2 = {
            host: 'homolog.araujoapp.com.br',
            port: 7710,
            protocol: 'mqtts',           
            ca: CAfileV2,   
            //clientId: 'Local_test', 
            clientId: 'Araujo_Prod_Server',            
            username: process.env.MQTT_USERNAME,
            password:process.env.MQTT_PASSWORD,             
            rejectUnauthorized: true                      
        }; 

        this.mqttClientV2 = mqtt.connect(optionsV2);
        this.mqttClientV2.on('connect', () => {
            this.mqttClientV2.subscribe(messageUtils.receiveAllTopic ());
            this.mqttClientV2.subscribe(messageUtils.receiveActiveTopic ());  
            //console.log("Broker V2: Conectou aqui!!");
            logs.logMessageInfo('Conectou no Broker V2.');

        });

        this.mqttClientV2.on('message', (topic, data) => {
            var stringData=data.toString().replace(/\0/g, "");//removes null character           
            var objData;
            try {
                objData = JSON.parse(stringData);
                //console.log(`converted message:${objData}`);
            } catch (e) {
                objData = stringData;
                //console.log(`catch error message:${objData}`);
            }
            logs.logReceiveMqttMessage('V2',messageUtils.getMacFromTopic(topic),topic,objData);
            //console.log(` `);
            //console.log(`Received MQTT message V2 :`);  
            //messageUtils.printMessage(topic,objData);                  
            
            var topicMac = messageUtils.getMacFromTopic(topic);
            if(eventEmitter.listenerCount(topicMac)==0){
                eventEmitter.emit('newProductMessage',topicMac);   
                logs.logEmmitEvent('mqtt-utils','newProductMessage',topicMac);             
            }            
            var message={
                mac:topicMac,
                topic: topic,
                data:objData, 
                timestamp: moment().format('HH:mm:SSS'),
                brokerVersion:2
            }
            eventEmitter.emit(message.mac,message);
            logs.logEmmitEvent('mqtt-utils',message.mac,message);
                       
        }); 

        eventEmitter.on('PublishMessage2', (message) => {
            logs.logReceiveEvent('mqtt-utils','PublishMessage2',message);
            //console.log(`Publishing Message V2:`);
            //messageUtils.printMessage(message.topic, message.data);            
             
            if(message.retain==true){
                this.mqttClientV2.publish(message.topic, message.data,{ qos: 2, retain: false } );
                logs.logPublishMqttMessage('V2',message.topic,message.data,false);
            }else{
                this.mqttClientV2.publish(message.topic, message.data, { qos: 2 } );
                logs.logPublishMqttMessage('V2',message.topic,message.data,false);
            }            
        }); 


 
         this.mqttClientV1 = mqtt.connect('mqtt://broker.hivemq.com');
        this.mqttClientV1.on('connect', () => {
            this.mqttClientV1.subscribe(messageUtils.receiveAllTopic ());
            this.mqttClientV1.subscribe(messageUtils.receiveActiveTopic ());  
            logs.logMessageInfo('Conectou no Broker V1.');                     
        });

        this.mqttClientV1.on('message', (topic, data) => {
            var stringData=data.toString().replace(/\0/g, "");//removes null character           
            var objData;
            try {
                objData = JSON.parse(stringData);
                //console.log(`converted message:${objData}`);
            } catch (e) {
                objData = stringData;
                //console.log(`catch error message:${objData}`);
            }
            logs.logReceiveMqttMessage('V1',messageUtils.getMacFromTopic(topic),topic,objData);
            //console.log(` `);
            //console.log(`Received MQTT message V1 :`);  
            //messageUtils.printMessage(topic,objData);                  
            
            var topicMac = messageUtils.getMacFromTopic(topic);
            if(eventEmitter.listenerCount(topicMac)==0){
                eventEmitter.emit('newProductMessage',topicMac);  
                logs.logEmmitEvent('mqtt-utils','newProductMessage',topicMac);              
            }            
            var message={
                mac:topicMac,
                topic: topic,
                data:objData, 
                timestamp: moment().format('HH:mm:SSS'),
                brokerVersion:1
            }
            eventEmitter.emit(message.mac,message);
            logs.logEmmitEvent('mqtt-utils',message.mac,message);
                       
        });
        
        eventEmitter.on('PublishMessage1', (message) => {
            logs.logReceiveEvent('mqtt-utils','PublishMessage1',message);
            //console.log(`Publishing Message V1:`);
            //messageUtils.printMessage(message.topic, message.data);            
             
            if(message.retain==true){
                this.mqttClientV1.publish(message.topic, message.data,{ qos: 2, retain: false } );
                logs.logPublishMqttMessage('V1',message.topic,message.data,false);
            }else{
                this.mqttClientV1.publish(message.topic, message.data, { qos: 2 } );
                logs.logPublishMqttMessage('V1',message.topic,message.data,false);
            }            
        });  
    }  
}

module.exports = {MqttUtils};
