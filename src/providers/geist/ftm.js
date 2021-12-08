const fetch = require('node-fetch');

const { ethers } = require('ethers');
const evm = require('../../../sdk/evm');

const provider = evm.getProvider('ftm');

const URL = 'https://api.geist.finance/api/getApys';

const erc20Abi = new ethers.utils.Interface([
  'function symbol() view returns (string memory)',
]);

// TODO add lending apy
const run = async () => {
  const resp = await fetch(URL).then((i) => i.json());

  const pools = [];

  for (const [idx, item] of resp.data.apyDetails.entries()) {
    if (idx % 2 === 0) {
      let tokenContract = new ethers.Contract(
        item.underlyingAsset,
        erc20Abi,
        provider,
      );
      let name = await tokenContract.symbol();
      pools.push({
        tvl: item.poolValue,
        apy: item.apy,
        address: item.underlyingAsset,
        depositCoins: [item.underlyingAsset],
        lp: false,
        name,
      });
    }
  }
  return pools;
};

module.exports = {
  version: 1,
  run,
};
