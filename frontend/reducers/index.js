import { combineReducers } from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'

const appReducer = combineReducers({
  todos,
  visibilityFilter
})



export default function rootReducer(state, action){
  if(action && action.type === 'REPLACE_STATE'){
    return action.state
  }
  
  return appReducer(state, action)
}
