const simulationArr = require("./simulationObj.json");

const clearingHouseProxy = "0x0f142b4df7f33655763b7ad4b3a2a0ef80dfb420";

const seenBefore = {}

async function start() {
  const [s] = await ethers.getSigners();
  for (const simulation of simulationArr) {
    await s.sendTransaction({
      to: simulation.from,
      value: ethers.utils.parseEther("0.1")
    });
    await ethers.provider.send("hardhat_impersonateAccount", [simulation.from]);
    const signer = await ethers.provider.getSigner(simulation.from);
    const r = await (
      await signer.sendTransaction({
        to: clearingHouseProxy,
        data: simulation.data,
        gasLimit: 5_000_000
      })
    ).wait();
    console.log(
      `seenBefore: ${!!seenBefore[r.transactionHash]}, tx hash : ${r.transactionHash}, blockNumber: ${r.blockNumber}`
    );
    seenBefore[r.transactionHash] = true;
  }
}

if (require.main === module) {
  start()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
