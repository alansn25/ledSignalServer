const expect = require('expect');
const fs = require('fs');
const {Firmwares} = require('./firmwares);


//var fileName = 'products-data.json';// it has to get this from the file products.js instead of here, also better to create a file to test and another to run
var fileName;

describe('Firmwares',() =>{
    var products;

    beforeEach(() =>{
        firmwares = new Firmwares();
        fileName = firmwares.getFilename();
        
        firmwares.firmwares=[
            {
                server: "192.168.1.100",
                port: 80,
                path: "ledupdate",   
                version:"1.2.3",
                major: 1,
                minor: 2,
                revision: 3
            },
            {
                server: "192.168.2.101",
                port: 3000,
                path: "leduadsasaspdate",   
                version:"5.0.0",
                major: 5,
                minor: 0,
                revision: 0
            },
            {
                server: "192.168.2.101",
                port: 3600,
                path: "fdtregg",   
                version:"2.1.0",
                major: 2,
                minor: 1,
                revision: 0
            },
            {
                server: "192.168.2.101",
                port: 3600,
                path: "fdtregg",   
                version:"7.1.8",
                major: 7,
                minor: 1,
                revision: 0
            },
            {
                server: "192.168.2.101",
                port: 3600,
                path: "fdtregg",   
                version:"7.2.0",
                major: 7,
                minor: 1,
                revision: 0
            },
            {
                server: "192.168.2.101",
                port: 3600,
                path: "fdtregg",   
                version:"7.2.1",
                major: 7,
                minor: 1,
                revision: 0
            },
            
        ]          
    });


    describe('addFirmware',() =>{
        it('should add a new firmware', ()=>{
            var firmwares = new Firmwares();
            var localFirmware= {
                server: "192.168.3.106",
                port: 3800,
                path: "sdfsdfs",   
                version:"3.9.100"                
            };
            var shouldBeFirmware= {
                server: "192.168.3.106",
                port: 3800,
                path: "sdfsdfs",   
                version:"3.9.100",
                major: 3,
                minor: 9,
                revision: 100
            };
            var result = firmwares.addFirmware(localFirmware);

            expect(firmwares.firmwares).toEqual([shouldBeFirmware]);
            expect(result.error).toBeNull();
            expect(result.result).toEqual(shouldBeFirmware);

        });

        it('should not add a new firmware with invalid value', ()=>{
            var localFirmware= {
                server: "192.168.3.106",               
                path: "sdfsdfs",   
                version:"3.9.100"                
            };
            var result = firmwares.addFirmware(localFirmware);
            expect(result.error).toBeTruthy();
            

        });
        it('should not add a new firmware with invalid version', ()=>{
            var localFirmware= {
                server: "192.168.3.106",
                port: 3800,
                path: "sdfsdfs",   
                version:"3.9."                
            };
            var result = firmwares.addFirmware(localFirmware);
            expect(result.error).toBeTruthy();
        });
        
        it('should not add a new firmware with same version', ()=>{
            var localFirmware= {
                server: "192.168.3.106",
                port: 3800,
                path: "sdfsdfs",   
                version:firmwares.firmwares[2].version                
            };
            var result = firmwares.addFirmware(localFirmware);
            expect(result.error).toBeTruthy();
        }); 
    }); 

    describe('getLastFirmware',() =>{
        it('should get the firmware with higher version', ()=>{            
            var result = firmwares.getLastFirmware();
            expect(result.error).toBeNull();
            expect(result.result).toEqual(firmwares.firmwares[5]);
        });

        it('should return error because there is no firmware', ()=>{            
            var localFirmwares = new Firmwares();
            var result = localFirmwares.getLastFirmware();
            expect(result.error).toBeTruthy();            
        });
    }); 

    describe('deleteFirmware',() =>{
        it('should delete firmware', ()=>{            
            var localfirmware = firmwares.firmwares[2];
            var currentLength = firmwares.firmwares.length;
            var result = firmwares.deleteFirmware(localfirmware.version);
            
            expect(result.error).toBeNull();
            expect(result.result).toEqual(localfirmware);
            expect(firmwares.firmwares.length).toEqual(currentLength-1);
        });

        it('should not delete firmware that is not there', ()=>{            
            var version = "3.2.9";
            var currentLength = firmwares.firmwares.length;
            var result = firmwares.deleteFirmware(version);
            
            expect(result.error).toBeTruthy();            
            expect(firmwares.firmwares.length).toEqual(currentLength);
        });
    }); 

    describe('getFirmware',() =>{
        it('should get firmware', ()=>{            
            var localfirmware = firmwares.firmwares[2];            
            var result = firmwares.getFirmware(localfirmware.version);
            
            expect(result.error).toBeNull();
            expect(result.result).toEqual(localfirmware);            
        });

        it('should not get firmware that is not there', ()=>{            
            var version = "3.2.9";            
            var result = firmwares.getFirmware(version);
            
            expect(result.error).toBeTruthy();            
        });
    }); 

    describe('updateFirmware',() =>{
        it('should update firmware', ()=>{     
            var localFirmware= {
                server: "192.168.10.120",
                port: 4500,
                path: "thisIsMypath",   
                version: firmwares.firmwares[2].version                
            };
            var shouldBeFirmware= {
                server: "192.168.10.120",
                port: 4500,
                path: "thisIsMypath",   
                version: firmwares.firmwares[2].version,
                major: firmwares.firmwares[2].major,
                minor: firmwares.firmwares[2].minor,
                revision: firmwares.firmwares[2].revision               
            };
                        
            var result = firmwares.updateFirmware(localFirmware);
            var getResult = firmwares.getFirmware(localFirmware.version);
            
            expect(result.error).toBeNull();
            expect(result.result).toEqual(shouldBeFirmware);  
            expect(getResult.result).toEqual(shouldBeFirmware); 
        });

        it('should not update firmware that is not there', ()=>{            
            var localFirmware= {
                server: "192.168.10.120",
                port: 4500,
                path: "thisIsMypath",   
                version: '3.12.9'                
            };            
            var result = firmwares.getFirmware(localFirmware.version);            
            expect(result.error).toBeTruthy();            
        });
    });
});