const mqtt = require('mqtt');



const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

var topicPrefix = 'jkldd684hsg26os';
var topicID =  Math.round(Math.random()*1000);
var cont=0;

mqttClient.on('connect', () => {
    mqttClient.subscribe(`${topicPrefix}/${topicID}/command`);
    console.log(`Subscribed to ${topicPrefix}/${topicID}/command`);
    mqttClient.publish(`${topicPrefix}/${topicID}/connected`, 'true');
    
});

mqttClient.on('message', (topic, message) => {
    console.log(`Received message: Topic=${topic} Message=${message}`);            
});

function publishMQTTMessage (msg) {
    console.log(`Message:${msg}  Topic:${topicPrefix}/${topicID}/state`);
    mqttClient.publish(`${topicPrefix}/${topicID}/state`, msg);   
  };

  setInterval(() => {
    cont++;
    publishMQTTMessage(`Message number ${cont}`)
  }, 5000); 

  /**
 * Want to notify controller that garage is disconnected before shutting down
 */
function handleAppExit (options, err) {
    if (err) {
      console.log(err.stack);
    }
  
    if (options.cleanup) {
        mqttClient.publish(`${topicPrefix}/${topicID}/connected`, 'false');
    }
  
    if (options.exit) {
      process.exit();
    }
  };
  
  /**
   * Handle the different ways an application can shutdown
   */
  process.on('exit', handleAppExit.bind(null, {
    cleanup: true
  }));
  process.on('SIGINT', handleAppExit.bind(null, {
    exit: true
  }));
  process.on('uncaughtException', handleAppExit.bind(null, {
    exit: true
  }));