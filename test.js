const path = require('path');

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the filename of the adapter to test.
    Eg: node test.js src/providers/{project}/myadapter.js`);
  process.exit(1);
}
const passedFile = path.resolve(process.cwd(), process.argv[2]);

(async () => {
  const m = require(passedFile);
  const apy = await m.run();
  if (apy !== null) {
    apy.forEach((item) => {
      console.log(
        item.name,
        item.address,
        item.tvl,
        item.apy,
        item.depositCoins,
      );
    });
  }

  process.exit(0);
})();
