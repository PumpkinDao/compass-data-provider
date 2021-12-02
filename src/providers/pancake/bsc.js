const { ethers } = require('ethers');
const evm = require('../../sdk/evm');

const provider = evm.getProvider('bsc');

const abiCoder = ethers.utils.defaultAbiCoder;

const chefAddress = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';

const multiCallAddress = '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B';

const multiCallAbi = new ethers.utils.Interface([
  'function aggregate(tuple(address, bytes)[] memory) public returns (uint256 blockNumber, bytes[] memory)',
]);

const erc20Abi = new ethers.utils.Interface([
  'function balanceOf(address owner) view returns (uint)',
  'function totalSupply() view returns (uint)',
]);

const chefAbi = new ethers.utils.Interface([
  'function poolLength() view returns (uint)',
  'function totalAllocPoint() view returns (uint)',
  'function poolInfo(uint i) view returns (address, uint, uint, uint)',
  'function cakePerBlock() view returns (uint)',
]);

const uniV2PairAbi = new ethers.utils.Interface([
  'function name() view returns (string memory)',
  'function symbol() view returns (string memory)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint)',
  'function balanceOf(address owner) view returns (uint)',
  'function allowance(address owner, address spender) view returns (uint)',

  'function factory() view returns (address)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function price0CumulativeLast() view returns (uint)',
  'function price1CumulativeLast() view returns (uint)',
]);

const uniV2RouterAbi = new ethers.utils.Interface([
  'function getAmountsOut(uint, address[] memory) view returns (uint[] memory)',
]);

const routerAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const router = new ethers.Contract(routerAddress, uniV2RouterAbi, provider);

const cake = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
const usdt = '0x55d398326f99059fF775485246999027B3197955';
const busd = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const wbnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const eth = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8';
const btc = '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c';

const E18 = ethers.BigNumber.from('1000000000000000000'); // 1e18
const blocksPerYear = ethers.BigNumber.from(20 * 60 * 24 * 365); // 1e18

const getPrice = async (path, amt = E18) => {
  // return price * E18
  const amts = await router.getAmountsOut(amt, path);
  const lastAmt = amts[amts.length - 1];
  return lastAmt.mul(E18).div(amt);
};

const getPairTVL = async (pairAddr, bnbPrice) => {
  // return tvl(usd) * E18
  const pairContract = new ethers.Contract(pairAddr, uniV2PairAbi, provider);
  let token0 = null;
  try {
    token0 = await pairContract.token0();
  } catch (e) {
    return null;
  }
  const token1 = await pairContract.token1();
  let baseToken = null;
  if (token0 === usdt || token1 === usdt) {
    baseToken = token0 === usdt ? token0 : token1;
  } else if (token0 === busd || token1 === busd) {
    baseToken = token0 === usdt ? token0 : token1;
  }
  const chefHoldShare = await pairContract.balanceOf(chefAddress);
  const totalSupply = await pairContract.totalSupply();
  if (baseToken !== null) {
    const tokenContract = new ethers.Contract(baseToken, erc20Abi, provider);
    return (await tokenContract.balanceOf(pairAddr))
      .mul(2)
      .mul(chefHoldShare)
      .div(totalSupply);
  }
  if (token0 === wbnb || token1 === wbnb) {
    const tokenContract = new ethers.Contract(wbnb, erc20Abi, provider);
    return (await tokenContract.balanceOf(pairAddr))
      .mul(2)
      .mul(bnbPrice)
      .mul(chefHoldShare)
      .div(totalSupply)
      .div(E18);
  }
  if (token0 === eth || token1 === eth) {
    const ethPrice = await getPrice([eth, busd]);
    const tokenContract = new ethers.Contract(eth, erc20Abi, provider);
    return (await tokenContract.balanceOf(pairAddr))
      .mul(2)
      .mul(ethPrice)
      .mul(chefHoldShare)
      .div(totalSupply)
      .div(E18);
  }
  if (token0 === btc || token1 === btc) {
    const btcPrice = await getPrice([btc, busd]);
    const tokenContract = new ethers.Contract(btc, erc20Abi, provider);
    return (await tokenContract.balanceOf(pairAddr))
      .mul(2)
      .mul(btcPrice)
      .mul(chefHoldShare)
      .div(totalSupply)
      .div(E18);
  }
  return null;
};

const run = async () => {
  const cakePrice = await getPrice([cake, busd]);
  const bnbPrice = await getPrice([wbnb, busd]);

  const chefContract = new ethers.Contract(chefAddress, chefAbi, provider);
  const poolSize = (await chefContract.poolLength()).toNumber();
  const cakePerBlock = await chefContract.cakePerBlock();
  const totalPoint = await chefContract.totalAllocPoint();

  const calls = [];
  for (let i = 250; i < poolSize; i++) {
    // old pool id < 250
    calls.push([chefAddress, chefAbi.encodeFunctionData('poolInfo', [i])]);
  }
  const y = await provider.call({
    to: multiCallAddress,
    data: multiCallAbi.encodeFunctionData('aggregate', [calls]),
  });
  const [, results] = abiCoder.decode(['uint', 'bytes[]'], y);

  const apys = [];

  // TODO use multi call
  for (let i = 0; i < results.length; i++) {
    const [addr, allocPoint] = chefAbi.decodeFunctionResult(
      'poolInfo',
      results[i],
    );
    if (allocPoint.toNumber() >= 100) {
      let tvl = await getPairTVL(addr, bnbPrice);
      if (tvl !== null) {
        const yearlyProduceCake = cakePerBlock.mul(blocksPerYear).div(E18);
        const apy = yearlyProduceCake
          .mul(allocPoint)
          .div(totalPoint)
          .mul(cakePrice)
          .mul(10000)
          .div(tvl);
        const floatApy = apy.toNumber() / 10000;
        apys.push({
          name: '', // todo
          address: addr,
          tvl: tvl.div(E18).toString(),
          apy: floatApy,
        });
      }
    }
  }
  return apys;
};

module.exports = {
  version: 1,
  run,
};
