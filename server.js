const whitelist = ['http://192.168.112.201:30002', 'http://localhost:30002'];
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if(whitelist.includes(origin) || !origin)
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
};
var socketOptions = {
        origins: '*:*',
        pingTimeout: 9000,
        pingInterval: 3000,
        cookie: 'mycookie',
        allowUpgrades: true,
        httpCompression: true,
        transports: [ 'polling', 'websocket' ],
};
const PORT = process.env.PORT || 30002;

const express = require('express');
const cors = require('cors');
const path = require('path');
const Memcached = require('memcached');
const app = express();
app.use(cors(corsOptions));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", 'http://192.168.112.201:30002');  
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers",
'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization');
  next();
});

const server = app.listen(PORT, function() {
    console.log('listening on PORT:' + PORT);
});

const io = require('socket.io')(server, socketOptions);

const memcached = new Memcached('localhost:11211');
const messages = [];

app.use('/js', express.static(path.join(__dirname, 'statics/js')));
app.use('/css', express.static(path.join(__dirname, 'statics/css')));
app.use('/assets', express.static(path.join(__dirname, 'statics/assets')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'statics/html/index.html'));
});

app.get('/chat', function(req, res) {
    res.sendFile(path.join(__dirname, 'statics/html/chat.html'));
})

io.on('connection', (socket) => {
    try {
        memcached.get('chatMessages', function(err, cachedMessages) {
            if (cachedMessages && typeof cachedMessages !== 'undefined') {
                messages.concat(cachedMessages.split(','));
            }
            let token = socket.handshake.query.token;
            socket.on('typing', function(data) {
                return socket.broadcast.emit('someoneTyping', { typing: data.typing });
            });
            socket.on('addMessage', function(data) {
                if (data.message) {
                    messages.push(data.message);
                    if (!cachedMessages || typeof cachedMessages === 'undefined') {
                        memcached.set('chatMessages', messages.join(','), 3600, function(err) {});
                    } else {
                        console.log(messages);
                        memcached.replace('chatMessages', messages.join(','), 3600, function(err){});
                    }
                    return io.emit('addMessage', { message: data.message, });     
                }
            });
            return socket.emit('welcome', {
                code: 'SUCCESS',
                prevMessages: cachedMessages ? cachedMessages.split(',') : [],
            });    
        });
    } catch (err) {
        return socket.emit('error', err.message);
    }
});

