const mqtt = require('mqtt');
const {Products} = require('./products');

const {MessageUtils} = require('./message-utils');


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
            this.mqttClient.subscribe(this.receiveAllTopic ());
            this.mqttClient.subscribe(this.receiveActiveTopic ());
            //console.log(`Subscribed to ${this.receiveAllTopic}`);           
        });

        this.mqttClient.on('message', (topic, message) => {
            var stringMessage=message.toString().replace(/\0/g, "");//removes null character           
            var objMessage;
            try {
                objMessage = JSON.parse(stringMessage);
                console.log(`converted message:${objMessage}`);
            } catch (e) {
                objMessage = stringMessage;
                console.log(`catch error message:${objMessage}`);
            }
            console.log(`Received message:`);            
            this.printMessage(topic, objMessage);
            var mac = this.getMacFromTopic(topic);  
            
            this.products.addProductByMac(mac);

            switch(topic){
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
            }else{
                var product = this.products.getProduct(mac);
                if(product){
                    var topic = this.serverToProductCommandTopic(product.mac);
                    this.publishMqttMessage(topic, JSON.stringify(message));
                    return {topic,message}; 
                }
            }            
        }
    };


    sendLedCommandObj(mac, messageObj) {        
        if(messageUtils.isLedMessageValid(messageObj)){            
            if(messageUtils.isMacValid(mac)){                
                var topic = this.serverToProductCommandTopic(mac);                
                this.publishMqttMessage(topic, JSON.stringify(messageObj));
                return {topic:topic,message:messageObj};
            }else{
                var product = this.products.getProduct(mac);
                if(product){
                    var topic = this.serverToProductCommandTopic(product.mac);
                    this.publishMqttMessage(topic, JSON.stringify(messageObj));
                    return {topic:topic,message:messageObj}; 
                }
            } 
        }
    };

    sendFirmwareUpdate(mac, messageObj) {
        if(messageUtils.isFirmwareUpdateMessageValid(messageObj)){
            if(messageUtils.isMacValid(mac)){
                var topic = this.serverToProductFirmwareUpdateTopic(mac);
                this.publishMqttMessage(topic,JSON.stringify(messageObj));
                return {topic:topic,message:messageObj};
            }else{
                var product = this.products.getProduct(mac);
                if(product){
                    var topic = this.serverToProductFirmwareUpdateTopic(product.mac);
                    this.publishMqttMessage(topic, JSON.stringify(messageObj));
                    return {topic:topic,message:messageObj}; 
                }
            } 
        }
    };

    requestLedStatus(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestLedStatusTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic,message); 
            return {topic,message}; 
        }else{
            var product = this.products.getProduct(mac);
            if(product){
                var topic = this.serverToProductRequestLedStatusTopic(product.mac);
                this.publishMqttMessage(topic, JSON.stringify(message));
                return {topic,message}; 
            }
        }
    }

    requestFirmwareInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestFirmwareInfoTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic, message); 
            return {topic, message};
        }else{
            var product = this.products.getProduct(mac);
            if(product){
                var topic = this.serverToProductRequestFirmwareInfoTopic(product.mac);
                this.publishMqttMessage(topic, JSON.stringify(message));
                return {topic,message}; 
            }
        }
    }

    requestStatusInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestStatusInfoTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic, message); 
            return {topic, message}; 
        }else{
            var product = this.products.getProduct(mac);
            if(product){
                var topic = this.serverToProductRequestStatusInfoTopic(product.mac);
                this.publishMqttMessage(topic, JSON.stringify(message));
                return {topic,message}; 
            }
        }
    }

    requestNetworkInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestNetworkInfoTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic, message); 
            return {topic, message};
        }else{
            var product = this.products.getProduct(mac);
            if(product){
                var topic = this.serverToProductRequestNetworkInfoTopic(product.mac);
                this.publishMqttMessage(topic, JSON.stringify(message));
                return {topic,message}; 
            }
        }
    }

    requestGlobalInfo(mac){
        if(messageUtils.isMacValid(mac)){
            var topic = this.serverToProductRequestGlobalInfoTopic(mac);
            var message = '{}';
            this.publishMqttMessage(topic, message); 
            return {topic, message};
        }else{
            var product = this.products.getProduct(mac);
            if(product){
                var topic = this.serverToProductRequestGlobalInfoTopic(product.mac);
                this.publishMqttMessage(topic, JSON.stringify(message));
                return {topic,message}; 
            }
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
    };
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
        console.log(`MAC: ${this.getMacFromTopic(topic)}`);
        console.log(`Topic: ${topic}`);
        console.log(`Message: ${message}`);
        console.log(`Message StringFy: ${JSON.stringify(message)}`);        
    };

}

module.exports = {MqttUtils};
