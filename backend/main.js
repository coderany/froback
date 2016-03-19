import path from 'path'
import http from 'http'
import express from 'express'
import socketIo from 'socket.io'
import {createStore} from 'redux'
import todoApp from '../frontend/reducers/index'
let store = createStore(todoApp)

let expressApp = express(),
  server = http.createServer(expressApp),
  io = socketIo(server),
  sockets = []

expressApp.use(express.static(path.join(__dirname, '../frontend')))


let app = require('./app')

module.hot.accept('./app', () => {
  app = require('./app')
})

io.on('connection', socket => {
  sockets.push(socket)

  socket.on('disconnect', () => {
    sockets = sockets.filter(s => s !== socket)
  })

  app.onConnection(store, socket)
  
  socket.on('action', (action)=> {
    app.onAction(store, socket, action)
  })
})

console.log("Listening on port 4000...")
server.listen(4000)


