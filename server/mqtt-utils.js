const mqtt = require('mqtt');
const {Products} = require('./products');

const {MessageUtils} = require('./message-utils');
const eventEmitter = require('./event-emitter');


var messageUtils =new MessageUtils();
var topicPrefix;
if(process.env.NODE_ENV==='test'){
    topicPrefix = 'ledsig/test/';
}else{
    topicPrefix = 'ledsig/v1/';
}

class MqttUtils {
    constructor(products){
        this.products = products;
        this.mqttClient = mqtt.connect('mqtt://broker.hivemq.com');
        this.mqttClient.on('connect', () => {
            this.mqttClient.subscribe(messageUtils.receiveAllTopic ());
            this.mqttClient.subscribe(messageUtils.receiveActiveTopic ());
            //console.log(`Subscribed to ${this.receiveAllTopic}`);           
        });

        this.mqttClient.on('message', (topic, data) => {
            var stringData=data.toString().replace(/\0/g, "");//removes null character           
            var objData;
            try {
                objData = JSON.parse(stringData);
                console.log(`converted message:${objData}`);
            } catch (e) {
                objData = stringData;
                console.log(`catch error message:${objData}`);
            }
            console.log(`Received message:`);            
            this.printMessage(topic, objData);


            var topicMac = messageUtils.getMacFromTopic(topic);
            var message={
                mac:topicMac,
                topic: topic,
                data:objData 
            }
            eventEmitter.emit(message.mac,message);  
            
           // this.products.addProductByMac(mac);

            /* switch(topic){
                case this.productToServerActiveTopic(mac):
                    var product = this.handleReceiveActiveMessage (mac, objMessage);
                    products.printProduct(product);
                break;
                case this.productToServerCommandFeedbackTopic(mac):
                    this.handleReceiveCommandFeedbackMessage (mac, objMessage);
                break;
                case this.productToServerRequestLedStatusReplyTopic(mac):
                    this.handleReceiveLedStatusReplyMessage (mac, objMessage)
                break;
                case this.productToServerRequestFirmwareInfoReplyTopic(mac):
                    this.handleReceiveRequestFirmwareInfoReplyMessage (mac, objMessage);
                break;
                case this.productToServerRequestStatusInfoReplyTopic(mac):
                    this.handleReceiveRequestStatusInfoReplyMessage (mac, objMessage);
                break;
                case this.productToServerRequestNetworkInfoReplyTopic(mac):
                    this.handleReceiveRequestNetworkInfoReplyMessage (mac, objMessage);
                break;
                case this.productToServerRequestGlobalInfoReplyTopic(mac):
                    this.handleReceiveRequestGlobalInfoReplyMessage (mac, objMessage);
                break;
                case this.productToServerFirmwareUpdateReplyTopic(mac):
                    console.log(`Firmware Update Reply Message: `);
                    this.printMessage(topic, message);
                break;
                default:
                    console.log(`Unknowm Message:`);
                    
                    this.printMessage(topic, message);

            } */
        });
        eventEmitter.on('PublishMessage', (message) => {
            this.mqttClient.publish(message.topic, message.data);
        });        

    }
    
    


    

    

  
   
    
   
    
    



    /* publishMqttMessage (topic, message) {
        //console.log(`Message:${message}  Topic:${topic}`);
        this.mqttClient.publish(topic, message);   
    };

    getTopicSufix(topic){
        var topicArray=topic.split('/');
        topicArray = topicArray.slice(3);
        return topicArray.join('/');
    }
    receiveAllTopic () {
        return `${topicPrefix}+/lsig/#`;
    };
    receiveActiveTopic () {
        return `${topicPrefix}+/active/#`;
    };

    serverToProducGeneralTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/#`;
    };

    productToServerActiveTopic (macAddress) {
        return `${topicPrefix}${macAddress}/active`;
    };

    serverToProductCommandTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/cmd/led`;
    };

    productToServerCommandFeedbackTopic (macAddress) {
        return `${topicPrefix}${macAddress}/lsig/cmd/led`;
    };

    serverToProductRequestLedStatusTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/req/info/led`;
    };

    productToServerRequestLedStatusReplyTopic (macAddress) {
        return `${topicPrefix}${macAddress}/lsig/req/info/led`;
    };

    serverToProductRequestFirmwareInfoTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/req/info/firmware`;
    };

    productToServerRequestFirmwareInfoReplyTopic (macAddress) {
        return `${topicPrefix}${macAddress}/lsig/req/info/firmware`;
    };

    serverToProductRequestStatusInfoTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/req/info/status`;
    };

    productToServerRequestStatusInfoReplyTopic (macAddress) {
        return `${topicPrefix}${macAddress}/lsig/req/info/status`;
    };

    serverToProductRequestNetworkInfoTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/req/info/network`;
    };

    productToServerRequestNetworkInfoReplyTopic (macAddress) {
        return `${topicPrefix}${macAddress}/lsig/req/info/network`;
    };

    serverToProductRequestGlobalInfoTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/req/info/global`;
    };

    productToServerRequestGlobalInfoReplyTopic (macAddress) {
        return `${topicPrefix}${macAddress}/lsig/req/info/global`;
    };

    serverToProductFirmwareUpdateTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/cmd/update/start`;
    };

    productToServerFirmwareUpdateReplyTopic (macAddress) {
        return `${topicPrefix}${macAddress}/lsig/update/start`;
    };

    getMacFromTopic(topic) {
        var splittedTopic = topic.split('/');
        return splittedTopic[2];
    }; */
    /* receiveAllTopic () {
        return `ledsig/v1/+/lsig/#`;
    };
    receiveActiveTopic () {
        return `ledsig/v1/+/active/#`;
    };

    serverToProducGeneralTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/#`;
    };

    productToServerActiveTopic (macAddress) {
        return `ledsig/v1/${macAddress}/active`;
    };

    serverToProductCommandTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/cmd/led`;
    };

    productToServerCommandFeedbackTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/cmd/led`;
    };

    serverToProductRequestLedStatusTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/led`;
    };

    productToServerRequestLedStatusReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/led`;
    };

    serverToProductRequestFirmwareInfoTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/firmware`;
    };

    productToServerRequestFirmwareInfoReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/firmware`;
    };

    serverToProductRequestStatusInfoTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/status`;
    };

    productToServerRequestStatusInfoReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/status`;
    };

    serverToProductRequestNetworkInfoTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/network`;
    };

    productToServerRequestNetworkInfoReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/network`;
    };

    serverToProductRequestGlobalInfoTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/global`;
    };

    productToServerRequestGlobalInfoReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/global`;
    };

    serverToProductFirmwareUpdateTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/cmd/update/start`;
    };

    productToServerFirmwareUpdateReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/update/start`;
    };

    getMacFromTopic(topic) {
        var splittedTopic = topic.split('/');
        return splittedTopic[2];
    }; */
    printMessage(topic, message) {
         console.log('---Message---' );
        console.log(`MAC: ${messageUtils.getMacFromTopic(topic)}`);
        console.log(`Topic: ${topic}`);
        console.log(`Message: ${message}`);
        console.log(`Message StringFy: ${JSON.stringify(message)}`);        
    };

}

module.exports = {MqttUtils};
