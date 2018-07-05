const Joi = require('joi');
const fs = require('fs');
const _ = require ('lodash');

var fileName = 'products-data.json';//better to create a file to test and another to run

const ledSchema = Joi.object().keys({    
    yellow: Joi.string().required().valid('on','off'),
    green: Joi.string().required().valid('on','off')
});

const productSchema = Joi.object().keys({
    mac: Joi.string().length(12).hex().required(),
    id: Joi.string(),
    active: Joi.string().valid('on','off'),    
});

class Products {
    constructor(){
        this.products= [];      
    };
    
    addProductByMac (mac) {       
        var product = {
          mac
        };
        var result= Joi.validate(product, productSchema);        
        if(result.error===null){ 
            var duplicateProducts = this.products.filter((product) => product.mac === mac);
                
            if (duplicateProducts.length === 0) {
                this.products.push(product);
                this.writeProductsToFile((err)=>{                   
                    console.log(`Error writing to file: ${err}`);
                });
                return product;
            }
        }
    };

    addProductByMacAndId (mac, id) {
        var product = {
          mac,
          id          
        };
        var result= Joi.validate(product, productSchema);        
        if(result.error===null){
            var duplicateProducts = this.products.filter((product) => ((product.mac === mac)||(product.id === id)));
            
            if (duplicateProducts.length === 0) {
                this.products.push(product);
                this.writeProductsToFile((err)=>{                   
                    if(err){
                        console.log(`Error writing to file: ${err}`);
                    }else{
                        console.log(`Wrote to file successful. `);
                    }
                });
                return product;
            }
        }
    };

    setProductId (mac, id) {
       
        var duplicateProducts = this.products.filter((product) => product.id === id);
          
        if (duplicateProducts.length === 0) {
            var product = this.getProductByMac(mac);
            if(product){
                product.id = id;
                this.writeProductsToFile((err)=>{                   
                    if(err){
                        console.log(`Error writing to file: ${err}`);
                    }else{
                        console.log(`Wrote to file successful.`);
                    }
                });
                return product;
            }
        }    
    };

    setProductLed (mac, led) {
        var result = Joi.validate(led, ledSchema);        
        if(result.error===null){           
            var product = this.getProductByMac(mac);
            if(product){
                product.led = led;
                return product;
            }
        }
    };
    
    setProductFirmware (mac, firmware) {
        var product = this.getProductByMac(mac);
        if(product){
            product.firmware = firmware;
            return product;
        }
    };
    
    setProductStatus (mac, status) {
        var product = this.getProductByMac(mac);
        if(product){
            product.status = status;
            return product;
        }
    };
    
    setProductNetwork (mac, network) {
        var product = this.getProductByMac(mac);
        if(product){
            product.network = network;
            return product;
        }        
    };
    setProductGlobal(mac, global) {//not fastest because has to look up for the product 5 times but easier
        var product = this.getProductByMac(mac);
        if(product){
            if(global.led){
                this.setProductLed(mac, global.led);
            }
            if(global.firmware){
                this.setProductFirmware(mac, global.firmware);
            }
            if(global.status){
                this.setProductStatus(mac, global.status);
            }
            if(global.network){
                this.setProductNetwork(mac, global.network);
            }  
            return product;         
        }
    };
    setProductActive(mac, active){
        var result= Joi.validate(active, Joi.string().valid('on','off').required());        
        if(result.error===null){         
            var product = this.getProductByMac(mac);
            if(product){           
                product.active = active;
                return product;
            }
        }
    };
    
    isProductActive(mac){
        var product = this.getProductByMac(mac);
        if(product){
            if(product.active==='on'){
                return true;
            }else if(product.active==='off'){
                return false;
            }
        }
    };
    getProductByMac (mac) {
        return this.products.filter((product) => product.mac === mac)[0];
    };
    
    getProductById (id) {        
        return this.products.filter((product) => product.id === id)[0];        
    };
    
    removeProductByMac (mac) {
        var product = this.getProductByMac(mac);
        if(product){
           this.products = this.products.filter((product) => product.mac !== mac);
        }
        return product;        
    };

    removeProductById (id) {
        var product = this.getProductById(id);
        if(product){
           this.products = this.products.filter((product) => product.id !== id);
        }
        return product;        
    }; 

    writeProductsToFile (callback) {
        var mappedProducts=this.products.map((product) => {
            return { mac: product.mac, id: product.id};
        });
        fs.writeFile(fileName, JSON.stringify(mappedProducts),(err) => {
            callback(err);            
        });  
    };
    readProductsFromFile (callback) {
        fs.readFile(fileName, (err, data) => {
            if(!err){
                var readProducts = JSON.parse(data);                
                var mergedProducts = _.unionBy(this.products,readProducts,"mac");              
                this.products=mergedProducts;        
            }
            callback(err);
        });
    };
    printProduct(product){
        console.log('----Product----');
        console.log(JSON.stringify(product,undefined,2));
    } 
    printAllProducts(){
        console.log('----All Products----');
        console.log(JSON.stringify( this.products,undefined,2));
    } 

    
}

module.exports = {Products};

// class Person {
//     constructor(name, age){
//         //console.log(name, age);
//         this.name = name;
//         this.age = age;        
//     }

//     getUserDescription(){
//         return `${this.name} is ${this.age} year(s) old.`
//     }
// }

// var me = new Person('Alan', 23);
// var description = me.getUserDescription();
// console.log(description);
























/* var fetchProducts = () =>{
    try {
        var productsString = fs.readFileSync(fileName);
        return JSON.parse(productsString);
      } catch (e) {
        return [];
      }
};

var saveProducts = (products) => {
    fs.writeFileSync(fileName, JSON.stringify(products));
}; */

/* var addProductByMac = (mac) => {
    var products = fetchProducts();
    var product = {
      mac,
      id:'unknow',
      led:'unknow',
      firmware:'unknow',
      status:'unknow',
      network:'unknow',
    };
    var duplicateProducts = products.filter((product) => product.mac === mac);
  
    
    if (duplicateProducts.length === 0) {
      products.push(product);
      saveProducts(products);
      return product;
    }
}; */

/* var addProductByMacAndId = (mac, id) => {
    var products = fetchProducts();
    var product = {
      mac,
      id,
      led:'unknow',
      firmware:'unknow',
      status:'unknow',
      network:'unknow',
    };
    var duplicateProducts = products.filter((product) => ((product.mac === mac)||(product.id === id)));
      
    if (duplicateProducts.length === 0) {
      products.push(product);
      saveProducts(products);
      return product;
    }
}; */

/* var setProductId=(mac, id) =>{
    var products = fetchProducts();
    var duplicateProducts = products.filter((product) => product.id === id);
      
    if (duplicateProducts.length === 0) {
        var filteredProducts = products.filter((product) => product.mac === mac);
        if (filteredProducts.length > 0) {
            filteredProducts[0].id = id;
            saveProducts(products);
            return product;
        }
    }    
}; */


/* var setProductLed=(mac, led) =>{
    var products = fetchProducts();
    var filteredProducts = products.filter((product) => product.mac === mac);
    if (filteredProducts.length > 0) {
        filteredProducts[0].led = led;
        saveProducts(products);
        return product;
    }
};

var setProductFirmware=(mac, firmware) =>{
    var products = fetchProducts();
    var filteredProducts = products.filter((product) => product.mac === mac);
    if (filteredProducts.length > 0) {
        filteredProducts[0].firmware = firmware;
        saveProducts(products);
        return product;
    }
};

var setProductStatus=(mac, status) =>{
    var products = fetchProducts();
    var filteredProducts = products.filter((product) => product.mac === mac);
    if (filteredProducts.length > 0) {
        filteredProducts[0].status = status;
        saveProducts(products);
        return product;
    }
};

var setProductNetwork=(mac, network) =>{
    var products = fetchProducts();
    var filteredProducts = products.filter((product) => product.mac === mac);
    if (filteredProducts.length > 0) {
        filteredProducts[0].network = network;
        saveProducts(products);
        return product;
    }
}; */



/* 
var getAll=()=>{
    return fetchProducts();
};

var getProductByMac=(mac) =>{
    var products = fetchProducts();
    var filteredProducts = products.filter((product) => product.mac === mac);
    return filteredProducts[0];
};

var getProductById=(id) =>{
    var products = fetchProducts();
    var filteredProducts = products.filter((product) => product.id === id);
    return filteredProducts[0];
};

var removeProductByMac=(mac) =>{
   // console.log('Removing note: ', title);
    var products = fetchProducts();
    var filteredProducts = products.filter((product) => product.mac !== mac);
    saveProducts(filteredProducts);
    
    return products.length !== filteredProducts.length;
    
};

var removeProductById=(id) =>{
    // console.log('Removing note: ', title);
     var products = fetchProducts();
     var filteredProducts = products.filter((product) => product.id !== id);
     saveProducts(filteredProducts);
     
     return products.length !== filteredProducts.length;
     
 };

var logProduct=(product) =>{ 
    console.log('--' );
    console.log(`Title: ${product.mac}`);
    console.log(`Body: ${product.id}`);
};

module.exports ={
    addProduct : addProduct,
    getAll : getAll,
    getProductByMac : getProductByMac,
    removeProductByMac : removeProductByMac,
    logProduct : logProduct
}; */