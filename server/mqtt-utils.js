const mqtt = require('mqtt');
const {MessageUtils} = require('./message-utils');
const eventEmitter = require('./event-emitter');
const {Product} = require('./product');
//const {Products} = require('./products');
var moment = require('moment');
var fs = require('fs');


var messageUtils =new MessageUtils();

class MqttUtils {
    constructor(){
        //this.products = products;
        var CAfile = [fs.readFileSync(__dirname +'/../server/ca.crt')];
         var options = {
            host: 'homolog.araujoapp.com.br',
            port: 7710,
            protocol: 'mqtts',           
            ca: CAfile,   
            clientId: 'Application_2507',            
            username: process.env.MQTT_USERNAME,
            password:process.env.MQTT_PASSWORD,                        
        }; 

        this.mqttClientV2 = mqtt.connect(options);
        this.mqttClientV2.on('connect', () => {
            this.mqttClientV2.subscribe(messageUtils.receiveAllTopic ());
            this.mqttClientV2.subscribe(messageUtils.receiveActiveTopic ());                       
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
            console.log(` `);
            console.log(`Received MQTT message :`);  
            messageUtils.printMessage(topic,objData);                  
            
            var topicMac = messageUtils.getMacFromTopic(topic);
            if(eventEmitter.listenerCount(topicMac)==0){
                eventEmitter.emit('newProductMessage',topicMac);                
            }            
            var message={
                mac:topicMac,
                topic: topic,
                data:objData, 
                timestamp: moment().format('HH:mm:SSS'),
                brokerVersion:2
            }
            eventEmitter.emit(message.mac,message);
                       
        }); 
        /* eventEmitter.on('PublishMessage', (message) => {
            console.log(`Publishing Message :`);
            messageUtils.printMessage(message.topic, message.data);
            

            
            if(message.retain==true){
                if(message.oldBroker === true){
                    this.mqttClientV1.publish(message.topic, message.data,{ qos: 2, retain: true } );
                }else{
                    this.mqttClientV2.publish(message.topic, message.data,{ qos: 2, retain: true } );
                }
                
            }else{
                if(message.oldBroker === true){
                    this.mqttClientV1.publish(message.topic, message.data, { qos: 2 } );
                }else{
                    this.mqttClientV2.publish(message.topic, message.data, { qos: 2 } );
                }                
            }            
        }); */
        eventEmitter.on('PublishMessage2', (message) => {
            console.log(`Publishing Message :`);
            messageUtils.printMessage(message.topic, message.data);            
             
            if(message.retain==true){
                this.mqttClientV2.publish(message.topic, message.data,{ qos: 2, retain: true } );
            }else{
                this.mqttClientV2.publish(message.topic, message.data, { qos: 2 } );
            }            
        });



        this.mqttClientV1 = mqtt.connect('mqtt://broker.hivemq.com');
        this.mqttClientV1.on('connect', () => {
            this.mqttClientV1.subscribe(messageUtils.receiveAllTopic ());
            this.mqttClientV1.subscribe(messageUtils.receiveActiveTopic ());                       
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
            console.log(` `);
            console.log(`Received MQTT message :`);  
            messageUtils.printMessage(topic,objData);                  
            
            var topicMac = messageUtils.getMacFromTopic(topic);
            if(eventEmitter.listenerCount(topicMac)==0){
                eventEmitter.emit('newProductMessage',topicMac);                
            }            
            var message={
                mac:topicMac,
                topic: topic,
                data:objData, 
                timestamp: moment().format('HH:mm:SSS'),
                brokerVersion:1
            }
            eventEmitter.emit(message.mac,message);
                       
        });
        
        eventEmitter.on('PublishMessage1', (message) => {
            console.log(`Publishing Message :`);
            messageUtils.printMessage(message.topic, message.data);            
             
            if(message.retain==true){
                this.mqttClientV1.publish(message.topic, message.data,{ qos: 2, retain: true } );
            }else{
                this.mqttClientV1.publish(message.topic, message.data, { qos: 2 } );
            }            
        }); 
    } 
}

module.exports = {MqttUtils};
