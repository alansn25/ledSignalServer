const expect = require('expect');
const stdin = require('mock-stdin').stdin();;
const sinon = require('sinon');
const {Products} = require('./products');
const {Product} = require('./product');
const {MqttUtils} = require('./mqtt-utils');
const {InputCommands} = require('./input-commands');


describe('input-commands',() =>{
    beforeEach(() =>{
        products = new Products();
        mqttUtils = new MqttUtils(products);
        inputCommander = new InputCommands(products,mqttUtils);
        var mac;
        var id;
        var firmware;
        var status;
        var network;
        var product;
        
        mac = '123456789001';
        firmware={
            major:0,
            minor:1,
            rev:5,
            build:1806231907,
            bin:2
        };
        status = {
            mem:35808,
            rst_cause:6
        };
        network = {
            ssid:"JEAD",
            bssid:"B0487AC69B9C",
            ch:6,
            ip:"192.168.1.127",
            mask:"255.255.255.0",
            gw:"192.168.1.1"
        };        
        product = new Product(mac);        
        product.setFirmware(firmware);
        product.setStatus(status);
        product.setNetwork(network);
        products.products.push(product);


        mac = '123456789002';
        id = 'my id number';
            
        product = new Product(mac,id);       
        products.products.push(product);

        mac = '123456789003';
        id = 'loja centro praça';
        firmware={
            major:0,
            minor:1,
            rev:5,
            build:1806231907,
            bin:2
        };
        status = {
            mem:35808,
            rst_cause:6
        };
        network = {
            ssid:"JEAD",
            bssid:"B0487AC69B9C",
            ch:6,
            ip:"192.168.1.127",
            mask:"255.255.255.0",
            gw:"192.168.1.1"
        };        
        product = new Product(mac, id);        
        product.setFirmware(firmware);
        product.setStatus(status);
        product.setNetwork(network);
        products.products.push(product);

        mac = '123456789004';       
            
        product = new Product(mac);       
        products.products.push(product);
    });
 
    describe('reqLed <mac>',() =>{
         it('should request led status', ()=>{
            var mac =  products.products[0].mac;
            var input = `reqLed ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        }); 
         it('should request led status with alias', ()=>{
            var mac =  products.products[0].mac;
            var input = `rl ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        }); 
    });  
     describe('comLed <mac> <yellow> <green>',() =>{
        it('should command led', ()=>{
            var mac =  products.products[0].mac;
            var yellow = 'on';
            var green = 'off';
            var input = `comLed ${mac} ${yellow} ${green}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');            
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
        it('should command led with alias', ()=>{
            var mac =  products.products[0].mac;
            var yellow = 'on';
            var green = 'off';
            var input = `cl ${mac} ${yellow} ${green}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');            
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
    });   
    describe('reqFirmware <mac>',() =>{
        it('should request firmware info', ()=>{
            var mac =  products.products[0].mac;
            var input = `reqFirmware ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
        it('should request firmware info with alias', ()=>{
            var mac =  products.products[0].mac;
            var input = `rf ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
    });  

    describe('reqNetwork <mac>',() =>{
        it('should request network info', ()=>{
            var mac =  products.products[0].mac;
            var input = `reqNetwork ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
        it('should request network info with alias', ()=>{
            var mac =  products.products[0].mac;
            var input = `rn ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
    });
    
    describe('reqStatus <mac>',() =>{
        it('should request status info', ()=>{
            var mac =  products.products[0].mac;
            var input = `reqStatus ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
        it('should request status info with alias', ()=>{
            var mac =  products.products[0].mac;
            var input = `reqStatus ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
    });

    describe('reqGlobal <mac>',() =>{
        it('should request global info', ()=>{
            var mac =  products.products[0].mac;
            var input = `reqGlobal ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
        it('should request global info with alias', ()=>{
            var mac =  products.products[0].mac;
            var input = `rg ${mac}`;
            var spy =  sinon.spy(inputCommander, 'emitSendCommandEvent');             
            stdin.send(input);             
            sinon.assert.called(spy);           
        });
    });

    describe('getProduct <mac>',() =>{
        it('should get product', ()=>{
            var mac =  products.products[0].mac;
            var input = `getProduct ${mac}`;
            var spy =  sinon.spy(products, 'getProduct');             
            stdin.send(input);             
            sinon.assert.calledWithExactly(spy, mac);           
        });
        it('should get product with alias', ()=>{
            var mac =  products.products[0].mac;
            var input = `gp ${mac}`;
            var spy =  sinon.spy(products, 'getProduct');             
            stdin.send(input);             
            sinon.assert.calledWithExactly(spy, mac);     
            sinon.restore();       
        });
    });

    
    describe('list',() =>{
        it('should list the products', ()=>{            
            var input = `list`;
            var spy =  sinon.spy(products, 'printAllProducts');             
            stdin.send(input);             
            sinon.assert.calledWithExactly(spy);           
        });
        it('should list the products through alias', ()=>{            
            var input = `li`;
            var spy =  sinon.spy(products, 'printAllProducts');             
            stdin.send(input);             
            sinon.assert.calledWithExactly(spy);           
        });
        
    }); 
     /* 
     describe('setId <mac> <id>',() =>{
        it('should set product id', ()=>{
            var mac =  products.products[0].mac;
            var id = "alan";
            var input = `setId ${mac} ${id}`;
            var spy =  sinon.spy(products.products[0], 'setId');             
            stdin.send(input);             
            sinon.assert.called(spy, id);  
            sinon.restore();          
        });
        it('should set product id with alias', ()=>{
            var mac =  products.products[0].mac;
            var id = "ledsig1";
            var input = `si ${mac} ${id}`;
            var spy =  sinon.spy(products.products[0], 'setId');             
            stdin.send(input);             
            sinon.assert.called(spy, id);  
            sinon.restore();          
        });
    });
     
     describe('addProduct <mac> [id]',() =>{
          it('should add product without id', ()=>{
            var mac = '185D24679A12';           
            var input = `addProduct ${mac}`;
            var spy =  sinon.spy(products, 'addProductByMac');             
            stdin.send(input);             
            sinon.assert.calledWithExactly(spy, mac);   
            sinon.restore();        
        });  
          it('should add product with id', ()=>{
            var mac = '185D24679A14';
            var id = "ledsig2";
            var input = `addProduct ${mac} ${id}`;
            const aspy =  sinon.spy(products, 'addProductByMacAndId');             
            stdin.send(input);             
            sinon.assert.calledWithExactly(aspy, mac, id);           
        });
 
         it('should add product with id through alias', ()=>{
            var mac = '185D24679A14';
            var id = "ledsig2";
            var input = `ap ${mac} ${id}`;
            var spy =  sinon.spy(products, 'addProductbyMacAndId');             
            stdin.send(input);             
            sinon.assert.calledWithExactly(spy, mac, id);           
        });  
    });   */
}); 