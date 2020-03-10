const axios = require('axios');
const money = require('money');

const RATES_URL = 'https://api.exchangeratesapi.io/latest';
const BLOCKCHAIN_URL = 'https://blockchain.info/ticker';
const CURRENCY_BITCOIN = 'BTC';

// Determines if any of the two currencies is CURRENCY_BITCOIN = 'BTC'
const isAnyBTC = (from, to) => [from, to].includes(CURRENCY_BITCOIN);

// Gets the current rate between two currencies
module.exports = async opts => {
  // destructure opts parameters, and create the result promise
  const {amount = 1, from = 'USD', to = CURRENCY_BITCOIN} = opts;
  const promises = [];
  let base = from;

  // We get whether we have 'BTC' in our currencies
  const anyBTC = isAnyBTC(from, to);

  if (anyBTC) {
    // If from is 'BTC', we change it to the to currency
    base = from === CURRENCY_BITCOIN ? to : from;
    promises.push(axios(BLOCKCHAIN_URL));
  }

  // We prepend at the begionning or the promises array the get request on the exchange rate
  promises.unshift(axios(`${RATES_URL}?base=${base}`));

  try {
    // Fetching responses and assinging it the money object
    const responses = await Promise.all(promises);
    const [rates] = responses;

    money.base = rates.data.base;
    money.rates = rates.data.rates;

    // Building conversion options
    const conversionOpts = {
      from,
      to
    };

    // Find blockchain data in response and change money rates with BTC field
    if (anyBTC) {
      const blockchain = responses.find(response =>
        response.data.hasOwnProperty(base)
      );

      Object.assign(money.rates, {
        'BTC': blockchain.data[base].last
      });
    }
    
    // Invert direction of conversion if we have 'BTC'
    if (anyBTC) {
      Object.assign(conversionOpts, {
        'from': to,
        'to': from
      });
    }

    // Converts the amount of 'from' to the amount of 'to'
    return money.convert(amount, conversionOpts);

    // Deal with error about not found currencies
  } catch (error) {
    throw new Error (
      '💵 Please specify a valid `from` and/or `to` currency value!'
    );
  }
};
