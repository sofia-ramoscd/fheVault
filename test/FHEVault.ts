import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FHEVault, FHEVault__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHEVault")) as FHEVault__factory;
  const contract = (await factory.deploy()) as FHEVault;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("FHEVault", function () {
  let signers: Signers;
  let contract: FHEVault;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("returns zero encrypted balance for new users", async function () {
    const encrypted = await contract.getEncryptedBalance(signers.alice.address);
    expect(encrypted).to.eq(ethers.ZeroHash);
  });

  it("stakes ETH and updates plain and encrypted balances", async function () {
    const deposit = ethers.parseEther("1");

    const tx = await contract.connect(signers.alice).stake({ value: deposit });
    await tx.wait();

    const available = await contract.getAvailableBalance(signers.alice.address);
    expect(available).to.eq(deposit);

    const encrypted = await contract.getEncryptedBalance(signers.alice.address);
    const clear = await fhevm.userDecryptEuint(FhevmType.euint64, encrypted, contractAddress, signers.alice);
    expect(BigInt(clear.toString())).to.eq(deposit);
  });

  it("locks and releases encrypted balances", async function () {
    const deposit = ethers.parseEther("2");
    await (await contract.connect(signers.alice).stake({ value: deposit })).wait();

    const lockAmount = ethers.parseEther("1");
    const encryptedLock = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add64(lockAmount)
      .encrypt();

    const duration = 3600;
    await (
      await contract
        .connect(signers.alice)
        .lock(lockAmount, duration, encryptedLock.handles[0], encryptedLock.inputProof)
    ).wait();

    const availableAfterLock = await contract.getAvailableBalance(signers.alice.address);
    expect(availableAfterLock).to.eq(deposit - lockAmount);

    const lockInfo = await contract.getLockInfo(signers.alice.address);
    expect(lockInfo[0]).to.eq(true);
    expect(lockInfo[3]).to.eq(lockAmount);

    const decryptedLock = await fhevm.userDecryptEuint(FhevmType.euint64, lockInfo[2], contractAddress, signers.alice);
    expect(BigInt(decryptedLock.toString())).to.eq(lockAmount);

    await time.increase(duration + 1);

    await (await contract.connect(signers.alice).releaseLock()).wait();

    const availableAfterRelease = await contract.getAvailableBalance(signers.alice.address);
    expect(availableAfterRelease).to.eq(deposit);

    const lockInfoAfter = await contract.getLockInfo(signers.alice.address);
    expect(lockInfoAfter[0]).to.eq(false);
  });

  it("redeems ETH reducing balances", async function () {
    const deposit = ethers.parseEther("1.5");
    await (await contract.connect(signers.alice).stake({ value: deposit })).wait();

    const redeemAmount = ethers.parseEther("0.5");

    await (await contract.connect(signers.alice).redeem(redeemAmount)).wait();

    const available = await contract.getAvailableBalance(signers.alice.address);
    expect(available).to.eq(deposit - redeemAmount);

    const encrypted = await contract.getEncryptedBalance(signers.alice.address);
    const decrypted = await fhevm.userDecryptEuint(FhevmType.euint64, encrypted, contractAddress, signers.alice);
    expect(BigInt(decrypted.toString())).to.eq(deposit - redeemAmount);
  });
});
