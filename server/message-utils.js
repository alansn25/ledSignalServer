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
}

module.exports = {MessageUtils};