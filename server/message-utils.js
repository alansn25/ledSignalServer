const Joi = require('joi');

const ledMessageSchema = Joi.object().keys({    
    yellow: Joi.string().required().valid('on','off'),
    green: Joi.string().required().valid('on','off')
});

const firmwareUpdateMessageSchema = Joi.object().keys({
    server: Joi.string().required(),
    port: Joi.number().integer().positive().required(),
    path: Joi.string().required(),
    major: Joi.number().integer().required(),
    minor: Joi.number().integer().required(),
    revision: Joi.number().integer().required()
});

var topicPrefix;
if(process.env.NODE_ENV==='test'){
    topicPrefix = 'ledsig/test/';
}else{
    topicPrefix = 'ledsig/v1/';
}

class MessageUtils {

    isMacValid(mac){     
        var result= Joi.validate(mac, Joi.string().length(12).hex().required());        
        if(result.error===null){               
            return true;
        }else{
            console.log(`${mac} is an ivalid MAC.`)
            return false;
        }
    }

    isLedMessageValid (message) {
        var result= Joi.validate(message,ledMessageSchema);        
        if(result.error===null){
            return true;
        }else{
            console.log(`${JSON.stringify(message)} is not a valid Led Message. Error: ${JSON.stringify(result.error.details)}`);
            return false
        }
    }

    isFirmwareUpdateMessageValid (message) {        
        var result= Joi.validate(message, firmwareUpdateMessageSchema);
        if(result.error===null){
            return true;
        }else{           
            console.log(`${JSON.stringify(message)} is not a valid Firmware Update Message.Error:${JSON.stringify(result.error.details)}`);
            return false
        }        
    }

    getTopicSufix(topic){
        var topicArray=topic.split('/');
        topicArray = topicArray.slice(4);
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


}

module.exports = {MessageUtils};