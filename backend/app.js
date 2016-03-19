export function onAction(store, socket, action) {
  const serverAction = {...action, fromServer: true}

  store.dispatch(action)

  socket.broadcast.emit('action', serverAction)
  socket.emit('action', serverAction)
}

export function onConnection(store, socket) {
  const state = store.getState()
  console.log('onConnection1', state)
  socket.emit('state', state)
}
