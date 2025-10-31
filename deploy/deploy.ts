import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHEVault = await deploy("FHEVault", {
    from: deployer,
    log: true,
  });

  console.log(`FHEVault contract: `, deployedFHEVault.address);
};
export default func;
func.id = "deploy_fheVault"; // id required to prevent reexecution
func.tags = ["FHEVault"];
