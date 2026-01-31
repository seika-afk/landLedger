const hre = require("hardhat");
const { ethers } = hre;

// helper
const tokens = (n) => ethers.utils.parseEther(n.toString());

async function main() {
  // signers
  const [buyer, seller, inspector, lender] = await ethers.getSigners();

  // deploy RealEstate
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`);
  console.log("Minting 3 properties...\n");
// mint NFTs
for (let i = 0; i < 3; i++) {
  const tx = await realEstate
    .connect(seller)
    .mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i+1}.json`);
  await tx.wait();
}

  // deploy Escrow
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  );
  await escrow.deployed();

  // approve escrow
  for (let i = 0; i < 3; i++) {
    const tx = await realEstate
      .connect(seller)
      .approve(escrow.address, i + 1);
    await tx.wait();
  }

  // list properties
  let transaction;

  transaction = await escrow
    .connect(seller)
    .list(1, buyer.address, tokens(20), tokens(10));
  await transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(2, buyer.address, tokens(15), tokens(5));
  await transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(3, buyer.address, tokens(10), tokens(5));
  await transaction.wait();

  console.log("finished..");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

