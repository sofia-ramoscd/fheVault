import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, deployments, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { FHEVault } from "../types";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("FHEVaultSepolia", function () {
  let signers: Signers;
  let contract: FHEVault;
  let contractAddress: string;

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const deployment = await deployments.get("FHEVault");
      contractAddress = deployment.address;
      contract = await ethers.getContractAt("FHEVault", deployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  it("reads encrypted balance and decrypts it", async function () {
    this.timeout(120000);

    await fhevm.initializeCLIApi();

    const encryptedBalance = await contract.getEncryptedBalance(signers.alice.address);
    expect(encryptedBalance).to.not.equal(undefined);

    if (encryptedBalance === ethers.ZeroHash) {
      console.log("Encrypted balance is zero hash, skipping decryption check.");
      return;
    }

    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      contractAddress,
      signers.alice,
    );
    console.log(`Decrypted balance: ${clearBalance}`);
  });
});
