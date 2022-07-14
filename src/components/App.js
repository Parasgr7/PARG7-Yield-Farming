import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import ParasToken from '../abis/ParasToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await window.ethereum.on('accountsChanged', async (accounts) => {
      this.setState({ account: accounts[0] })
      await this.loadBlockchainData()
    })
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const networkId = await web3.eth.net.getId()

    // Load ParasToken
    const parasTokenData = ParasToken.networks[networkId]
    if(parasTokenData) {
      const parasToken = new web3.eth.Contract(ParasToken.abi, parasTokenData.address)
      this.setState({ parasToken })
      let parasTokenBalance = await parasToken.methods.balanceOf(this.state.account).call()
      this.setState({ parasTokenBalance: parasTokenBalance.toString() })
      // Calling again to fetch correct result
    } else {
      window.alert('ParasToken contract not deployed to detected network.')
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      let liquidity = await tokenFarm.methods.liquidity().call()
      this.setState({ stakingBalance: stakingBalance.toString(), liquidity: liquidity.toString() })
    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]

    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    let current_account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.setState({ account: current_account[0] })

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }

  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
        this.loadBlockchainData()
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      this.loadBlockchainData()
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      parasToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      parasTokenBalance: '0',
      stakingBalance: '0',
      liquidity: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        parasTokenBalance={this.state.parasTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        liquidity={this.state.liquidity}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
