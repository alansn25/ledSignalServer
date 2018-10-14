const Joi = require('joi');
const fs = require('fs');
const _ = require ('lodash');
const events = require('events');
const {Product} = require('./product');
const eventEmitter = require('./event-emitter');
const {Firmwares} = require('./firmwares');
const {Logging} =  require('./logging');
const path = require('path');

var fileName;
if(process.env.NODE_ENV==='test'){
    fileName =  path.join('products-data.test.json');//better to create a file to test and another to run
}else{
    fileName = path.join('products-data.json');//better to create a file to test and another to run
}
var logs = new Logging();

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

         this.readProductsFromFile((err)=>{                   
            if(err){
                //console.log(`Error reading from file: ${err}`);
                logs.logMessageInfo(`Error reading from file: ${err}`);
            }else{
                //console.log(`Read from file successfully.`);
                logs.logMessageInfo(`Read from file successfully`);
            }
        }); 

        this.firmwares= new Firmwares();
        
        this.listenToWriteFile();
        this.listenToNewProductMessage();
        this.listenToInfoRequest();       

               
             
    };

    listenToNewProductMessage(){
        eventEmitter.on('newProductMessage', (mac) => {
            logs.logReceiveEvent('products','newProductMessage', mac);
            var product = this.addProduct(mac); 
            if(product){
                eventEmitter.emit("newProduct", product);
                logs.logEmmitEvent('products',"newProduct", product);
            }
                
        });

    }
    listenToInfoRequest(){
        eventEmitter.on('infoRequest', (info) => {
            logs.logReceiveEvent('products','infoRequest', info);
            this.requestInfo(info);
        });

    }
     listenToWriteFile() {
        eventEmitter.on('writeFile', () => {
            logs.logReceiveEvent('products','writeFile', null);
            this.writeProductsToFile((err)=>{                   
                if(err){
                    //console.log(`Error writing to file: ${err}`);
                    logs.logMessageInfo(`Error writing to file: ${err}`);
                }else{
                    //console.log(`Wrote to file successfully.`);
                    logs.logMessageInfo(`Wrote to file successfully.`);
                }
            });
        })
    }; 
    emitInfoFeedbackEvent(error, infoRequest, feedback){
        eventEmitter.emit('infoRequestFeedback',error, infoRequest, feedback);
        logs.logInternalEmmitInfoRequestFeedbackEvent(error, infoRequest, feedback);
    }
    getFilename(){
        return fileName;
    };
    requestInfo(info){
        if(info.type){
            switch(info.type){
                case 'setId':                    
                if((info.mac)&&(info.id)){
                    var product = this.getProduct(info.mac);                   
                    if (product) {
                        var result= product.setId(info.id);
                        if(result) {
                            this.emitInfoFeedbackEvent(null, info, result);
                        }else{
                            this.emitInfoFeedbackEvent("The id was not set", info, null);
                        }                            
                    } else {
                        this.emitInfoFeedbackEvent("The product was not found", info, null);
                    } 
                }else{
                    this.emitInfoFeedbackEvent("Missing mac or id", info, null);
                } 
                break;
              case 'getProduct':              
                var result
                if(info.id){
                result = this.getProduct(info.id);
                }else{
                    if(info.mac){
                        result = this.getProduct(info.mac);
                    }
                }
                if (result) {
                    this.emitInfoFeedbackEvent(null, info, result); 
                } else {
                    this.emitInfoFeedbackEvent("Product not found", info, null);                    
                }                          
              break;
              case 'addProduct':                    
                if((info.mac)){
                    var result = this.addProduct(info.mac, info.id);                   
                    if (result) {
                        this.emitInfoFeedbackEvent(null, info, result);
                    } else {
                        this.emitInfoFeedbackEvent("The product was not added", info, null);
                    } 
                }else{
                    this.emitInfoFeedbackEvent("Missing mac", info, null);
                }                                           
              break;
              case 'list':                   
                this.emitInfoFeedbackEvent(null, info,  this.products);                                            
              break;
              case 'addFirmware':
                if(info.firmware){
                    var result = this.firmwares.addFirmware(info.firmware);
                    if(result.error===null){
                        this.emitInfoFeedbackEvent(null, info,  result.result);
                    }else{
                        this.emitInfoFeedbackEvent(result.error, info,  null);
                    }
                    
                }else{
                    this.emitInfoFeedbackEvent('There was no firmware on the request', info,  null);
                }                                                             
              break;
              case 'listFirmwares':                   
                this.emitInfoFeedbackEvent(null, info,  this.firmwares.firmwares);   
              break;
              case 'deleteFirmware':                   
                 if(info.version){
                    var result = this.firmwares.deleteFirmware(info.version);
                    if(result.error === null){
                        this.emitInfoFeedbackEvent(null, info,  result.result);
                    }else{
                        this.emitInfoFeedbackEvent(result.error, info,  null);
                    }
                 }else{
                    this.emitInfoFeedbackEvent('There was no version of the firmware on the request', info,  null);
                 }                                        
              break;
              case 'updateFirmware':                   
                if(info.firmware){
                    var result = this.firmwares.updateFirmware(info.firmware);
                    if(result.error===null){
                        this.emitInfoFeedbackEvent(null, info,  result.result);
                    }else{
                        this.emitInfoFeedbackEvent(result.error, info,  null);
                    }                    
                }else{
                    this.emitInfoFeedbackEvent('There was no firmware on the request', info,  null);
                }                                           
              break;
              case 'updateAllProducts':                   
                var result = this.updateAll();
                if(result.error===null){
                    this.emitInfoFeedbackEvent(null, info,  result.result);
                }else{
                    this.emitInfoFeedbackEvent(result.error, info,  null);
                }                                               
              break;
            }
        }    
    }
    updateAll(){
        var result = {};
        var lastFirmware = this.firmwares.getLastFirmware();
        if(lastFirmware.error = null){
            result.error = null;
            var firmwareCopy = Object.assign({}, lastFirmware.result);
            delete firmwareCopy.version;
            result.result = [];
            var filteredProducts = this.products.filter((product) => (product.isActive() === true));
            filteredProducts.forEach((product) =>{
                if(product.isFirmwareDifferent(lastFirmware.major, lastFirmware.minor, lastFirmware.revision)=== true){
                    product.sendFirmwareUpdate(firmwareCopy, 'updateAll');
                    result.result.push(product);
                }
            });
        }else{
            result.error = 'There was no firmware to update.';
        }       
    }
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
                        console.log(`Wrote to file successfully. `);
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
           this.writeProductsToFile((err)=>{                   
            if(err){
                console.log(`Error writing to file: ${err}`);
            }else{
                console.log(`Wrote to file successfully. `);
            }
        });
        }
        return product;        
    };

    removeProductById (id) {
        var product = this.getProductById(id);
        if(product){
           this.products = this.products.filter((product) => product.id !== id);
           this.writeProductsToFile((err)=>{                   
            if(err){
                console.log(`Error writing to file: ${err}`);
            }else{
                console.log(`Wrote to file successfully. `);
            }
        });
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


                var readProducts;
                try {
                    readProducts = JSON.parse(data);
                } catch (e) {
                    readProducts=[];
                }
                                
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
        console.log(JSON.stringify( product,(key,value)=>{
            if(key=="feedbackQueue") return undefined;
            else return value;
        },2));
    } 
    printAllProducts(){
        console.log('----All Products----');
        console.log(JSON.stringify( this.products,(key,value)=>{
            if(key=="feedbackQueue") return undefined;
            else return value;
        },2));
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