const fetch = require('node-fetch');

const URL = 'https://s.belt.fi/info/all.json';
const FourBelt = '0x9cb73F20164e399958261c289Eb5F9846f4D1404';

const run = async () => {
  const resp = await fetch(URL).then((i) => i.json());
  const bscData = resp.info.BSC;

  const pools = bscData.vaults.map(({ name, totalAPR, tvl, wantToken }) => ({
    name,
    address: wantToken,
    depositCoins: [wantToken],
    tvl: parseFloat(tvl),
    apr: parseFloat(totalAPR) / 100,
    lp: false,
  }));
  bscData.vaultPools.forEach(
    ({ name, wantToken, wantLocked, totalAPR, descriptions, members }) => {
      if (wantToken === FourBelt) {
        pools.push({
          name,
          address: wantToken,
          depositCoins: members,
          tvl: parseFloat(wantLocked),
          apr: parseFloat(totalAPR) / 100,
          lp: true,
          keywords: descriptions,
        });
      }
    },
  );
  return pools;
};

module.exports = {
  version: 1,
  run,
};
