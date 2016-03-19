import 'babel-polyfill'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, compose, applyMiddleware} from 'redux'
import todoApp from './reducers/index'
import App from './components/App'


const
  broadcastMiddleware = ({getState}) => (next) => (action) => {
    if (!action.fromServer) {
      socket.emit('action', action)
      return p => p
    }
    return next(action)
  },
  finalCreateStore = compose(
    applyMiddleware(broadcastMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )(createStore)

let store = finalCreateStore(todoApp)


module.hot.accept('./reducers/index', () => {
  const nextReducer = require('./reducers/index').default
  store.replaceReducer(nextReducer)
})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)



var socket = io.connect('http://localhost:4000', {
  reconnection: false
})

let client = require('./client')

socket.on('connect', () => {
  client.register(socket, store)

  module.hot.accept('./client', () => {
    client.unRegister()
    client = require('./client')
    client.register(socket, store)
  })
})


