const express = require('express');
const mqtt = require('mqtt');

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');
const port = process.env.PORT || 3000;
var app = express();
app.get('/',(req, res)=>{
   res.send('hello'); 
  
});

app.

app.listen(port, ()=>{
    console.log(`Server is up on the port ${port}`);
});

/*var state = {LEDG: 'off', LEDY: 'off'};
var topicPrefix = 'jkldd684hsg26os';
var topicID = '0001';

mqttClient.on('connect', () => {
    mqttClient.subscribe(`${topicPrefix}/${topicID}/command`);


    // Inform controllers that garage is connected
    mqttClient.publish(`${topicPrefix}/${topicID}/connected`, 'true');
    sendUpdatedSate();
});


mqttClient.on('message', (topic, message) => {
    console.log(`Recceiving Message: Topic=${topic} Message=${message}`);
});

function sendUpdatedSate () {
    console.log(`sending state: ${JSON.stringify(state)}`);
    mqttClient.publish(`${topicPrefix}/${topicID}/state`, JSON.stringify(state));
};*/

/**
 * Want to notify controller that garage is disconnected before shutting down
 */
/*function handleAppExit (options, err) {
    if (err) {
      console.log(err.stack)
    }
  
    if (options.cleanup) {
        mqttClient.publish(`${topicPrefix}/${topicID}/connected`, 'false');
    }
  
    if (options.exit) {
      process.exit();
    };
}*/
  
  /**
   * Handle the different ways an application can shutdown
   */
 /* process.on('exit', handleAppExit.bind(null, {
    cleanup: true
  }));
  process.on('SIGINT', handleAppExit.bind(null, {
    exit: true
  }));
  process.on('uncaughtException', handleAppExit.bind(null, {
    exit: true
  }));*/