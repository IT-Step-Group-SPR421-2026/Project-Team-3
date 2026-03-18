const hre = require("hardhat");

async function main() {
  console.log("Deploying HabitFlow Subscription Contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  console.log(`Account balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy the contract
  const HabitFlowSubscription = await hre.ethers.getContractFactory("HabitFlowSubscription");
  const subscription = await HabitFlowSubscription.deploy();

  await subscription.waitForDeployment();

  const contractAddress = await subscription.getAddress();
  console.log(`✅ HabitFlowSubscription deployed to: ${contractAddress}`);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📍 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Display contract details
  const price = await subscription.subscriptionPrice();
  const owner = await subscription.owner();
  console.log(`💰 Subscription price: ${hre.ethers.formatEther(price)} ETH`);
  console.log(`👤 Contract owner: ${owner}`);
  console.log(`💳 Payment type: One-time permanent subscription`);

  // Save contract address to file
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployments.json");

  let deployments = {};
  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  }

  const networkName = network.name === "unknown" ? "localhost" : network.name;
  if (!deployments[networkName]) {
    deployments[networkName] = {};
  }

  deployments[networkName].HabitFlowSubscription = contractAddress;
  deployments[networkName].owner = owner;
  deployments[networkName].deployedAt = new Date().toISOString();
  deployments[networkName].deployedBy = deployer.address;

  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));

  console.log(`\n📝 Deployment info saved to deployments.json`);
  console.log("\n🎉 Deployment complete!\n");

  // Output summary
  console.log("=====================================");
  console.log("DEPLOYMENT SUMMARY");
  console.log("=====================================");
  console.log(`Contract: HabitFlowSubscription`);
  console.log(`Address:  ${contractAddress}`);
  console.log(`Owner:    ${owner}`);
  console.log(`Network:  ${networkName}`);
  console.log(`Price:    ${hre.ethers.formatEther(price)} ETH`);
  console.log(`Type:     One-time permanent purchase`);
  console.log("=====================================\n");

  // Instructions for next steps
  console.log("📋 NEXT STEPS:");
  console.log("1. Copy the contract address above");
  console.log("2. Update backend/.env with:");
  console.log(`   SUBSCRIPTION_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("3. Test payment flow with your frontend");
  console.log("4. Verify contract on PolygonScan (optional):\n");
  console.log(`   npx hardhat verify --network ${networkName} ${contractAddress}\n`);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
