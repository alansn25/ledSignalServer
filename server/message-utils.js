const Joi = require('joi');

const ledMessageSchemaOld = Joi.object().keys({    
    yellow: Joi.string().required().valid('on','off'),
    green: Joi.string().required().valid('on','off')
});

const ledMessageSchema = Joi.object().keys({    
    led1: Joi.string().required().valid('on','off','flash'),
    led2: Joi.string().required().valid('on','off','flash')
});

const firmwareUpdateMessageSchema = Joi.object().keys({
    server: Joi.string().required(),
    port: Joi.number().integer().positive().required(),
    path: Joi.string(),
    major: Joi.number().integer().required(),
    minor: Joi.number().integer().required(),
    revision: Joi.number().integer().required()
});

const pairStaticIpMessageSchema = Joi.object().keys({
    ssid: Joi.string().required(),
    password: Joi.string().required(),
    ip: Joi.string().required(),
    mask: Joi.string().required(),
    gw: Joi.string().required()    
});


var topicPrefix;
if(process.env.NODE_ENV==='test'){
    topicPrefix = 'ledsig/test/';
}else{
    topicPrefix = 'ledsig/v1/';
}


const commands={
    reqLed:`reqLed`,
    comLed:`comLed`,
    reqFirmware:`reqFirmware`,
    reqNetwork:`reqNetwork`,
    reqStatus:`reqStatus`,
    reqGlobal:`reqGlobal`,
    getProduct:`getProduct`,
    addProduct:`addProduct`,
    list:`list`,
    help:`help`
    }

class MessageUtils {
    
    /* commands(command){
        var commands:
    
    } */

    

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
            var resultOld= Joi.validate(message,ledMessageSchemaOld);
            if(resultOld.error===null){
                return true;
            }else{
                console.log(`${JSON.stringify(message)} is not a valid Led Message. Error1: ${JSON.stringify(result.error.details)} Error2: ${JSON.stringify(resultOld.error.details)}`);
                return false
            }            
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

    isPairStaticIpMessageValid (message) {        
        var result = Joi.validate(message, pairStaticIpMessageSchema);
        if(result.error===null){
            return true;
        }else{           
            console.log(`${JSON.stringify(message)} is not a valid pair Static IP Message.Error:${JSON.stringify(result.error.details)}`);
            return false
        }        
    }

    printMessage(topic, message) {
        console.log('---Message---' );
        console.log(`MAC: ${this.getMacFromTopic(topic)}`);
        console.log(`Topic: ${topic}`);
        //console.log(`Message: ${message}`);
        console.log(`Message: ${JSON.stringify(message)}`);       
        
   };
   

    getTopicSufix(topic){
        var topicArray=topic.split('/');
        topicArray = topicArray.slice(4);
        return topicArray.join('/');
    }
    receiveAllTopic () {
        return `${topicPrefix}+/lsig/#`;
    };
    receiveActiveTopic () {
        return `${topicPrefix}+/active`;
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
        return `${topicPrefix}${macAddress}/lsig/cmd/update/start`;
    };

    serverToProductPairStaticIpTopic (macAddress) {
        return `${topicPrefix}${macAddress}/app/cmd/network`;
    };
    productToServerPairStaticIpReplyTopic (macAddress) {
        return `${topicPrefix}${macAddress}/lsig/cmd/network`;
    };

    getMacFromTopic(topic) {
        var splittedTopic = topic.split('/');
        return splittedTopic[2];
    };


}

module.exports = {MessageUtils};