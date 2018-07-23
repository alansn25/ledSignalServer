const mqtt = require('mqtt');
const {MessageUtils} = require('./message-utils');
const eventEmitter = require('./event-emitter');
const {Product} = require('./product');
var moment = require('moment');


var messageUtils =new MessageUtils();

class MqttUtils {
    constructor(){
        //this.products = products;
        this.mqttClient = mqtt.connect('mqtt://broker.hivemq.com');
        this.mqttClient.on('connect', () => {
            this.mqttClient.subscribe(messageUtils.receiveAllTopic ());
            this.mqttClient.subscribe(messageUtils.receiveActiveTopic ());                       
        });

        this.mqttClient.on('message', (topic, data) => {
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
                timestamp: moment().format('HH:mm:SSS')
            }
            eventEmitter.emit(message.mac,message);
                       
        });
        eventEmitter.on('PublishMessage', (message) => {
            console.log(`Publishing Message :`);
            messageUtils.printMessage(message.topic, message.data);
            //this.mqttClient.publish(message.topic, message.data,{ qos: 2, retain: true } );
            this.mqttClient.publish(message.topic, message.data );
            
        });   
    } 
}

module.exports = {MqttUtils};
