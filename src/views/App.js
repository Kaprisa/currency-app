import React, { Component } from 'react';
import {connect} from 'react-redux'
import {
    getCurrencies,
    addCurrency,
    deleteCurrency,
    currenciesSelector
} from '../store/ducks/currency';

class App extends Component {
    state = {
        addingCurrency: false,
        symbol: ''
    };

    componentDidMount() {
        this.props.getCurrencies();
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
        const { deleteCurrency, currencies } = this.props;
        const { addingCurrency, symbol } = this.state;
        return (
            <div className="container">
                <div className="df aic jcc mb-1">
                    { !addingCurrency && <button className="button" onClick={this.toggle}>Добавить валюту</button> }
                    { addingCurrency && <div className="df aic jcc">
                        <input
                            type="text"
                            value={symbol}
                            className="input"
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
}, { getCurrencies, addCurrency, deleteCurrency })(App)
