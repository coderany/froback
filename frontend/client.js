let
  _socket,
  _store

export function register(socket, store) {
  _socket = socket
  _store = store

  socket.on('action', onAction)
  socket.on('state', onState)
}

export function unRegister() {
  _socket.removeListener('action', onAction)
  _socket = undefined
}

function onAction(action) {
  console.log('action from server', action)
  _store.dispatch(action)
}

function onState(state) {
  console.log('initialState from server', state)
  _store.dispatch({
    type: 'REPLACE_STATE',
    state
  })
}

