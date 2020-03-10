const currency = require('./');
const nock = require('nock');

beforeEach(() => {
  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=USD')
    .reply(200, {
      'base': 'USD',
      'rates': {
        'EUR': 0.899
      }
    });

  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=EUR')
    .reply(200, {
      'base': 'EUR',
      'rates': {
        'USD': 1.1122
      }
    });

  nock('https://blockchain.info')
    .get('/ticker')
    .reply(200, {
      'USD': {
        '15m': 8944.49,
        'last': 8944.49,
        'buy': 8944.49,
        'sell': 8944.49,
        'symbol': '$'
      },
      'EUR': {
        '15m': 8048.11,
        'last': 8048.11,
        'buy': 8048.11,
        'sell': 8048.11,
        'symbol': '€'
      }
    });
});

describe("currency", () => {
  test("should convert 1 USD to EUR", async () => {
    const amount = 1,
      from = "USD",
      to = "EUR";
    const opts = { amount, from, to };
    const result = await currency(opts);
    expect(result).toBe(0.899);
  });

  test("should convert 1 USD to USD", async () => {
    const amount = 1,
      from = "USD",
      to = "USD";
    const opts = { amount, from, to };
    const result = await currency(opts);
    expect(result).toBe(1);
  });

  test("should convert 1 EUR to USD", async () => {
    const amount = 1,
      from = "EUR",
      to = "USD";
    const opts = { amount, from, to };
    const result = await currency(opts);
    expect(result).toBe(1.1122);
  });

  test("should convert 1 BTC to USD", async () => {
    const amount = 1,
      from = "BTC",
      to = "USD";
    const opts = { amount, from, to };
    const result = await currency(opts);
    expect(result).toBe(8944.49);
  });

  test("should convert 1 BTC to EUR", async () => {
    const amount = 1,
      from = "BTC",
      to = "EUR";
    const opts = { amount, from, to };
    const result = await currency(opts);
    expect(result).toBe(8048.11);
  });

  test("should convert (with default values) without arguments", async () => {
    const opts = {};
    const result = await currency(opts);
    expect(result).toBe(0.00011180067281644902);
  });

  test("should convert with amount only as argument", async () => {
    const amount = 1;
    const opts = { amount };
    const result = await currency(opts);
    expect(result).toBe(0.00011180067281644902);
  });

  test("should convert with amount and (from) currency only as arguments", async () => {
    const amount = 1,
      from = "EUR";
    const opts = { amount, from };
    const result = await currency(opts);
    expect(result).toBe(0.0001242527748750949);
  });

  test("should return errors message for unknown `from` or `to` currency value", async () => {
    const amount = 1,
      from = "AIB",
      to = "IIINAB";
    const opts = { amount, from, to };
    try {
      await currency(opts);
    } catch (e) {
      error = e;
    }
    expect(error).toEqual(
      new Error("Unknown `from` or `to` currency value !")
    );
  });
});