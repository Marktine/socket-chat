const socket = io();
const submitInputNode = document.getElementById('chatInput');
const chatListNode = document.getElementById('chatList');

function appendMessages(listNode, message) {
    const liNode = document.createElement('li');
    if (message) {
        liNode.innerText = message;
        listNode.appendChild(liNode);
    }
}

function chatTextChange() {
    return socket.emit('typing', { typing: true }, function(data) {
        console.log(data);
    });
}

$("#chatForm").submit(function(event) {
    const submitValues = $(this).serializeArray()[0];
    socket.emit('addMessage', { message: submitValues.value }, null);
    $('#chatInput').val('');
    event.preventDefault();
});

socket.on('someoneTyping', function(data) {
    const typingHolderNode = document.getElementById('typingHolder');
    if (data.typing) {
        typingHolderNode.innerText = "Someone is typing...";
    } else {
        typingHolderNode.innerText = '';
    }
});

socket.on('addMessage', function(data) {
    appendMessages(chatListNode, data.message);
})

socket.on('welcome', function(data) {
     if (data.code === 'SUCCESS' && data.prevMessages.length > 0) {
         data.prevMessages.forEach(message => {
             appendMessages(chatListNode, message);
         })
     }
    if (submitInputNode) {
        submitInputNode.onkeydown = chatTextChange; 
        submitInputNode.onkeyup = _.debounce(() => {
            socket.emit('typing', { typing: false  }, function(data) {
                console.log(data);
            }) 
        }, 500);
    }
});

socket.on('error', function(err) {
    if (err) {
        const errorTextNode = document.getElementById('errorText');
        errorTextNode.innerText = err;
    };
});

