const ParasToken = artifacts.require('ParasToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
  // Deploy Mock DAI Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  // Deploy Paras Token
  await deployer.deploy(ParasToken)
  const parasToken = await ParasToken.deployed()

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, parasToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  // Transfer all tokens to TokenFarm (1 million)
  await parasToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // Transfer 100 Mock DAI tokens to investor
  await daiToken.transfer(accounts[1], '100000000000000000000')
  await daiToken.transfer(accounts[2], '100000000000000000000')
  await daiToken.transfer(accounts[3], '100000000000000000000')
}
