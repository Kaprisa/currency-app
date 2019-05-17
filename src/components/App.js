import React, { Component } from 'react';
import {connect} from 'react-redux'
import {
    getCurrencies,
    addCurrency,
    deleteCurrency,
    getRates,
    currenciesSelector,
} from '../store/ducks/currency';
import db from '../modules/store/indexDb';
import { RATES_UPDATE_INTERVAL } from '../constants';

class App extends Component {
    state = {
        addingCurrency: false,
        symbol: ''
    };

    async componentDidMount() {
        await db.connect();
        this.props.getCurrencies();
        setInterval(() => this.props.getRates(this.props.currencies), RATES_UPDATE_INTERVAL)
    };

    addCurrency = () => {
        const { addCurrency } = this.props;
        addCurrency(this.state.symbol);
        this.setState({
            symbol: '',
            addingCurrency: false
        });
    };

    toggle = () => {
        this.setState({ addingCurrency: !this.state.addingCurrency })
    };

    keyDownHandler = (event) => {
        if (event.keyCode === 13) {
            this.addCurrency(event.target.value);
        }
    };

    render() {
        const { deleteCurrency, getRates, currencies } = this.props;
        const { addingCurrency, symbol } = this.state;
        return (
            <div className="container">
                <button
                    className="button button--circle update-button"
                    onClick={() => getRates(currencies)}
                ><i className="material-icons">update</i></button>
                <div className="df aic jcc mb-1">
                    { !addingCurrency && <button className="button" onClick={this.toggle}>Add currency</button> }
                    { addingCurrency && <div className="df aic jcc">
                        <input
                            type="text"
                            value={symbol}
                            className="input"
                            placeholder="Symbol"
                            id="input"
                            onChange={e => this.setState({symbol: e.target.value})}
                            onKeyDown={this.keyDownHandler}
                        />
                        <button className="button" onClick={this.addCurrency}>ОК</button>
                    </div> }
                </div>
                <div>
                    <div className="df aic jcsa table__header">
                        <span>Symbol</span><span>Value</span><span>Delete</span>
                    </div>
                </div>
                <div className="table__wrapper">
                    <table className="table">
                        <tbody>
                        {currencies.map(currency => <tr key={currency.id}>
                            <td>{currency.symbol}</td>
                            <td>{currency.value}</td>
                            <td><i onClick={() => deleteCurrency(currency.id)} className="material-icons">delete</i></td>
                        </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default connect(state => {
    return {
        currencies: currenciesSelector(state)
    }
}, { getCurrencies, addCurrency, deleteCurrency, getRates })(App)
