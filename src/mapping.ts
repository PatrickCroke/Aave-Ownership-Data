import { BigInt, Address, store, log, BigDecimal } from '@graphprotocol/graph-ts';
import { Transfer, ERC20 } from '../generated/AAVE/ERC20';
import { Token, Holder } from '../generated/schema';
import { ERC20NameBytes32 as Erc20NameBytes32Contract } from '../generated/AAVE/ERC20NameBytes32';


function updateBalance(tokenAddress: Address, holderAddress: Address, value: BigInt, blockNumber: BigInt, blockTime: BigInt, increase: boolean): void {
  if (holderAddress.toHexString() == '0x0000000000000000000000000000000000000000') return;
  let id = holderAddress.toHex();
  let holder = Holder.load(id);
  if (holder == null) {
    holder = new Holder(id);
    holder.address = holderAddress;
    holder.balance = BigInt.fromI32(0);
    holder.token = tokenAddress.toHex();
  }
  holder.blockNumber=blockNumber;
  holder.timestamp=blockTime;
  holder.balance = increase ? holder.balance.plus(value) : holder.balance.minus(value);
  if (holder.balance.isZero()) {
    store.remove('Holder', id);
  } else {
    holder.save();
  }
}

function updateTotalSupply(address: Address): void {
  let contract = ERC20.bind(address);
  let token = Token.load(address.toHex());
  if (token == null) {
    token = new Token(address.toHex());
    token.address = address;
    token.totalSupply = BigInt.fromI32(0);
    token.decimals = 0
    token.name = ''
  }
  token.decimals = contract.decimals();
  token.totalSupply = contract.totalSupply();
  token.name = contract.name();
  token.save();
}

export function handleTransfer(event: Transfer): void {  
  updateTotalSupply(event.address);
  updateBalance(event.address, event.params.from, event.params.amount, event.block.number, event.block.timestamp, false);
  updateBalance(event.address, event.params.to, event.params.amount, event.block.number, event.block.timestamp, true);
}