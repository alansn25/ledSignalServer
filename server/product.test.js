const {Product} = require('./product');
const expect = require('expect');


describe('Product',() =>{
    var product;

    beforeEach(() =>{
        product = new Product('123456789001');       
    });
    describe('constructor',() =>{
        it('should create the product with mac and id', ()=>{
            var id ='meu id';
            var mac ='123456789001';
            product= new Product(mac,id);
            
            expect(product.id).toEqual(id);
            expect(product.mac).toEqual(mac);
        });
        it('should create the product with mac only the mac', ()=>{
            var mac ='123456789001';
            product= new Product(mac);  
            
            expect(product.mac).toEqual(mac);
            expect(product).not.toHaveProperty('id');
        });
    });
    describe('setId',() =>{
        it('should set the product id', ()=>{
            var parameter ='meu id';
            resultProduct = product.setId(parameter);
            expect(product.id).toEqual(parameter);
            expect(resultProduct.id).toEqual(parameter);
        });
    });

    describe('setLed',() =>{
        it('should set the product led', ()=>{
            var parameter ={
                yellow: 'on',
                green: 'off'
            };
            var resultProduct = product.setLed(parameter);
            expect(product.led).toEqual(parameter);
            expect(resultProduct.led).toEqual(parameter);
        });
        it('should set the product led with new version', ()=>{
            var parameter ={
                led1: 'on',
                led2: 'off'
            };
            var resultProduct = product.setLed(parameter);
            expect(product.led).toEqual(parameter);
            expect(resultProduct.led).toEqual(parameter);
        });
        it('should not set the product led with wrong parameters', ()=>{
            var parameter ={
                yellow: 'On',
                green: 'off'
            };
            var resultProduct = product.setLed(parameter);
            expect(product).not.toHaveProperty('led');
            expect(resultProduct).toBeFalsy();
        });
    });
    describe('setFirmware',() =>{
        it('should set the product firmware', ()=>{
            var parameter = {
                major:0,
                minor:1,
                rev:5,
                build:1806231907,
                bin:2
            };
            var resultProduct = product.setFirmware(parameter);
            expect(product.firmware).toEqual(parameter);
            expect(resultProduct.firmware).toEqual(parameter);
        });
    });

    describe('setStatus',() =>{
        it('should set the product status', ()=>{
            var parameter = {
                mem:35808,
                rst_cause:6
            };
            var resultProduct = product.setStatus(parameter);
            expect(product.status).toEqual(parameter);
            expect(resultProduct.status).toEqual(parameter);
        });
    });
    describe('setNetwork',() =>{
        it('should set the product network', ()=>{
            var parameter = {
                ssid:"JEAD",
                bssid:"B0487AC69B9C",
                ch:6,
                ip:"192.168.1.127",
                mask:"255.255.255.0",
                gw:"192.168.1.1"
            };
            var resultProduct = product.setNetwork(parameter);
            expect(product.network).toEqual(parameter);
            expect(resultProduct.network).toEqual(parameter);
        });
    });
    describe('setGlobal',() =>{
        it('should set the product global', ()=>{
            var parameter = {
                led:{
                    yellow:"on",
                    green:"off"
                },
                firmware:{
                    major:0,
                    minor:1,
                    rev:5,
                    build:1806231907,
                    bin:2
                },
                status:{
                    mem:35808,
                    rst_cause:6
                },
                network:{
                    ssid:"JEAD",
                    bssid:"B0487AC69B9C",
                    ch:6,
                    ip:"192.168.1.127",
                    mask:"255.255.255.0",
                    gw:"192.168.1.1"
                }
            };
            var resultProduct = product.setGlobal(parameter);
            expect(product.led).toEqual(parameter.led);                     
            expect(product.firmware).toEqual(parameter.firmware);            
            expect(product.status).toEqual(parameter.status);           
            expect(product.network).toEqual(parameter.network);

            expect(resultProduct.led).toEqual(parameter.led);                     
            expect(resultProduct.firmware).toEqual(parameter.firmware);            
            expect(resultProduct.status).toEqual(parameter.status);           
            expect(resultProduct.network).toEqual(parameter.network);
        });
        it('should set the product global without the firmware', ()=>{
            var parameter = {
                led:{
                    yellow:"on",
                    green:"off"
                },                
                status:{
                    mem:35808,
                    rst_cause:6
                },
                network:{
                    ssid:"JEAD",
                    bssid:"B0487AC69B9C",
                    ch:6,
                    ip:"192.168.1.127",
                    mask:"255.255.255.0",
                    gw:"192.168.1.1"
                }
            };
            var resultProduct = product.setGlobal(parameter);
            expect(product.led).toEqual(parameter.led);                     
            expect(product).not.toHaveProperty('firmware');            
            expect(product.status).toEqual(parameter.status);           
            expect(product.network).toEqual(parameter.network);

            expect(resultProduct.led).toEqual(parameter.led);                     
            expect(resultProduct).not.toHaveProperty('firmware');            
            expect(resultProduct.status).toEqual(parameter.status);           
            expect(resultProduct.network).toEqual(parameter.network);
        });
    });

    describe('sendLedCommandParameters',() =>{
        it('should Send Led Command using parameters with product without version', ()=>{
            //var localMac = 'EFD456F89ABC';
            var message = {
                yellow: 'on',
                green: 'off'
            } 
            var message2 = {
                led1: 'off',
                led2: 'on'
            } 
            //var localProduct = new Product(localMac);
            var resMessage = product.sendLedCommandParameters(message.yellow, message.green);
            

            expect(resMessage.data).toEqual(JSON.stringify(message2));
            expect(resMessage.topic).toEqual(messageUtils.serverToProductCommandTopic(product.mac));
            expect(product.mac).toEqual(messageUtils.getMacFromTopic(resMessage.topic));
        });

        it('should Send Led Command using parameters with product from old version', ()=>{
            //var localMac = 'EFD456F89ABC';
            var message = {
                green: 'off',
                yellow: 'on'                
            } 
            var parameter ={
                yellow: 'off',
                green: 'off'
            };
            var resultProduct = product.setLed(parameter);
            //var localProduct = new Product(localMac);
            var resMessage = product.sendLedCommandParameters(message.yellow, message.green);
            

            expect(resMessage.data).toEqual(JSON.stringify(message));
            expect(resMessage.topic).toEqual(messageUtils.serverToProductCommandTopic(product.mac));
            expect(product.mac).toEqual(messageUtils.getMacFromTopic(resMessage.topic));
        });

        it('should Send Led Command using parameters with product from new version', ()=>{
            //var localMac = 'EFD456F89ABC';
            var message = {
                yellow: 'on',
                green: 'off'
            } 
            var parameter ={
                led2: 'on',
                led1: 'off'
            };
            var message2 = {
                led1: 'off',
                led2: 'on'
            } 
            var resultProduct = product.setLed(parameter);
            //var localProduct = new Product(localMac);
            var resMessage = product.sendLedCommandParameters(message.yellow, message.green);
            

            expect(resMessage.data).toEqual(JSON.stringify(message2));
            expect(resMessage.topic).toEqual(messageUtils.serverToProductCommandTopic(product.mac));
            expect(product.mac).toEqual(messageUtils.getMacFromTopic(resMessage.topic));
        });
          
      

        it('should not Send Led Command with invalid command', ()=>{
            //var mac = 'EF34567894BC7';
            var message = {
                yellow: 'On',
                green: 'off'
            }
            //var product = new Product(mac);
            var resMessage = product.sendLedCommandParameters(message.yellow, message.green);
            expect(resMessage).toBeFalsy();     
        }); 
    });

    describe('sendLedCommandObj',() =>{
        it('should Send Led Command using object', ()=>{
            //var mac = 'EF3456789ABC';
            var message = {
                yellow: 'on',
                green: 'off'
            } 
           // var product = new Product(mac);
            var resMessage = product.sendLedCommandObj(message);            
            expect(resMessage.data).toEqual(JSON.stringify(message));
            expect(resMessage.topic).toEqual(messageUtils.serverToProductCommandTopic(product.mac));
            expect(product.mac).toEqual(messageUtils.getMacFromTopic(resMessage.topic));
        });
         it('should not Send Led Command with invalid object', ()=>{
            //var mac = 'EF34567894BC7';
            var message = {
                yellow: 'On',
                green: 'off'
            } 
            //var product = new Product(mac);
            var resMessage = product.sendLedCommandObj(message);
            expect(resMessage).toBeFalsy();     
        }); 
    }); 

    describe('setProductActive',() =>{
        it('should set product active on', ()=>{            
            var productActive = 'on';
            var resProduct = product.setActive(productActive);
            expect(product.active).toEqual(productActive); 
            expect(resProduct.active).toEqual(productActive);        
        });

        it('should set product active off', ()=>{
            var productActive = 'off';
            var resProduct = product.setActive(productActive);
            expect(product.active).toEqual(productActive); 
            expect(resProduct.active).toEqual(productActive);         
        });

        it('should not be able to set product active with wrong value', ()=>{
            var currentProduct = product;
            var productActive = 'On';
            var resProduct = product.setActive(productActive);
            expect(product).toEqual(currentProduct); 
            expect(resProduct).toBeFalsy();           
             
        });
    }); 

    describe('isProductActive',() =>{
        it('should get true if the product is active', ()=>{
                      
            var resProduct = product.setActive('on');
            var res = product.isActive();
            expect(res).toEqual(true);             
        });

        it('should get false if the product is not active', ()=>{
            var resProduct = product.setActive('off');
            var res = product.isActive();            
            expect(res).toEqual(false); 
        }); 
        
        it('should get null if the product does not have the active property', ()=>{                       
            var res = product.isActive();
            expect(res).toEqual(undefined); 
        });
    });
   

    
    

    
});

