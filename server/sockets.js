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

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const index = connectedAccounts.findIndex(account => account.socketId === socket.id)
    if (index === -1) {
      return
    }
    console.log(`${connectedAccounts[index].name} (${connectedAccounts[index].socketId}) disconnected`)
    connectedAccounts.splice(index, 1)
    delete focusData[socket.id]
    io.emit('connectedAccounts', connectedAccounts)
  })

  socket.on('connectAccount', (googleAccountData) => {
    connectedAccounts.push({
      socketId: socket.id,
      ...googleAccountData
    })
    console.log(`${googleAccountData.name} (${socket.id}) connected`)
    console.log('connectedAccounts', connectedAccounts)
    io.emit('connectedAccounts', connectedAccounts)
    io.emit('userFocus', focusData)
  })

  socket.on('userAction', (data) => {
    socket.broadcast.emit('userAction', data)
  })

  socket.on('userFocus', (data) => {
    focusData[socket.id] = data
    io.emit('userFocus', focusData)
  })
})
