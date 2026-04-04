import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // Deploy ResponderSBT
  const ResponderSBT = await hre.ethers.getContractFactory("ResponderSBT");
  const responderSBT = await ResponderSBT.deploy(
    "ipfs://hero-badge-uri/",
    "ipfs://guardian-badge-uri/",
    "ipfs://helper-badge-uri/",
    deployer.address
  );
  await responderSBT.waitForDeployment();
  const sbtAddress = await responderSBT.getAddress();
  console.log(`ResponderSBT deployed to: ${sbtAddress}`);

  // Deploy EmergencyRegistry
  const EmergencyRegistry = await hre.ethers.getContractFactory("EmergencyRegistry");
  const emergencyRegistry = await EmergencyRegistry.deploy(deployer.address);
  await emergencyRegistry.waitForDeployment();
  const registryAddress = await emergencyRegistry.getAddress();
  console.log(`EmergencyRegistry deployed to: ${registryAddress}`);

  // Write contract info for Frontend to use
  const contractInfo = {
    ResponderSBT: {
      address: sbtAddress,
      abi: JSON.parse(ResponderSBT.interface.formatJson()),
    },
    EmergencyRegistry: {
      address: registryAddress,
      abi: JSON.parse(EmergencyRegistry.interface.formatJson()),
    }
  };

  const frontendPath = path.join(__dirname, "../../frontend/constants");
  if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendPath, "contractInfo.json"),
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("ABIs successfully exported to Frontend ✓");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});