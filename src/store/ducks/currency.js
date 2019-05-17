import axios from 'axios';
import {OrderedMap, Record} from 'immutable'
import {put, call, takeEvery, all} from 'redux-saga/effects'
import {API_BASE, API_KEY, BASE_CURRENCY} from '../../constants';
import {createSelector} from 'reselect'
import {mapDataToEntries} from '../utils'
import db, { CURRENCY_TABLE_NAME } from '../../modules/store/indexDb';

const CurrencyRecord = Record({
    id: null,
    symbol: '',
    value: 0
});

const ReducerState = Record({
    entities: new OrderedMap({}),
    loading: false,
    error: null
});

export const moduleName = 'currency';

export const ADD_CURRENCY_REQUEST = 'ADD_CURRENCY_REQUEST';
export const ADD_CURRENCY_SUCCESS = 'ADD_CURRENCY_SUCCESS';
export const DELETE_CURRENCY_REQUEST = 'DELETE_CURRENCY_REQUEST';
export const DELETE_CURRENCY_SUCCESS = 'DELETE_CURRENCY_SUCCESS';
export const GET_CURRENCIES_REQUEST = 'GET_ALL_CURRENCIES_REQUEST';
export const GET_CURRENCIES_SUCCESS = 'GET_CURRENCIES_SUCCESS';
export const GET_RATES_REQUEST = 'GET_RATES_REQUEST';
export const GET_RATES_SUCCESS = 'GET_RATES_SUCCESS';
export const ERROR = 'ERROR';

export default function reducer(state = new ReducerState(), action) {
    const {type, payload} = action;

    switch (type) {
        case ADD_CURRENCY_REQUEST:
        case GET_CURRENCIES_REQUEST:
            return state
                .set('loading', true)
                .set('error', null);
        case ADD_CURRENCY_SUCCESS:
            return state
                .set('loading', false)
                .set('error', null)
                .setIn(['entities', payload.id], new CurrencyRecord(payload));
        case DELETE_CURRENCY_SUCCESS:
            return state
                .set('loading', false)
                .set('error', null)
                .deleteIn(['entities', payload]);
        case GET_CURRENCIES_SUCCESS:
            return state
                .set('loading', false)
                .set('entities', mapDataToEntries(payload, CurrencyRecord));
        case GET_RATES_SUCCESS:
            Object.entries(payload)
                .forEach(([id, value]) => state = value === 0
                    ? state.deleteIn(['entities', id])
                    : state
                        .updateIn(
                            ['entities', id],
                            item => item.set('value', value)
                        )
                );
            return state;
        case ERROR:
            return state
                .set('loading', false)
                .set('error', payload);
        default:
            return state.set('error', null)
    }
}

export const getCurrencies = () => {
    return {
        type: GET_CURRENCIES_REQUEST,
    }
};

export function addCurrency(symbol) {
    return {
        type: ADD_CURRENCY_REQUEST,
        payload: { symbol }
    }
}

export function deleteCurrency(id) {
    return {
        type: DELETE_CURRENCY_REQUEST,
        payload: {id}
    }
}

export const getRates = (payload) => {
    return {
        type: GET_RATES_REQUEST,
        payload
    }
};

export const getCurrenciesSaga = function * () {
    try {
        const data = yield db.getAll(CURRENCY_TABLE_NAME);
        yield put({
            type: GET_CURRENCIES_SUCCESS,
            payload: data
        })
    } catch (error) {
        yield put({
            type: ERROR,
            payload: error
        })
    }
};

export const addCurrencySaga = function * (action) {
    let { symbol } = action.payload;
    if (!symbol.length || symbol === BASE_CURRENCY) return;
    symbol = symbol.toUpperCase();
    try {
        yield db.add(CURRENCY_TABLE_NAME, { id: symbol, symbol });
        yield put({
            type: ADD_CURRENCY_SUCCESS,
            payload: { id: symbol, symbol }
        })
    } catch (error) {
        yield put({
            type: ERROR,
            payload: error
        })
    }
};

export const deleteCurrencySaga = function * (action) {
    try {
        const { id } = action.payload;
        yield db.delete(CURRENCY_TABLE_NAME, id);
        yield put({
            type: DELETE_CURRENCY_SUCCESS,
            payload: id
        })
    } catch (e) {}
};

export const getRatesSaga = function * (action) {
    let currencies = action.payload;
    if  (Array.isArray(currencies)) {
        if (!currencies.length) {
            return
        }
    } else {
        currencies = [currencies]
    }
    const symbols = currencies.map((item) => item.id);
    try {
        const { data: { rates } } = yield call(axios.get, `${API_BASE}latest.json?app_id=${API_KEY}&symbols=${BASE_CURRENCY},${symbols.join(',')}`);
        yield put({
            type: GET_RATES_SUCCESS,
            payload: symbols.reduce((map, symbol) => Object.assign(
                map,
                {[symbol]: rates[symbol] ? Math.round((rates[BASE_CURRENCY] * 100) / rates[symbol]) / 100 : 0}),
                {}
            )
        })
    } catch (error) {
        yield put({
            type: ERROR,
            payload: error
        })
    }
};

export const saga = function * () {
    yield all([
        takeEvery(ADD_CURRENCY_REQUEST, addCurrencySaga),
        takeEvery(DELETE_CURRENCY_REQUEST, deleteCurrencySaga),
        takeEvery(GET_CURRENCIES_REQUEST, getCurrenciesSaga),
        takeEvery(GET_CURRENCIES_SUCCESS, getRatesSaga),
        takeEvery(ADD_CURRENCY_SUCCESS, getRatesSaga),
        takeEvery(GET_RATES_REQUEST, getRatesSaga),
    ])
};

export const stateSelector = state => state[moduleName];
export const entitiesSelector = createSelector(stateSelector, state => state.entities);
export const currenciesSelector = createSelector(entitiesSelector, entities => entities.valueSeq().toArray().map(item => item.toJS()));
