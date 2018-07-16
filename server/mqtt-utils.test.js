const expect = require('expect');
const {Products} = require('./products');
const {MqttUtils} = require('./mqtt-utils');

describe('MqttUtils',() =>{
    var products;
    var mqttUtils;
    
    beforeEach(() =>{
       /*  products = new Products();
        products.products =[
            {
                mac:'123456789001',
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
            },
            {
                mac:'123456789002',
                id:'my id number'            
            },
            {
                mac:'123456789003',
                id:'loja centro praça',
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
            },
            {
                mac:'123456789004'           
            }
        ]
        mqttUtils = new MqttUtils(products); */

    });
    /* describe('sendLedCommandParameters',() =>{
        it('should Send Led Command using parameters', ()=>{
            var mac = 'EFD456789ABC';
            var message = {
                yellow: 'on',
                green: 'off'
            } 
            var resMessage = mqttUtils.sendLedCommandParameters(mac, message.yellow, message.green);

            expect(resMessage.message).toEqual(message);
            expect(resMessage.topic).toEqual(mqttUtils.serverToProductCommandTopic(mac));
            expect(mac).toEqual(mqttUtils.getMacFromTopic(resMessage.topic));
        });

         it('should not Send Led Command with Mac with letters', ()=>{
            var mac = 'EF3456789JBC';
            var message = {
                yellow: 'on',
                green: 'off'
            } 
            var resMessage = mqttUtils.sendLedCommandParameters(mac, message.yellow, message.green);
            expect(resMessage).toBeFalsy();            
        });

        it('should not Send Led Command with Mac with lenght bigger than 12', ()=>{
            var mac = 'EF34567894BC7';
            var message = {
                yellow: 'on',
                green: 'off'
            } 
            var resMessage = mqttUtils.sendLedCommandParameters(mac, message.yellow, message.green);
            expect(resMessage).toBeFalsy();     
        }); 

        it('should not Send Led Command with invalid command', ()=>{
            var mac = 'EF34567894BC7';
            var message = {
                yellow: 'On',
                green: 'off'
            } 
            var resMessage = mqttUtils.sendLedCommandParameters(mac, message.yellow, message.green);
            expect(resMessage).toBeFalsy();     
        });
    });

    describe('sendLedCommandObj',() =>{
        it('should Send Led Command using object', ()=>{
            var mac = 'EF3456789ABC';
            var message = {
                yellow: 'on',
                green: 'off'
            } 
            var resMessage = mqttUtils.sendLedCommandObj(mac, message);            
            expect(resMessage.message).toEqual(message);
            expect(resMessage.topic).toEqual(mqttUtils.serverToProductCommandTopic(mac));
            expect(mac).toEqual(mqttUtils.getMacFromTopic(resMessage.topic));
        });
         it('should not Send Led Command with invalid object', ()=>{
            var mac = 'EF34567894BC7';
            var message = {
                yellow: 'On',
                green: 'off'
            } 
            var resMessage = mqttUtils.sendLedCommandObj(mac, message);
            expect(resMessage).toBeFalsy();     
        }); 
    });  */

    /*describe('handleReceiveActiveMessage',() =>{
        it('should set Product Active on', ()=>{
            var mac = products.products[0].mac;
            var message = 'on';
            var resProduct = mqttUtils.products.setProductActive(mac, message); 
            expect(resProduct.mac).toEqual(mac);
            expect(resProduct.active).toEqual(message);
            expect(mqttUtils.products.products).toContain(resProduct);
        }); 
        it('should set Product Active off', ()=>{
            var mac = products.products[0].mac;
            var message = 'off';
            var resProduct = mqttUtils.products.setProductActive(mac, message); 
            expect(resProduct.mac).toEqual(mac);
            expect(resProduct.active).toEqual(message);
            expect(mqttUtils.products.products).toContain(resProduct);
        }); 
        it('should not set Product Active with wrong value', ()=>{
            var mac = products.products[0].mac;
            var message = 'Off';
            var resProduct = mqttUtils.products.setProductActive(mac, message); 
            expect(resProduct).toBeFalsy();           
        });       
    });

    describe('handleReceiveCommandFeedbackMessage',() =>{
        it('should set product led when receiving command feedback message', ()=>{
            var mac = products.products[0].mac;
            var message={
                yellow: 'on',
                green: 'off',
            }; 
            var resProduct = mqttUtils.handleReceiveLedStatusReplyMessage(mac, message); 
            expect(resProduct.mac).toEqual(mac);
            expect(resProduct.led).toEqual(message);
            expect(mqttUtils.products.products).toContain(resProduct);
        });        
    });
    describe('handleReceiveLedStatusReplyMessage',() =>{
        it('should set product led when receiving led statust reply message', ()=>{
            var mac = products.products[0].mac;
            var message={
                yellow: 'on',
                green: 'off',
            }; 
            var resProduct = mqttUtils.handleReceiveLedStatusReplyMessage(mac, message); 
            expect(resProduct.mac).toEqual(mac);
            expect(resProduct.led).toEqual(message);
            expect(mqttUtils.products.products).toContain(resProduct);
        });        
    });
    describe('handleReceiveRequestFirmwareInfoReplyMessage',() =>{
        it('should set product firmware when receiving Request Firmware Info Reply Message', ()=>{
            var mac = products.products[0].mac;
            var message={
                major:0,
                minor:1,
                rev:5,
                build:1806231907,
                bin:2
            }; 
            var resProduct = mqttUtils.handleReceiveRequestFirmwareInfoReplyMessage(mac, message); 
            expect(resProduct.mac).toEqual(mac);
            expect(resProduct.firmware).toEqual(message);
            expect(mqttUtils.products.products).toContain(resProduct);
        });        
    });

    describe('handleReceiveRequestStatusInfoReplyMessage',() =>{
        it('should set product status when receiving Request Status Info Reply Message', ()=>{
            var mac = products.products[0].mac;
            var message={
                mem:35808,
                rst_cause:6
            }; 
            var resProduct = mqttUtils.handleReceiveRequestStatusInfoReplyMessage(mac, message); 
            expect(resProduct.mac).toEqual(mac);
            expect(resProduct.status).toEqual(message);
            expect(mqttUtils.products.products).toContain(resProduct);
        });        
    });

    describe('handleReceiveRequestNetworkInfoReplyMessage',() =>{
        it('should set product network when receiving Request Network Info Reply Message', ()=>{
            var mac = products.products[0].mac;
            var message={
                ssid:"JEAD",
                bssid:"B0487AC69B9C",
                ch:6,
                ip:"192.168.1.127",
                mask:"255.255.255.0",
                gw:"192.168.1.1"
            }; 
            var resProduct = mqttUtils.handleReceiveRequestNetworkInfoReplyMessage(mac, message); 
            expect(resProduct.mac).toEqual(mac);
            expect(resProduct.network).toEqual(message);
            expect(mqttUtils.products.products).toContain(resProduct);
        });        
    });
    describe('handleReceiveRequestGlobalInfoReplyMessage',() =>{
        it('should set product all fields when receiving Request Global Info Reply Message', ()=>{
            var mac = products.products[3].mac;
            var message={            
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
            var resProduct = mqttUtils.handleReceiveRequestGlobalInfoReplyMessage(mac, message); 
            expect(resProduct.mac).toEqual(mac);
            expect(resProduct.led).toEqual(message.led);
            expect(resProduct.firmware).toEqual(message.firmware);
            expect(resProduct.status).toEqual(message.status);
            expect(resProduct.network).toEqual(message.network);
            expect(mqttUtils.products.products).toContain(resProduct);
        });        
    });
    describe('getTopicSufix',() =>{
        it('should return the sufix of the topic', ()=>{
            var topic = `ledsig/v1/AE387FB50983/lsig/req/info/led`;
            var answer = `lsig/req/info/led`;
            var resProduct = mqttUtils.getTopicSufix(topic); 
            expect(resProduct).toEqual(answer);           
        });        
    });*/
    /* describe('Receive MQTT Message',() =>{
        it('be able to receive mqtt message and add product', (done)=>{
            var mac = 'AE387FB50983';
            var message= {
                yellow: 'on',
                green: 'off',
            }; 
            mqttUtils.publishMqttMessage(mqttUtils.productToServerCommandFeedbackTopic(mac), message);
            expect(message).toEqual(message);                     
        });        
    });  */    
});






