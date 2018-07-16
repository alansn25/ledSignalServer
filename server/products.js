const Joi = require('joi');
const fs = require('fs');
const _ = require ('lodash');
const events = require('events');
const {Product} = require('./product');
const eventEmitter = require('./event-emitter');

var fileName;
if(process.env.NODE_ENV==='test'){
    fileName = 'products-data.test.json';//better to create a file to test and another to run
}else{
    fileName = 'products-data.json';//better to create a file to test and another to run
}


/* const ledSchema = Joi.object().keys({    
    yellow: Joi.string().required().valid('on','off'),
    green: Joi.string().required().valid('on','off')
}); */

const productSchema = Joi.object().keys({
    mac: Joi.string().length(12).hex().required(),
    id: Joi.string(),
    active: Joi.string().valid('on','off'),    
});
         
class Products {
    constructor(){
        //super();
        this.products= []; 
        
        this.listenToWriteFile();
        //this.addProductByMacAndId=this.addProductByMacAndId.bind(this);
             
    };
     listenToWriteFile() {
        eventEmitter.on('writeFile', () => {
            this.writeProductsToFile((err)=>{                   
                if(err){
                    console.log(`Error writing to file: ${err}`);
                }else{
                    console.log(`Wrote to file successful.`);
                }
            });
        })
    }; 
    getFilename(){
        return fileName;
    };

    addProduct(mac, id=null) {       
        var product;
        var duplicateProducts;
        if(id){
            product = {
                mac,
                id
            };
            duplicateProducts = this.products.filter((product) => ((product.mac === mac)||(product.id === id)));
        }else{
            product = {
                mac
            };
            duplicateProducts = this.products.filter((product) => product.mac === mac);
        }                
        if (duplicateProducts.length === 0) {
            var result= Joi.validate(product, productSchema); 
            if(result.error===null){           
                var product=new Product(mac, id);
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
   
    getProduct (param) {
        return this.products.filter((product) => ((product.mac === param)||(product.id === param)))[0];
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
                
                mergedProducts.forEach((productArray)=>{
                    var product = new Product(productArray.mac,productArray.id);
                    this.products.push(product);
                });
                //this.products=mergedProducts;        
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