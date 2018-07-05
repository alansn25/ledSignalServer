const expect = require('expect');
const {MessageUtils} = require('./message-utils');

describe('MessageUtils',() =>{
    beforeEach(() =>{
        messageUtils = new MessageUtils();
    });
    describe('isMacValid',() =>{
        it('should return true if mac is valid', ()=>{
            var mac = 'EA25071433F0';            
            var res = messageUtils.isMacValid(mac);
            expect(res).toBeTruthy();            
        });

        it('should return false if mac length is bigger than 12', ()=>{
            var mac = 'EF3456789ABCD';            
            var res = messageUtils.isMacValid(mac);
            expect(res).toBeFalsy();            
        });

        it('should return false if mac length is smaller than 12', ()=>{
            var mac = 'EF3456789AB';            
            var res = messageUtils.isMacValid(mac);
            expect(res).toBeFalsy();            
        });

        it('should return false if mac has different letters', ()=>{
            var mac = 'EF3456789AR8';            
            var res = messageUtils.isMacValid(mac);
            expect(res).toBeFalsy();            
        });
    });

    describe('isLedMessageValid',() =>{
        it('should return true if led message is valid', ()=>{
            var message={
                yellow: 'on',
                green: 'off',
            };            
            var res = messageUtils.isLedMessageValid(message);
            expect(res).toBeTruthy();            
        });

        it('should return false if led message is not on or off', ()=>{
            var message={
                yellow: 'On',
                green: 'off',
            };            
            var res = messageUtils.isLedMessageValid(message);
            expect(res).toBeFalsy();            
        });

        it('should return false if led message does not have a green or yellow field', ()=>{
            var message={
                green: 'off',
            };            
            var res = messageUtils.isLedMessageValid(message);
            expect(res).toBeFalsy();            
        });
    });

    describe('isFirmwareUpdateMessageValid',() =>{
        it('should return true if firmware update message is valid', ()=>{
            var message = {                    
                server: "192.168.1.100",
                port: 80,
                path: "ledupdate",
                major: 0,
                minor: 1,
                revision: 5                      
            };      
            var res = messageUtils.isFirmwareUpdateMessageValid(message);
            expect(res).toBeTruthy();            
        });

        it('should return false if firmware update message is missing a field', ()=>{
            var message={                    
                major:0,                            
                build:1806231907,
                bin:2                       
            };            
            var res = messageUtils.isFirmwareUpdateMessageValid(message);
            expect(res).toBeFalsy();            
        });

        
    });

        
    
});