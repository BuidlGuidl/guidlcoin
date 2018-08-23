pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract GuidlCoin is MintableToken {

  string public name = "GuidlCoin";
  string public symbol = "GC";
  uint8 public decimals = 0;
  string public url = "https://buidlguidl.io";

  constructor() public {

  }

  function setUrl(string _url) public onlyOwner {
    url=_url;
  }

}
