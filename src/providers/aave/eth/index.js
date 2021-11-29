const fetch = require('node-fetch');

const URL = 'https://cache-api-mainnet.aave.com/graphql';

const BODY = {
  operationName: 'C_ProtocolData',
  variables: {
    lendingPoolAddressProvider: '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
  },
  query:
    'query C_ProtocolData($lendingPoolAddressProvider: String!) {\n  protocolData(lendingPoolAddressProvider: $lendingPoolAddressProvider) {\n    reserves {\n      ...ReserveDataFragment\n      __typename\n    }\n    baseCurrencyData {\n      ...BaseCurrencyDataFragment\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ReserveDataFragment on ReserveData {\n  id\n  underlyingAsset\n  name\n  symbol\n  decimals\n  isActive\n  isFrozen\n  usageAsCollateralEnabled\n  aTokenAddress\n  stableDebtTokenAddress\n  variableDebtTokenAddress\n  borrowingEnabled\n  stableBorrowRateEnabled\n  reserveFactor\n  interestRateStrategyAddress\n  baseLTVasCollateral\n  stableRateSlope1\n  stableRateSlope2\n  averageStableRate\n  stableDebtLastUpdateTimestamp\n  variableRateSlope1\n  variableRateSlope2\n  liquidityIndex\n  reserveLiquidationThreshold\n  reserveLiquidationBonus\n  variableBorrowIndex\n  variableBorrowRate\n  availableLiquidity\n  stableBorrowRate\n  liquidityRate\n  totalPrincipalStableDebt\n  totalScaledVariableDebt\n  lastUpdateTimestamp\n  priceInMarketReferenceCurrency\n  __typename\n}\n\nfragment BaseCurrencyDataFragment on BaseCurrencyData {\n  marketReferenceCurrencyDecimals\n  marketReferenceCurrencyPriceInUsd\n  networkBaseTokenPriceInUsd\n  networkBaseTokenPriceDecimals\n  __typename\n}\n',
};

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
  'content-type': 'application/json',
};

const run = async () => {
  // const resp = await fetch(URL, {method: "POST", body: BODY}).then((i) => i.json());
  const resp = await fetch(URL, {
    method: 'POST',
    body: JSON.stringify(BODY),
    headers: HEADERS,
  }).then((i) => i.json());
  const data = resp.data.protocolData.reserves;
  return data.map(({ symbol, liquidityRate, underlyingAsset }) => ({
    symbol: symbol,
    apy: parseFloat(liquidityRate) / 1e26,
    address: underlyingAsset,
    tvl: 0,
  }));
};

module.exports = {
  version: 1,
  chain: 'eth',
  run,
};
