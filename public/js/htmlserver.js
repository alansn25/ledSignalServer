var socket = io();

function scrollToBottom () {
    //Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');
    //Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
        //console.log('Should scroll');
        messages.scrollTop(scrollHeight);
    }

}

socket.on('receivedMQTTMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('HH:mm:ss:SSS');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: message.message,
        from: message.topic,
        createdAt: formattedTime
        });

        jQuery('#messages').append(html);
        scrollToBottom();
        //scrollToBottom();
    
    
    // //console.log('newMessage', message);
    // var formattedTime = moment(message.createdAt).format('h:mm a');
    // var li = jQuery('<li></li>');
    // var a = jQuery('<a target="_blank">My current location</a>');
    // li.text(`${message.from} ${formattedTime}: `);
    // a.attr('href', message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
});
socket.on('subscribed', function (topic) {
    var template = jQuery('[name="subscribed_topic"]').html();
    var html = Mustache.render(template, {
        topic: topic.topic
        });
        jQuery('[name="subscribed_topic"]').html(html);
console.log(`Subscribed:${topic.topic}`);
});


jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
    
    var messageTextbox = jQuery('[name="message"]');
    var idTextbox = jQuery('[name="client_id"]');

    socket.emit('publishMQTTMessage', {
        message: messageTextbox.val(),
        id: idTextbox.val(),
   });

    console.log(`Message Sent-id:${idTextbox.val()} message:${messageTextbox.val()}`);
});