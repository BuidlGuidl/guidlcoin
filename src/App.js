import React, { Component } from 'react';
import './App.css';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address, Button } from "dapparatus"
import Web3 from 'web3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
      doingTransaction: false,
      name: "loading...",
      url: "loading...",
      setUrl:"loading...",
      settingUrl:false,
    }
  }
  async poll(){
    if(this.state&&this.state.contracts){
      let url = await this.state.contracts.GuidlCoin.url().call()
      let balance = await this.state.contracts.GuidlCoin.balanceOf(this.state.account).call()
      if(url!=this.state.url||balance!=this.state.balance){
        if(this.state.settingUrl){
          this.setState({url:url,balance:balance})
        }else{
          this.setState({url:url,setUrl:url,balance:balance})
        }

      }
    }
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  render() {
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state
    let connectedDisplay = []
    let contractsDisplay = []
    if(web3){
      connectedDisplay.push(
       <Gas
         key="Gas"
         onUpdate={(state)=>{
           console.log("Gas price update:",state)
           this.setState(state,()=>{
             console.log("GWEI set:",this.state)
           })
         }}
       />
      )

      connectedDisplay.push(
        <ContractLoader
          key="ContractLoader"
          config={{DEBUG:true}}
          web3={web3}
          require={path => {return require(`${__dirname}/${path}`)}}
          onReady={async (contracts,customLoader)=>{
            console.log("contracts loaded",contracts)
            let name = await contracts.GuidlCoin.name().call();
            let owner = await contracts.GuidlCoin.owner().call();
            this.setState({contracts:contracts,name:name,owner:owner})
            setInterval(this.poll.bind(this),3000);this.poll()
          }}
        />
      )

      connectedDisplay.push(
        <Transactions
          key="Transactions"
          account={account}
          gwei={gwei}
          web3={web3}
          block={block}
          avgBlockTime={avgBlockTime}
          etherscan={etherscan}
          onReady={(state)=>{
            console.log("Transactions component is ready:",state)
            this.setState(state)
          }}
          onReceipt={(transaction,receipt)=>{
            console.log("Transaction Receipt",transaction,receipt)
          }}
        />
      )

      if(contracts){

        let urlView = (
          <div>
            url: {this.state.url} <Button size="2" onClick={async ()=>{
              this.setState({settingUrl:true})
            }}>
              edit
            </Button>
          </div>
        )
        if(this.state.settingUrl){
          urlView = (
            <div>
              url:
              <input
                style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="setUrl" value={this.state.setUrl} onChange={this.handleInput.bind(this)}
              />
              <Button size="2" color="green" onClick={async ()=>{
                tx(
                  contracts.GuidlCoin.setUrl(this.state.setUrl),
                  (receipt)=>{
                    this.setState({settingUrl:false},()=>{
                      this.poll()
                    })
                  }
                )
              }}>
                setUrl
              </Button>
            </div>
          )
        }

        let ownerView = ""
        if(this.state.account.toLowerCase()==this.state.owner.toLowerCase()){
          ownerView = (
            <div>
              Mint <input
                style={{verticalAlign:"middle",width:50,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="mintAmount" value={this.state.mintAmount} onChange={this.handleInput.bind(this)}
              /> guidlcoins to <input
                  style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                  type="text" name="mintTo" value={this.state.mintTo} onChange={this.handleInput.bind(this)}
                />
              <Button size="2" color="green" onClick={async ()=>{
                tx(
                  contracts.GuidlCoin.mint(this.state.mintTo,this.state.mintAmount),
                  (receipt)=>{
                    this.setState({mintTo:"",mintAmount:""})
                  }
                )
              }}>
                Mint
              </Button>
            </div>
          )
        }

        let balanceView = (
          <div>
            GuildCoin Balance: <span style={{color:"#FFFFFF"}}>{this.state.balance}</span>
          </div>
        )

        let transferView = (
          <div>
            Transfer <input
              style={{verticalAlign:"middle",width:50,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
              type="text" name="transferAmount" value={this.state.transferAmount} onChange={this.handleInput.bind(this)}
            /> guidlcoins to <input
                style={{verticalAlign:"middle",width:300,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="transferTo" value={this.state.transferTo} onChange={this.handleInput.bind(this)}
              />
            <Button size="2" color="green" onClick={async ()=>{
              tx(
                contracts.GuidlCoin.transfer(this.state.transferTo,this.state.transferAmount),
                (receipt)=>{
                  this.setState({transferTo:"",transferAmount:""})
                }
              )
            }}>
              Send
            </Button>
          </div>
        )

        contractsDisplay.push(
          <div key="UI" style={{padding:30}}>
            <div>
              <Address
                {...this.state}
                address={contracts.GuidlCoin._address}
              />
              <Address
                {...this.state}
                address={this.state.owner.toLowerCase()}
              />
              {urlView}
              {ownerView}
              {balanceView}
              {transferView}
            </div>
          </div>
        )
      }
    }
    return (
      <div className="App">
        <Metamask
          config={{requiredNetwork:['Unknown','Rinkeby']}}
          onUpdate={async (state)=>{
           console.log("metamask state update:",state)
           if(state.web3Provider) {
             state.web3 = new Web3(state.web3Provider)
             this.setState(state)
           }
          }}
        />
        {connectedDisplay}

        <div style={{padding:30}}>
          {this.state.name}
          {contractsDisplay}
        </div>

      </div>
    );
  }
}

export default App;
