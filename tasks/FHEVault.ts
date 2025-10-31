import { FhevmType } from "@fhevm/hardhat-plugin";
import { ethers } from "ethers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:vault-address", "Prints the FHEVault address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const fheVault = await deployments.get("FHEVault");

  console.log("FHEVault address is " + fheVault.address);
});

task("task:stake", "Stake ETH to mint encrypted fETH")
  .addParam("amount", "Amount of ETH (in ether) to stake")
  .addOptionalParam("address", "Optionally specify the FHEVault contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers: hreEthers, deployments } = hre;

    const amount = taskArguments.amount as string;
    const value = hreEthers.parseEther(amount);

    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("FHEVault");

    const [signer] = await hreEthers.getSigners();
    const vault = await hreEthers.getContractAt("FHEVault", vaultDeployment.address);

    const tx = await vault.connect(signer).stake({ value });
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("task:redeem", "Redeem available fETH back to ETH")
  .addParam("amount", "Amount of ETH (in ether) to redeem")
  .addOptionalParam("address", "Optionally specify the FHEVault contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers: hreEthers, deployments } = hre;

    const value = hreEthers.parseEther(taskArguments.amount as string);
    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("FHEVault");

    const [signer] = await hreEthers.getSigners();
    const vault = await hreEthers.getContractAt("FHEVault", vaultDeployment.address);

    const tx = await vault.connect(signer).redeem(value);
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("task:get-available", "Read available fETH balance in wei")
  .addOptionalParam("target", "User address to query; defaults to signer")
  .addOptionalParam("address", "Optionally specify the FHEVault contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers: hreEthers, deployments } = hre;

    const [signer] = await hreEthers.getSigners();
    const targetAddress = (taskArguments.target as string | undefined) ?? signer.address;

    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("FHEVault");

    const vault = await hreEthers.getContractAt("FHEVault", vaultDeployment.address);

    const balance = await vault.getAvailableBalance(targetAddress);
    console.log(`Available balance for ${targetAddress}: ${balance.toString()} wei`);
  });

task("task:lock", "Lock fETH for a duration")
  .addParam("amount", "Amount of ETH (in ether) to lock")
  .addParam("duration", "Lock duration in seconds")
  .addOptionalParam("address", "Optionally specify the FHEVault contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers: hreEthers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const [signer] = await hreEthers.getSigners();
    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("FHEVault");

    const amountWei = hreEthers.parseEther(taskArguments.amount as string);
    const durationSeconds = BigInt(taskArguments.duration as string);

    const encryptedValue = await fhevm
      .createEncryptedInput(vaultDeployment.address, signer.address)
      .add64(amountWei)
      .encrypt();

    const vault = await hreEthers.getContractAt("FHEVault", vaultDeployment.address);

    const tx = await vault
      .connect(signer)
      .lock(amountWei, durationSeconds, encryptedValue.handles[0], encryptedValue.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("task:release-lock", "Release a matured lock")
  .addOptionalParam("address", "Optionally specify the FHEVault contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers: hreEthers, deployments } = hre;

    const [signer] = await hreEthers.getSigners();
    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("FHEVault");

    const vault = await hreEthers.getContractAt("FHEVault", vaultDeployment.address);

    const tx = await vault.connect(signer).releaseLock();
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("task:get-lock", "Retrieve lock info")
  .addOptionalParam("target", "User address to query; defaults to signer")
  .addOptionalParam("address", "Optionally specify the FHEVault contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers: hreEthers, deployments } = hre;

    const [signer] = await hreEthers.getSigners();
    const targetAddress = (taskArguments.target as string | undefined) ?? signer.address;

    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("FHEVault");

    const vault = await hreEthers.getContractAt("FHEVault", vaultDeployment.address);

    const lockInfo = await vault.getLockInfo(targetAddress);
    console.log(`Lock active: ${lockInfo[0]}`);
    console.log(`Unlock time: ${lockInfo[1].toString()}`);
    console.log(`Plain amount locked: ${lockInfo[3].toString()} wei`);
    console.log(`Encrypted amount handle: ${lockInfo[2]}`);
  });

task("task:decrypt-balance", "Decrypt encrypted fETH balance for signer")
  .addOptionalParam("address", "Optionally specify the FHEVault contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers: hreEthers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const [signer] = await hreEthers.getSigners();
    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("FHEVault");

    const vault = await hreEthers.getContractAt("FHEVault", vaultDeployment.address);

    const encryptedBalance = await vault.getEncryptedBalance(signer.address);
    if (encryptedBalance === ethers.ZeroHash) {
      console.log(`Encrypted balance: ${encryptedBalance}`);
      console.log("Clear balance    : 0");
      return;
    }

    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      vaultDeployment.address,
      signer,
    );

    console.log(`Encrypted balance: ${encryptedBalance}`);
    console.log(`Clear balance    : ${clearBalance}`);
  });

task("task:decrypt-lock", "Decrypt locked amount for signer")
  .addOptionalParam("address", "Optionally specify the FHEVault contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers: hreEthers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const [signer] = await hreEthers.getSigners();
    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("FHEVault");

    const vault = await hreEthers.getContractAt("FHEVault", vaultDeployment.address);
    const lockInfo = await vault.getLockInfo(signer.address);

    if (!lockInfo[0]) {
      console.log("No active lock");
      return;
    }

    const encryptedAmount = lockInfo[2];
    const clearAmount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedAmount,
      vaultDeployment.address,
      signer,
    );

    console.log(`Encrypted lock amount: ${encryptedAmount}`);
    console.log(`Clear lock amount    : ${clearAmount}`);
  });
