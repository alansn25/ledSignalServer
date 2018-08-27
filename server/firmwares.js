const Joi = require('joi');
const fs = require('fs');
const _ = require ('lodash');

var fileName;
if(process.env.NODE_ENV==='test'){
    fileName = 'firmwares-data.test.json';//better to create a file to test and another to run
}else{
    fileName = 'firmwares-data.json';//better to create a file to test and another to run
}
//^(?:\d{1,3}\.){2}\d{1,3}$

//requestInfo({"type":"addFirmware","firmware":{"server":"192.168.2.101","port":3600,"path":"myPath","version":"0.3.1"}})

const firmwareSchema = Joi.object().keys({
    server: Joi.string().required(),
    port: Joi.number().integer().required(),
    path: Joi.string().required(),   
    version: Joi.string().regex(/^(?:\d{1,3}\.){2}\d{1,3}$/)
});

class Firmwares {
    constructor(){        
        try {
        this.firmwares = JSON.parse(fs.readFileSync(fileName));
        }catch(err){
            console.log(err);
        }
    };

    writeFirmwaresToFile (callback) {
        fs.writeFile(fileName, JSON.stringify(this.firmwares),(err) => {
            callback(err);            
        });  
    };
    readFirmwaresFromFile (callback) {
        fs.readFile(fileName, (err, data) => {
            if(!err){
                var readFirmwares;
                try {
                    readFirmwares = JSON.parse(data);
                } catch (e) {
                    readFirmwares=[];
                }
                                
                var mergedFirmwares = _.unionBy(this.firmwares,readFirmwares,"version");                
                this.firmwares=mergedFirmwares;        
            }
            callback(err);
        });
    };

    getAllFirmwares(){
        return this.firmwares;
    }
    getFirmware(version){
        var result={};        
        var foundFirmware = this.firmwares.find((element) => element.version === version);
        if(foundFirmware){
            result.error = null;
            result.result = foundFirmware;
        }else{
            result.error = 'Firmware not found.' 
        }
        return result;
    }

    getLastFirmware(){
        var result={}; 
        if(this.firmwares.length===0){
            result.error='There is no firmware';
        }else{        
            var lastVersion = this.firmwares.reduce((accumulator, currentValue)=>{
                if(currentValue.major>accumulator.major){
                    return currentValue;
                }else if(currentValue.major<accumulator.major){
                    return accumulator;
                }else{
                    if(currentValue.minor>accumulator.minor){
                        return currentValue;
                    }else if(currentValue.minor<accumulator.minor){
                        return accumulator;
                    }else{
                        if(currentValue.revision>accumulator.revision){
                            return currentValue;
                        }else if(currentValue.revision<accumulator.revision){
                            return accumulator;
                        }else{
                            return currentValue;
                        }  
                    }
                }
            });
            if(lastVersion){
                
                result.result=lastVersion;
                result.error=null;
            }else{
                result.error='Something wrong.';
            }
             
        }
        return result;
    }

    addFirmware(firmware){
        var result={};
        var validation= Joi.validate(firmware, firmwareSchema);
        if(validation.error===null){
           var duplicateFirmwares = this.firmwares.filter((element) => element.version === firmware.version);
           if(duplicateFirmwares.length===0){
                var splittedVersion = firmware.version.split('.');
                if(splittedVersion.length===3){
                    firmware.major=parseInt(splittedVersion[0],10);
                    firmware.minor=parseInt(splittedVersion[1],10);
                    firmware.revision=parseInt(splittedVersion[2],10);
                    this.firmwares.push(firmware);
                    result.error=null
                    result.result=firmware;
                    
                    this.writeFirmwaresToFile((err)=>{                   
                        if(err){
                            console.log(`Error writing firmwares to file: ${err}`);
                        }else{
                            console.log(`Wrote firmwares to file successful. `);
                        }
                    });
                }else{
                    result.error="Something wrong with the version number.";
                }
            }else{
                result.error="Firmware version already exists. Choose a different version.";
            }
        }else{
            result.error=validation.error;
        }
        return result;
    }

    updateFirmware(newFirmware){
        var result={};
        var validation= Joi.validate(newFirmware, firmwareSchema);
        if(validation.error===null){
            var foundIndex = this.firmwares.findIndex((element) => element.version === newFirmware.version);
            if(foundIndex>=0){
                var mergedObject = {...this.firmwares[foundIndex], ...newFirmware};
                this.firmwares[foundIndex] = mergedObject;
                result.error = null;
                result.result = this.firmwares[foundIndex]; 
                
                
                this.writeFirmwaresToFile((err)=>{                   
                    if(err){
                        console.log(`Error writing firmwares to file: ${err}`);
                    }else{
                        console.log(`Wrote firmwares to file successful. `);
                    }
                });
            }else{
                result.error = 'Firmware not found.' 
            }        
        }else{
            result.error=validation.error;
        }
        return result;
    }

       

    deleteFirmware(version){
        var result={};        
        var foundFirmware = this.firmwares.find((element) => element.version === version);        
        if(foundFirmware){
            this.firmwares = this.firmwares.filter((element) => element.version != version);
            result.result = foundFirmware;
            result.error = null;
            this.writeFirmwaresToFile((err)=>{                   
                if(err){
                    console.log(`Error writing firmwares to file: ${err}`);
                }else{
                    console.log(`Wrote firmwares to file successful. `);
                }
            });
        }else{
            result.error = "Firmware not found!"
        }
        return result;

    }
    getFilename(){
        return fileName;
    };




}
module.exports = {Firmwares};