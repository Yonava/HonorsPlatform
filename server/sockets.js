const { server } = require('./index')

const SOCKET_SERVER = process.env.NODE_ENV === 'production' ? server : 3001
const io = module.exports.io = require('socket.io')(SOCKET_SERVER, {
  cors: {
    origin: "*"
  }
})

console.log('Socket server listening on port', SOCKET_SERVER)

io.on('connection', socket => {

  console.log('Client connected')

  socket.on('disconnect', () => console.log('Client disconnected'))
  socket.on('identity', (data) => {
    console.log('client connected with profile data: ', JSON.stringify(data, null, 2))
  })
})