const expect = require('expect');
const fs = require('fs');
const {Products} = require('./products');
var fileName = 'products-data.json';// it has to get this from the file products.js instead of here, also better to create a file to test and another to run


describe('Product',() =>{
    var products;

    beforeEach(() =>{
        products = new Products();
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
    });


    describe('writeProductsToFile',() =>{
        it('should write products with only mac or/and id to file', (done)=>{
            var tempProducts = [
                {
                    mac: products.products[0].mac
                },
                {
                    mac: products.products[1].mac,
                    id: products.products[1].id
                },
                {
                    mac: products.products[2].mac,
                    id: products.products[2].id
                },
                {
                    mac: products.products[3].mac,
                }
            ];
            products.products = tempProducts;
            products.writeProductsToFile(()=>{
                fs.readFile(fileName, (err, data) => {
                    if(!err){
                        var readProducts = JSON.parse(data);
                        expect(readProducts).toEqual(products.products); 
                        done();             
                    }                   
                }); 
            });                      
        });

        it('should write products to file without any properties other than mac and id', (done)=>{
            var shouldBeProducts = [
                {
                    mac: products.products[0].mac
                },
                {
                    mac: products.products[1].mac,
                    id: products.products[1].id
                },
                {
                    mac: products.products[2].mac,
                    id: products.products[2].id
                },
                {
                    mac: products.products[3].mac,
                }
            ];
            products.writeProductsToFile(()=>{
                fs.readFile(fileName, (err, data) => {
                    if(!err){
                        var readProducts = JSON.parse(data);
                        expect(readProducts).toEqual(shouldBeProducts); 
                        done();             
                    }                   
                });  
            });                    
        });
        

    });
    describe('readProductsFromFile',() =>{
        it('should read products from file', (done)=>{
            var localProducts = new Products();
            localProducts.products = products.products;
            var shouldBeProducts = [
                {
                    mac: localProducts.products[0].mac
                },
                {
                    mac: localProducts.products[1].mac,
                    id: localProducts.products[1].id
                },
                {
                    mac: localProducts.products[2].mac,
                    id: localProducts.products[2].id
                },
                {
                    mac: localProducts.products[3].mac,
                }
            ];

            localProducts.writeProductsToFile(()=>{
                localProducts.products = [];
                localProducts.readProductsFromFile(()=>{
                    expect(localProducts.products).toEqual(shouldBeProducts);
                    done();
                }); 
            });            
        });

        it('should read products from file and merge with the products array', (done)=>{
            var localProducts = new Products();
            localProducts.products = products.products;
            var currentProducts=localProducts.products;
            localProducts.writeProductsToFile(()=>{
                localProducts.readProductsFromFile((err)=>{                   
                    expect(localProducts.products).toEqual(currentProducts);
                    done();
                }); 
            });            
        });
    });

    describe('addProductByMac',() =>{
        it('should add new product by mac', ()=>{
            var products = new Products();
            var product = {
                mac:'EF3456789ABC'                
            };
            var resUser = products.addProductByMac(product.mac);

            expect(products.products).toEqual([product]);
        });

        it('should not be able to add product with repeated mac', ()=>{
            var productMac = products.products[1].mac;
            var resProduct = products.addProductByMac(productMac);
            expect(resProduct).toBeFalsy(); 
        });

        it('should not be able to add product with mac with not hexadecimal number', ()=>{
            var productMac = 'EF345N789ABC';
            var resProduct = products.addProductByMac(productMac);
            expect(resProduct).toBeFalsy(); 
        });

        it('should not be able to add product with mac with lenght higher than 12', ()=>{
            var productMac = 'EF3456789ABC0';
            var resProduct = products.addProductByMac(productMac);
            expect(resProduct).toBeFalsy(); 
        });

        it('should not be able to add product with mac with lenght smaller than 12', ()=>{
            var productMac = 'EF345789ABC';
            var resProduct = products.addProductByMac(productMac);
            expect(resProduct).toBeFalsy(); 
        });
    });
    describe('addProductByMacAndId',() =>{
        it('should add new product by mac and id', ()=>{
            var products = new Products();
            var product = {
                mac:'123456789004',
                id:'loja centro'                
            };
            var resUser = products.addProductByMacAndId(product.mac, product.id);
            expect(products.products).toEqual([product]);
        });

        it('should not be able to add product by mac and id with repeated mac and different id', ()=>{
            var productMac = products.products[1].mac;
            var productId = products.products[1].id+'haskdjas';
            var resProduct = products.addProductByMacAndId(productMac,productId);
            expect(resProduct).toBeFalsy(); 
        });

        it('should not be able to add product by mac and id with repeated id and different mac', ()=>{
            var productMac = '123456789032';
            var productId = products.products[1].id;
            var resProduct = products.addProductByMacAndId(productMac,productId);
            expect(resProduct).toBeFalsy(); 
        });
        it('should not be able to add product by mac and id with repeated id and repeated mac', ()=>{
            var productMac = products.products[1].mac;
            var productId = products.products[1].id;
            var resProduct = products.addProductByMacAndId(productMac,productId);
            expect(resProduct).toBeFalsy(); 
        });
    });
    describe('setProductId',() =>{
        it('should set a product id', ()=>{
            var productMac = products.products[1].mac;
            var myId = 'the id i want';
            var resProduct = products.setProductId(productMac,myId);
            expect(products.products[1].id).toEqual(myId);        
        });

        it('should not be able to set a product id with wrong mac', ()=>{
            var productMac = products.products[1].mac+'abcdedfgsdg';
            var myId = 'the id i want';
            var resProduct = products.setProductId(productMac,myId);
            expect(resProduct).toBeFalsy();         
        });

        it('should not be able to set a repeated product id', ()=>{
            var productMac = products.products[1].mac;
            var myId = products.products[1].id;
            var resProduct = products.setProductId(productMac,myId);
            expect(resProduct).toBeFalsy();         
        }); 
    });
    describe('setProductLed',() =>{
        it('should set product led', ()=>{
            var productMac = products.products[1].mac;
            var productLed = {
                yellow:'on',
                green:'off'                
            };
            var resProduct = products.setProductLed(productMac,productLed);
            expect(products.products[1].led).toEqual(productLed); 
            expect(resProduct.led).toEqual(productLed);        
        });

        it('should not set product led with wrong value', ()=>{
            var currentProduct = products.products[1];
            var productMac = currentProduct.mac;
            var productLed = {
                yellow:'On',
                green:'Off'                
            };
            var resProduct = products.setProductLed(productMac,productLed);
            expect(products.products[1]).toEqual(currentProduct); 
            expect(resProduct).toBeFalsy();        
        });
    });

    describe('setProductFirmware',() =>{
        it('should set product firmware', ()=>{
            var productMac = products.products[1].mac;
            var productFirmware = {
                major:0,
                minor:1,
                rev:5,
                build:1806231907,
                bin:2
            };
            var resProduct = products.setProductFirmware(productMac,productFirmware);
            expect(products.products[1].firmware).toEqual(productFirmware); 
            expect(resProduct.firmware).toEqual(productFirmware);        
        });        
    });

    describe('setProductStatus',() =>{
        it('should set product firmware', ()=>{
            var productMac = products.products[1].mac;
            var productStatus = {
                mem:35808,
                rst_cause:6
            };
            var resProduct = products.setProductStatus(productMac,productStatus);
            expect(products.products[1].status).toEqual(productStatus); 
            expect(resProduct.status).toEqual(productStatus);        
        }); 
    });

    describe('setProductNetwork',() =>{
        it('should set product network', ()=>{
            var productMac = products.products[1].mac;
            var productNetwork = {
                ssid:"JEAD",
                bssid:"B0487AC69B9C",
                ch:6,
                ip:"192.168.1.127",
                mask:"255.255.255.0",
                gw:"192.168.1.1"
            };
            var resProduct = products.setProductNetwork(productMac,productNetwork);
            expect(products.products[1].network).toEqual(productNetwork); 
            expect(resProduct.network).toEqual(productNetwork);        
        });
    });

    describe('setProductActive',() =>{
        it('should set product active on', ()=>{
            var productMac = products.products[1].mac;
            var productActive = 'on';
            var resProduct = products.setProductActive(productMac,productActive);
            expect(products.products[1].active).toEqual(productActive); 
            expect(resProduct.active).toEqual(productActive);        
        });

        it('should set product active off', ()=>{
            var productMac = products.products[1].mac;
            var productActive = 'off';
            var resProduct = products.setProductActive(productMac,productActive);
            expect(products.products[1].active).toEqual(productActive); 
            expect(resProduct.active).toEqual(productActive);        
        });

        it('should not be able to set product active with wrong value', ()=>{
            var currentProduct = products.products[1];
            var productMac = currentProduct.mac;
            var productActive = 'On';
            var resProduct = products.setProductActive(productMac,productActive);
            expect(products.products[1]).toEqual(currentProduct); 
            expect(resProduct).toBeFalsy();        
        });
    });

    describe('isProductActive',() =>{
        it('should get true if the product is active', ()=>{
            var productMac = products.products[1].mac;           
            var resProduct = products.setProductActive(productMac,'on');
            var res = products.isProductActive(productMac);
            expect(res).toEqual(true);             
        });

        it('should get false if the product is not active', ()=>{
            var productMac = products.products[1].mac;           
            var resProduct = products.setProductActive(productMac,'off');
            var res = products.isProductActive(productMac);
            expect(res).toEqual(false); 
        }); 
        
        it('should get null if the product does not have the active property', ()=>{
            var productMac = products.products[1].mac;           
            var resProduct = products.setProductActive(productMac,'Off');
            var res = products.isProductActive(productMac);
            expect(res).toEqual(undefined); 
        });
    });

    describe('getProductByMac',() =>{
        it('should get the product by mac', ()=>{
            var productMac = products.products[1].mac;
            var resProduct = products.getProductByMac(productMac);
            expect(products.products[1]).toEqual(resProduct); 
        });

        it('should not be able to get the product by mac with the wrong mac', ()=>{
            var productMac = '123456789072';
            var resProduct = products.getProductByMac(productMac);
            expect(resProduct).toBeFalsy(); 
        });
    });

    describe('getProductById',() =>{
        it('should get the product by id', ()=>{
            var productId = products.products[1].id;
            var resProduct = products.getProductById(productId);
            expect(products.products[1]).toEqual(resProduct); 
        });

        it('should not be able to get the product by id with the wrong id', ()=>{
            var productId = products.products[1].id+'oashdas';
            var resProduct = products.getProductById(productId);
            expect(resProduct).toBeFalsy(); 
        });
    });

    describe('removeProductByMac',() =>{
        it('should remove a product by mac', ()=>{
            var productMac = products.products[1].mac;
            var previousLength = products.products.length
            var removedProduct = products.removeProductByMac(productMac);   
            expect(removedProduct.mac).toBe(productMac);        
            expect(products.products).not.toContain(removedProduct);
            expect(products.products.length).toBe(previousLength-1);
        });
        it('should not remove a product by mac with wrong mac', ()=>{
            var productMac = '123456789077';
            var previousLength = products.products.length
            var removedProduct = products.removeProductByMac(productMac);   
            expect(removedProduct).toBeFalsy();        
            expect(products.products.length).toBe(previousLength);
        });
    });

    describe('removeProductById',() =>{
        it('should remove a product by id', ()=>{
            var productId = products.products[1].id;
            var previousLength = products.products.length
            var removedProduct = products.removeProductById(productId);   
            expect(removedProduct.id).toBe(productId);        
            expect(products.products).not.toContain(removedProduct);
            expect(products.products.length).toBe(previousLength-1);
        });
        it('should not remove a product by id  with wrong id', ()=>{
            var productId = products.products[1].id+'sfddfsdf';
            var previousLength = products.products.length
            var removedProduct = products.removeProductById(productId);   
            expect(removedProduct).toBeFalsy();        
            expect(products.products.length).toBe(previousLength);
        });
    });

    




/* 
    it('should remove a user', ()=>{
        var userId = users.users[1].id;
        var previousLength = users.users.length
        var removedUser = users.removeUser(userId);   
        expect(removedUser.id).toBe(userId);        
        expect(users.users).toNotContain(removedUser);
        expect(users.users.length).toBe(previousLength-1);
    });

    it('should not remove a user', ()=>{
        var userId = '99';
        var previousLength = users.users.length
        var removedUser = users.removeUser(userId);   
        expect(removedUser).toNotExist();        
        expect(users.users.length).toBe(previousLength);
    });

    it('should find user', ()=>{
        var foundUser = users.getUser(users.users[1].id);

        expect(users.users[1]).toEqual(foundUser);
    });

    it('should not find user', ()=>{
        var foundUser = users.getUser('99');

        expect(foundUser).toNotExist();
    });

    
    it('should return names for node course', ()=>{
        var userList = users.getUserList('Node Course');

        expect(userList).toEqual(['Alan', 'Julie']);
        
    });

    it('should return names for react course', ()=>{
        var userList = users.getUserList('React Course');

        expect(userList).toEqual(['Bruna']);
        
    }); */
});