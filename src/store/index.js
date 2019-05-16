import {createStore, applyMiddleware} from 'redux'
import reducer from './reducer'
import logger from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './saga'

const sagaMiddleware = createSagaMiddleware()
const enhancer = applyMiddleware(sagaMiddleware, logger)

const store = createStore(reducer, enhancer)
window.store = store

sagaMiddleware.run(rootSaga)

export default store