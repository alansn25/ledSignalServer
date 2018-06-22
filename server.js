const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');



const publicPath = path.join(__dirname,'../public' );
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);


hhdhd
