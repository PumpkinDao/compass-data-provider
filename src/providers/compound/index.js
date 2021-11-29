const fetch = require('node-fetch');

const URL = 'https://api.compound.finance/api/v2/ctoken';

const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const run = async () => {
  const resp = await fetch(URL).then((i) => i.json());
  return resp.cToken.map(
    ({
      underlying_symbol,
      underlying_address,
      total_supply,
      supply_rate,
      comp_supply_apy,
    }) => {
      return {
        address: underlying_symbol === 'ETH' ? WETH : underlying_address,
        symbol: underlying_symbol,
        tvl: total_supply.value,
        apy:
          parseFloat(supply_rate.value) * 100 +
          parseFloat(comp_supply_apy.value) / 100,
      };
    },
  );
};

module.exports = {
  version: 1,
  chain: 'eth',
  run,
};
