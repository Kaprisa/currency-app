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
                <div>
                    { !addingCurrency && <button onClick={this.toggle}>Добавить валюту</button> }
                    { addingCurrency && <div>
                        <input
                            type="text"
                            value={symbol}
                            onChange={e => this.setState({symbol: e.target.value})}
                            onKeyDown={this.keyDownHandler}
                        />
                        <button onClick={this.addCurrency}>ОК</button>
                    </div> }
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <td>Symbol</td>
                            <td>Value</td>
                            <td>Delete</td>
                        </tr>
                    </thead>
                    <tbody>
                        {currencies.map(currency => <tr key={currency.id}>
                            <td>{currency.symbol}</td>
                            <td>{currency.value}</td>
                            <td><i className="material-icons">delete</i></td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default connect(state => {
    return {
        currencies: currenciesSelector(state)
    }
}, { getCurrencies, addCurrency, deleteCurrency })(App)
