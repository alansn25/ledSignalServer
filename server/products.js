//const fs = require('fs');

//var fileName = 'products-data.json'


class Products {
    constructor(){
        this.products= [];      
    }

    addProductByMac (mac) {       
        var product = {
          mac
        };
        var duplicateProducts = this.products.filter((product) => product.mac === mac);
              
        if (duplicateProducts.length === 0) {
          this.products.push(product);
           return product;
        }
    }

    addProductByMacAndId (mac, id) {
        var product = {
          mac,
          id          
        };
        var duplicateProducts = this.products.filter((product) => ((product.mac === mac)||(product.id === id)));
          
        if (duplicateProducts.length === 0) {
          this.products.push(product);
          return product;
        }
    }

    setProductId (mac, id) {
       
        var duplicateProducts = this.products.filter((product) => product.id === id);
          
        if (duplicateProducts.length === 0) {
            var filteredProducts = this.products.filter((product) => product.mac === mac);
            if (filteredProducts.length > 0) {
                filteredProducts[0].id = id;
                return filteredProducts[0];
            }
        }    
    }

    setProductLed (mac, led) {
        var filteredProducts = this.products.filter((product) => product.mac === mac);
        if (filteredProducts.length > 0) {
            filteredProducts[0].led = led;
            return filteredProducts[0];
        }
    }
    
    setProductFirmware (mac, firmware) {
        var filteredProducts = this.products.filter((product) => product.mac === mac);
        if (filteredProducts.length > 0) {
            filteredProducts[0].firmware = firmware;
            return filteredProducts[0];
        }
    }
    
    setProductStatus (mac, status) {
        var filteredProducts = this.products.filter((product) => product.mac === mac);
        if (filteredProducts.length > 0) {
            filteredProducts[0].status = status;
            return filteredProducts[0];
        }
    }
    
    setProductNetwork (mac, network) {
        var filteredProducts = this.products.filter((product) => product.mac === mac);
        if (filteredProducts.length > 0) {
            filteredProducts[0].network = network;
            return filteredProducts[0];
        }
    }

    getProductByMac (mac) {
        return this.products.filter((product) => product.mac === mac)[0];
    }
    
    getProductById (id) {        
        return this.products.filter((product) => product.id === id)[0];        
    }
    
    removeProductByMac (mac) {
        var product = this.getProductByMac(mac);
        if(product){
           this.products = this.products.filter((product) => product.mac !== mac);
        }
        return product;        
    }

    removeProductById (id) {
        var product = this.getProductById(id);
        if(product){
           this.products = this.products.filter((product) => product.id !== id);
        }
        return product;        
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