import {combineReducers} from 'redux'
import currencyReducer, {moduleName as currencyModule} from './ducks/currency'

export default combineReducers({
    [currencyModule]: currencyReducer,
})