const _ = require('lodash');
const yargs = require('yargs');
const express = require('express');

const port = process.env.PORT || 3000;

const http = require('http');
const path = require('path');
const socketIO = require('socket.io');



const publicPath = path.join(__dirname,'../public' );

var app = express();
var server = http.createServer(app);
var io = socketIO(server);




app.listen(port, () =>{
    console.log(`Server is up on port ${port}`);
})