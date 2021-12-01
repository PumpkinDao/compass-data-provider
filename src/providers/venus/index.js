const fetch = require('node-fetch');

const URL = 'https://api.venus.io/api/governance/venus';

const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

const run = async () => {
  const resp = await fetch(URL).then((i) => i.json());
  return resp.data.markets.map(
    ({
      underlyingAddress,
      underlyingSymbol,
      totalSupplyUsd,
      supplyApy,
      supplyVenusApy,
    }) => ({
      symbol: underlyingSymbol,
      address: underlyingSymbol === 'BNB' ? WBNB : underlyingAddress,
      tvl: totalSupplyUsd,
      apy: parseFloat(supplyApy) + parseFloat(supplyVenusApy),
      lp: false,
    }),
  );
};

module.exports = {
  version: 1,
  chain: 'bsc',
  run,
};
