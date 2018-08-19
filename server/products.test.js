const expect = require('expect');
const fs = require('fs');
const {Products} = require('./products');
const {Product} = require('./product');

//var fileName = 'products-data.json';// it has to get this from the file products.js instead of here, also better to create a file to test and another to run
var fileName;

describe('Products',() =>{
    var products;

    beforeEach(() =>{
        products = new Products();
        fileName = products.getFilename();
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


    describe('writeProductsToFile',() =>{
        /* it('should write products with only mac or/and id to file', (done)=>{
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
            //products.products = tempProducts;
            products.writeProductsToFile(()=>{
                fs.readFile(fileName, (err, data) => {
                    if(!err){
                        var readProducts = JSON.parse(data);
                        expect(readProducts).toEqual(products.products); 
                        done();             
                    }                   
                }); 
            });                      
        }); */

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
                new Product(localProducts.products[0].mac),
                new Product(localProducts.products[1].mac,localProducts.products[1].id),
                new Product(localProducts.products[2].mac,localProducts.products[2].id),
                new Product(localProducts.products[3].mac)
            ];
                /* {
                    mac: localProducts.products[0].mac,
                    eventQueue:[]
                },
                {
                    mac: localProducts.products[1].mac,
                    id: localProducts.products[1].id,
                    eventQueue:[]
                },
                {
                    mac: localProducts.products[2].mac,
                    id: localProducts.products[2].id,
                    eventQueue:[]
                },
                {
                    mac: localProducts.products[3].mac,
                    eventQueue:[]
                } */
            

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

    describe('addProduct',() =>{
        it('should add new product with only mac', ()=>{
            var products = new Products();
            var product = new Product('EF3456789ABC');

            var resUser = products.addProduct(product.mac);

            expect(products.products).toEqual([product]);
        });

        it('should not be able to add product with repeated mac', ()=>{
            var productMac = products.products[1].mac;
            var resProduct = products.addProduct(productMac);
            expect(resProduct).toBeFalsy(); 
        });

        it('should not be able to add product with mac with not hexadecimal number', ()=>{
            var productMac = 'EF345N789ABC';
            var resProduct = products.addProduct(productMac);
            expect(resProduct).toBeFalsy(); 
        });

        it('should not be able to add product with mac with lenght higher than 12', ()=>{
            var productMac = 'EF3456789ABC0';
            var resProduct = products.addProduct(productMac);
            expect(resProduct).toBeFalsy(); 
        });

        it('should not be able to add product with mac with lenght smaller than 12', ()=>{
            var productMac = 'EF345789ABC';
            var resProduct = products.addProduct(productMac);
            expect(resProduct).toBeFalsy(); 
        });
    
    
        it('should add new product by mac and id', ()=>{
            var products = new Products();
            var mac = '123456789004';
            var id = 'loja centro'; 
            var product = new Product(mac, id);           
               
            var resUser = products.addProduct(mac, id);
            expect(products.products).toEqual([product]);
        });

        it('should not be able to add product by mac and id with repeated mac and different id', ()=>{
            var productMac = products.products[1].mac;
            var productId = products.products[1].id+'haskdjas';
            
            var resProduct = products.addProduct(productMac,productId);
            expect(resProduct).toBeFalsy(); 
        });

        it('should not be able to add product by mac and id with repeated id and different mac', ()=>{
            var productMac = '123456789032';
            var productId = products.products[1].id;
            var resProduct = products.addProduct(productMac,productId);
            expect(resProduct).toBeFalsy(); 
        });
        it('should not be able to add product by mac and id with repeated id and repeated mac', ()=>{
            var productMac = products.products[1].mac;
            var productId = products.products[1].id;
            var resProduct = products.addProduct(productMac,productId);
            expect(resProduct).toBeFalsy(); 
        });
    });
});
    

    
    
    
    describe('getProduct',() =>{
        it('should get the product by mac', ()=>{
            var productMac = products.products[1].mac;
            var resProduct = products.getProduct(productMac);
            expect(products.products[1]).toEqual(resProduct); 
        });

        it('should not be able to get the product by mac with the wrong mac', ()=>{
            var productMac = '123456789072';
            var resProduct = products.getProduct(productMac);
            expect(resProduct).toBeFalsy();             
        });
        it('should get the product by id', ()=>{
            var productId = products.products[1].id;
            var resProduct = products.getProduct(productId);
            expect(products.products[1]).toEqual(resProduct); 
        });

        it('should not be able to get the product by id with the wrong id', ()=>{
            var productId = products.products[1].id+'oashdas';
            var resProduct = products.getProduct(productId);
            expect(resProduct).toBeFalsy(); 
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
            //expect(products.products.length).toBe(previousLength-1);
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
            //expect(products.products.length).toBe(previousLength-1);
        });
        it('should not remove a product by id  with wrong id', ()=>{
            var productId = products.products[1].id+'sfddfsdf';
            var previousLength = products.products.length
            var removedProduct = products.removeProductById(productId);   
            expect(removedProduct).toBeFalsy();        
            expect(products.products.length).toBe(previousLength);
        });
    });   



