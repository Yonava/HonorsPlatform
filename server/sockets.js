const { server } = require('./index.js')
const socketIO = require('socket.io')

const SOCKET_SERVER = process.env.NODE_ENV === 'production' ? server : 3001
const io = socketIO(SOCKET_SERVER, {
  cors: {
    origin: '*',
  }
})

console.log('Sockets Live!')

const connectedAccounts = []
const focusData = {}

io.on('connection', socket => {

  console.log('Client connected', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id)
    const index = connectedAccounts.findIndex(account => account.socketId === socket.id)
    if (index === -1) {
      return
    }
    connectedAccounts.splice(index, 1)
    io.emit('connectedAccounts', connectedAccounts)
  })

  socket.on('connectAccount', (googleAccountData) => {
    connectedAccounts.push({
      socketId: socket.id,
      ...googleAccountData
    })
    io.emit('connectedAccounts', connectedAccounts)
  })

  socket.on('userAction', (data) => {
    console.log('userAction', data)
    // data is {action: string, payload: object}
    socket.broadcast.emit('userAction', data)
  })

  socket.on('userFocus', (data) => {
    socket.broadcast.emit('userFocus', data)
  })
})
