import internalAxios from '../../modules/axios';
import axios from 'axios';
import {OrderedMap, Record} from 'immutable'
import {put, call, takeEvery, all} from 'redux-saga/effects'
import {API_BASE, API_KEY} from '../../constants';
import {createSelector} from 'reselect'
import {mapDataToEntries} from '../utils'

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
                .forEach(([id, value]) => state = state
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

export const getRates = () => {
    return {
        type: GET_RATES_REQUEST,
    }
};

export const getCurrenciesSaga = function * () {
    try {
        const {data} = yield call(internalAxios.get, `/currency`);
        yield put({
            type: GET_CURRENCIES_SUCCESS,
            payload: data
        })
    } catch (error) {
        yield put({
            type: ERROR,
            payload: error && error.response && error.response.data.message
        })
    }
};

export const addCurrencySaga = function * (action) {
    const { symbol } = action.payload;
    if (!symbol.length) return;
    try {
        const {data: id} = yield call(internalAxios.post, '/currency', action.payload);
        yield put({
            type: ADD_CURRENCY_SUCCESS,
            payload: { symbol, id }
        })
    } catch (error) {
        yield put({
            type: ERROR,
            payload: error && error.response && error.response.data.message
        })
    }
};

export const deleteCurrencySaga = function * (action) {
    try {
        const { id } = action.payload
        yield call(internalAxios.delete, `/currency/${id}`)
        yield put({
            type: DELETE_CURRENCY_SUCCESS,
            payload: id
        })
    } catch (e) {}
}

export const getRatesSaga = function * (action) {
    const currencies = action.payload;
    const symbols = (Array.isArray(currencies) ? currencies : [currencies]).reduce((map, item) => Object.assign(map, {[item.symbol]: item.id}), {});
    try {
        const { data } = yield call(axios.get, `${API_BASE}latest.json?app_id=${API_KEY}&symbols=${Object.keys(symbols).join(',')}`);
        yield put({
            type: GET_RATES_SUCCESS,
            payload: Object.entries(data.rates).reduce((map, [key, value]) => Object.assign(map, {[symbols[key]]: value}), {})
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
export const currenciesSelector = createSelector(entitiesSelector, entities => entities.valueSeq().toArray());
