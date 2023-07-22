const { server } = require('./index.js')
const socketIO = require('socket.io')

const SOCKET_SERVER = process.env.NODE_ENV === 'production' ? server : 3001
const io = socketIO(SOCKET_SERVER, {
  cors: {
    origin: '*',
  }
})

console.log('Sockets Live!')
console.log('Socket Server: ', SOCKET_SERVER)

io.on('connection', socket => {

  console.log('Client connected')

  socket.on('disconnect', () => console.log('Client disconnected'))
  socket.on('identity', (data) => {
    console.log('client connected with profile data: ', JSON.stringify(data, null, 2))
  })
})
