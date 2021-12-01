const fetch = require('node-fetch');

const URL = 'https://api.ellipsis.finance/api/getPools';

const TVL_URL = 'https://api.ellipsis.finance/api/getTVL';

const run = async () => {
  const resp = await fetch(URL).then((i) => i.json());
  const tvlResp = await fetch(TVL_URL).then((i) => i.json());

  const parseData = ({ lpToken, tokens, epsApy, apy, address }) => {
    var symbol = lpToken.symbol;
    tokens.forEach((t) => {
      symbol = symbol + '_' + t.symbol;
    });
    var tvl = tvlResp.data[address];
    if (tvl === undefined) {
      tvl = 0;
    }
    return {
      address: lpToken.address,
      symbol: symbol,
      apy: parseFloat(epsApy) / 100 + apy / 100,
      tvl: tvl,
      lp: true,
    };
  };

  const basePools = resp.data.basePools.map(parseData);
  const metaPools = resp.data.metaPools.map(parseData);

  return basePools.concat(metaPools);
};

module.exports = {
  version: 1,
  chain: 'bsc',
  run,
};
