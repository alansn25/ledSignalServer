const mqtt = require('mqtt');
const {Products} = require('./products');

const {MessageUtils} = require('./message-utils');


var messageUtils =new MessageUtils();

class MqttUtils {
    constructor(products){
        this.products = products;
        this.mqttClient = mqtt.connect('mqtt://broker.hivemq.com');
        this.mqttClient.on('connect', () => {
            this.mqttClient.subscribe(this.receiveAllTopic ());
            this.mqttClient.subscribe(this.receiveActiveTopic ());
            console.log(`Subscribed to ${this.receiveAllTopic}`);           
        });

        this.mqttClient.on('message', (topic, message) => {
            var objMessage = JSON.parse(message);
            console.log(`Received message:`);
            this.printMessage(topic, message);
            var mac = this.getMacFromTopic(topic);  
            
            switch(topic){
                case this.productToServerActiveTopic():
                    handleReceiveActiveMessage (mac, objMessage);
                break;
                case this.productToServerCommandFeedbackTopic():
                    handleReceiveCommandFeedbackMessage (mac, objMessage);
                break;
                case this.productToServerRequestLedStatusReplyTopic():
                    handleReceiveLedStatusReplyMessage (mac, objMessage)
                break;
                case this.productToServerRequestFirmwareInfoReplyTopic():
                    handleReceiveRequestFirmwareInfoReplyMessage (mac, objMessage);
                break;
                case this.productToServerRequestStatusInfoReplyTopic():
                    handleReceiveRequestStatusInfoReplyMessage (mac, objMessage);
                break;
                case this.productToServerRequestNetworkInfoReplyTopic():
                    handleReceiveRequestNetworkInfoReplyMessage (mac, objMessage);
                break;
                case this.productToServerRequestGlobalInfoReplyTopic():
                    handleReceiveRequestGlobalInfoReplyMessage (mac, objMessage);
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
    
    sendLedCommandParameters(mac, yellow, green) {
        var message={
            yellow,
            green,
        };        
        if(messageUtils.isLedMessageValid(message)){
            if(messageUtils.isMacValid(mac)){
                var topic = this.serverToProductCommandTopic(mac);
                this.publishMqttMessage(topic, JSON.stringify(message));
                return {topic,message}; 
            }            
        }
    };

    sendLedCommandObj(mac, messageObj) {        
        if(messageUtils.isLedMessageValid(messageObj)){            
            if(messageUtils.isMacValid(mac)){                
                var topic = this.serverToProductCommandTopic(mac);                
                this.publishMqttMessage(topic, JSON.stringify(messageObj));
                return {topic:topic,message:messageObj};
            }
        }
    };

    sendFirmwareUpdate(mac, messageObj) {
        if(messageUtils.isFirmwareUpdateMessageValid(messageObj)){
            if(messageUtils.isMacValid(mac)){
                var topic = this.serverToProductFirmwareUpdateTopic(mac);
                this.publishMqttMessage(topic,JSON.stringify(messageObj));
                return {topic,messageObj};
            }
        }
    };

    requestLedStatus(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestLedStatusTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic,message); 
            return {topic,message}; 
        }
    }

    requestFirmwareInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestFirmwareInfoTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic, message); 
            return {topic, message};
        }
    }

    requestStatusInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestStatusInfoTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic, message); 
            return {topic, message}; 
        }
    }

    requestNetworkInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestNetworkInfoTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic, message); 
            return {topic, message};
        }
    }

    requestGlobalInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestGlobalInfoTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic, message); 
            return {topic, message};
        }
    }
    
    handleReceiveActiveMessage (mac, message) {
        return this.products.setProductActive(mac, message);
    };
    handleReceiveCommandFeedbackMessage (mac, message) {
        return this.products.setProductLed(mac, message);
    };
    handleReceiveLedStatusReplyMessage (mac, message) {
        return this.products.setProductLed(mac, message);
    };
    handleReceiveRequestFirmwareInfoReplyMessage (mac, message) {
        return this.products.setProductFirmware(mac, message);
    };
    handleReceiveRequestStatusInfoReplyMessage (mac, message) {
        return this.products.setProductStatus(mac, message);
    };
    handleReceiveRequestNetworkInfoReplyMessage (mac, message) {
        return this.products.setProductNetwork(mac, message);
    };
    handleReceiveRequestGlobalInfoReplyMessage (mac, message) {
        return this.products.setProductGlobal(mac, message);
    };
    
    



    publishMqttMessage (topic, message) {
        //console.log(`Message:${message}  Topic:${topic}`);
        this.mqttClient.publish(topic, message);   
    };

    receiveAllTopic () {
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
    };
    printMessage(topic, message) {
        console.log('---Message---' );
        console.log(`MAC: ${this.getMacFromTopic(topic)}`);
        console.log(`Topic: ${topic}`);
        console.log(`Message: ${message}`);
    };

}

module.exports = {MqttUtils};
