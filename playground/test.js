const _ = require ('lodash');
var array = [1,2,3,4];
var result = _.remove(array, (element)=>element === 5);  
var test2=1;



console.log(`Array:${array}`);
console.log(`Result:${result}`);
console.log(`result.length:${result.length}`);
console.log(`result[0]:${result[0]}`);
/* 
if(result.length > 0){
    console.log(`True`);
}else{
    console.log(`False`);
} */
if(test2){
    console.log(`True`);
}else{
    console.log(`False`);
}