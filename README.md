# Compass Data Providers

![](https://github.com/compassdao/compass-data-provider/actions/workflows/test.yml/badge.svg)

## Apply my awesome protocol

1. create an impl file like `${protocolId}`/`${chain}.js` inside `providers` folder
2. impl your `run` function returned an array of pools likes this
   ```typescript
   type Pools = Array<{
     name: string; // pool name
     address: string; // pool address
     tvl: number; // pool tvl
     apy: number; // pool apy
     depositCoins: Array<string>; // which coins need to deposit
     lp: boolean; // is LP pool?
   }>;
   ```
3. export your `run` function and `version` （constantly `1` now）
4. apply git commit likes `git commit -m "<type>: <subject>"` ([what is commitlint](https://github.com/conventional-changelog/commitlint#what-is-commitlint)) .Example:
   ```shell
   git commit -m "feat: apply new protocol - $my_awesome_protocol"
   ```
5. apply PR on GitHub
