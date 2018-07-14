/* describe('Server.js',() =>{
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


    describe('reqLed <mac>',() =>{
        it('should request Led status when commanded', (done)=>{
            var command = 
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
    });
}); */