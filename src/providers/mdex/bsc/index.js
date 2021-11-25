const fetch = require('node-fetch');

const URL = 'https://gateway.mdex.one/v2/mingpool/lps?mdex_chainid=56';

const run = async () => {
  const resp = await fetch(URL).then((i) => i.json());
  // console.log(resp);
  return resp.result
    .filter((item) => {
      return item.pool_apy !== 0;
    })
    .map(({ address, pool_name, pool_tvl, pool_apy }) => ({
      symbol: pool_name,
      address: address,
      tvl: pool_tvl,
      apy: pool_apy,
    }));
};

module.exports = {
  version: 1,
  chain: 'bsc',
  run,
};
