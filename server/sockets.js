const { server } = require('./index.js')
const socketIO = require('socket.io')

const SOCKET_SERVER = process.env.NODE_ENV === 'production' ? server : 3001
const io = socketIO(SOCKET_SERVER, {
  cors: {
    origin: '*',
  }
})

console.log('Sockets Live!')

io.on('connection', socket => {

  console.log('Client connected')

  socket.on('disconnect', () => console.log('Client disconnected'))
  socket.on('identity', (data) => {
    console.log('client connected with profile data: ', JSON.stringify(data, null, 2))
    // broadcast to all clients
    io.emit('identity', data)
  })
})
