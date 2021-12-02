const fetch = require('node-fetch');
const URL = 'https://api.yearn.finance/v1/chains/1/vaults/all';

const run = async () => {
  const resp = await fetch(URL).then((i) => i.json());
  return resp.map(({ token, tvl, apy }) => ({
    name: token.symbol,
    address: token.address,
    tvl: tvl.tvl,
    apy: apy['net_apy'],
    lp: false,
  }));
};

module.exports = {
  version: 1,
  run,
};
