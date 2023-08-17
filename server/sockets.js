const { server } = require('./index.js')
const socketIO = require('socket.io')

const SOCKET_SERVER = process.env.NODE_ENV === 'production' ? server : 3001
const io = socketIO(SOCKET_SERVER, {
  cors: {
    origin: '*',
  }
})

console.log('Sockets Live!')

const connectedSockets = []
const focusData = {}
const lastUserAction = {
  time: null,
  // this helps determine if time is null because the server is down or because no user has done anything yet
  serverIsUp: false
}

io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    const index = connectedSockets.findIndex(account => account.socketId === socket.id)
    if (index === -1) {
      return
    }
    console.log(`${connectedSockets[index].name} (${connectedSockets[index].socketId}) disconnected`)
    connectedSockets.splice(index, 1)
    delete focusData[socket.id]
    io.emit('connectedSockets', connectedSockets)
  })

  socket.on('connectAccount', (joinData, callback) => {
    const { googleProfile, initialFocusState } = joinData
    connectedSockets.push({
      socketId: socket.id,
      ...googleProfile,
    })
    focusData[socket.id] = initialFocusState

    console.log(`${googleProfile.name} (${socket.id}) connected`)
    console.log('connectedSockets', connectedSockets)

    io.emit('connectedSockets', connectedSockets)
    io.emit('userFocus', focusData)
    io.emit('latestUserAction', lastUserAction)

    callback(lastUserAction)
    lastUserAction.serverIsUp = true
  })

  socket.on('userLogout', (googleId) => {
    socket.broadcast.emit('userLogout', googleId)
  })

  socket.on('userAction', (data) => {
    lastUserAction.time = new Date()
    lastUserAction.serverIsUp = true
    socket.broadcast.emit('userAction', data)
  })

  socket.on('userFocus', (data) => {
    focusData[socket.id] = data
    io.emit('userFocus', focusData)
  })

  socket.emit('latestUserAction', lastUserAction)
})
