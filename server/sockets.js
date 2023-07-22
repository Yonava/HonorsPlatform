const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
  cors: {
    origin: '*',
  }
})
const PORT = process.env.PORT || 3001

io.on('connection', socket => {

  console.log('Client connected')

  socket.on('disconnect', () => console.log('Client disconnected'))
  socket.on('identity', (data) => {
    console.log('client connected with profile data: ', JSON.stringify(data, null, 2))
  })
})

server.listen(PORT, () => {
  console.log(`Sockets listening on port ${PORT}`)
})