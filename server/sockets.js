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
const timeOfLastUserAction = {
  time: null,
  // this helps determine if time is null because the server is down or because no user has done anything yet
  serverIsUp: false
}

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

  socket.on('connectAccount', (joinData, callback) => {
    const { googleProfile, initialFocusState } = joinData
    connectedAccounts.push({
      socketId: socket.id,
      ...googleProfile,
    })
    focusData[socket.id] = initialFocusState

    console.log(`${googleProfile.name} (${socket.id}) connected`)
    console.log('connectedAccounts', connectedAccounts)

    io.emit('connectedAccounts', connectedAccounts)
    io.emit('userFocus', focusData)
    io.emit('latestUserAction', timeOfLastUserAction)

    callback(timeOfLastUserAction)
    timeOfLastUserAction.serverIsUp = true
  })

  socket.on('userLogout', (googleId) => {
    io.emit('userLogout', googleId)
  })

  socket.on('userAction', (data) => {
    timeOfLastUserAction.time = new Date()
    timeOfLastUserAction.serverIsUp = true
    socket.broadcast.emit('userAction', data)
  })

  socket.on('userFocus', (data) => {
    focusData[socket.id] = data
    io.emit('userFocus', focusData)
  })

  socket.emit('latestUserAction', timeOfLastUserAction)
})
