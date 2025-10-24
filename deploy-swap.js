const hre = require('hardhat');

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with', deployer.address);

  const Token = await ethers.getContractFactory('Token');
  const A = await Token.deploy('TokenA', 'TKA');
  await A.deployed();
  const B = await Token.deploy('TokenB', 'TKB');
  await B.deployed();
  console.log('TokenA', A.address, 'TokenB', B.address);

  const parseUnits = ethers.utils.parseUnits;
  await A.mint(deployer.address, parseUnits('1000000', 18));
  await B.mint(deployer.address, parseUnits('1000000', 18));

  const AMM = await ethers.getContractFactory('SimpleAMM');
  const amm = await AMM.deploy(A.address, B.address);
  await amm.deployed();
  console.log('SimpleAMM', amm.address);

  const amountA = parseUnits('10000', 18);
  const amountB = parseUnits('5000', 18);
  await A.approve(amm.address, amountA);
  await B.approve(amm.address, amountB);
  await amm.addLiquidity(amountA, amountB);

  console.log('Initialized pool with liquidity');
}

main().catch((err)=>{ console.error(err); process.exitCode = 1; });
