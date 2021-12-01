const fetch = require('node-fetch');

const URL = 'https://s.belt.fi/info/all.json';
const FourBelt = '0x9cb73F20164e399958261c289Eb5F9846f4D1404';

const run = async () => {
  const resp = await fetch(URL).then((i) => i.json());
  // console.log(resp);
  const bscData = resp.info.BSC;

  const pools = bscData.vaults.map(({ name, totalAPR, tvl, wantToken }) => ({
    symbol: name,
    address: wantToken,
    tvl: parseFloat(tvl),
    apy: parseFloat(totalAPR) / 100,
    lp: false,
  }));
  bscData.vaultPools.forEach(
    ({ name, wantToken, wantLocked, totalAPR, descriptions }) => {
      if (wantToken === FourBelt) {
        pools.push({
          symbol: name,
          address: wantToken,
          tvl: parseFloat(wantLocked),
          apy: parseFloat(totalAPR) / 100,
          lp: true,
          meta: [descriptions],
        });
      }
    },
  );
  return pools;
};

module.exports = {
  version: 1,
  chain: 'bsc',
  run,
};
