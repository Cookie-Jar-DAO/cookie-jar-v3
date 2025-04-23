import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AdminUpdated,
  BlacklistUpdated,
  Deposit,
  EmergencyWithdrawal,
  FeeCollectorUpdated,
  NFTGateAdded,
  NFTGateRemoved,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  WhitelistUpdated,
  Withdrawal
} from "../generated/CookieJar/CookieJar"

export function createAdminUpdatedEvent(newAdmin: Address): AdminUpdated {
  let adminUpdatedEvent = changetype<AdminUpdated>(newMockEvent())

  adminUpdatedEvent.parameters = new Array()

  adminUpdatedEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )

  return adminUpdatedEvent
}

export function createBlacklistUpdatedEvent(
  users: Array<Address>,
  statuses: boolean
): BlacklistUpdated {
  let blacklistUpdatedEvent = changetype<BlacklistUpdated>(newMockEvent())

  blacklistUpdatedEvent.parameters = new Array()

  blacklistUpdatedEvent.parameters.push(
    new ethereum.EventParam("users", ethereum.Value.fromAddressArray(users))
  )
  blacklistUpdatedEvent.parameters.push(
    new ethereum.EventParam("statuses", ethereum.Value.fromBoolean(statuses))
  )

  return blacklistUpdatedEvent
}

export function createDepositEvent(
  sender: Address,
  amount: BigInt,
  token: Address
): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent())

  depositEvent.parameters = new Array()

  depositEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return depositEvent
}

export function createEmergencyWithdrawalEvent(
  admin: Address,
  token: Address,
  amount: BigInt
): EmergencyWithdrawal {
  let emergencyWithdrawalEvent = changetype<EmergencyWithdrawal>(newMockEvent())

  emergencyWithdrawalEvent.parameters = new Array()

  emergencyWithdrawalEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )
  emergencyWithdrawalEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  emergencyWithdrawalEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return emergencyWithdrawalEvent
}

export function createFeeCollectorUpdatedEvent(
  oldFeeCollector: Address,
  newFeeCollector: Address
): FeeCollectorUpdated {
  let feeCollectorUpdatedEvent = changetype<FeeCollectorUpdated>(newMockEvent())

  feeCollectorUpdatedEvent.parameters = new Array()

  feeCollectorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldFeeCollector",
      ethereum.Value.fromAddress(oldFeeCollector)
    )
  )
  feeCollectorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newFeeCollector",
      ethereum.Value.fromAddress(newFeeCollector)
    )
  )

  return feeCollectorUpdatedEvent
}

export function createNFTGateAddedEvent(
  nftAddress: Address,
  nftType: i32
): NFTGateAdded {
  let nftGateAddedEvent = changetype<NFTGateAdded>(newMockEvent())

  nftGateAddedEvent.parameters = new Array()

  nftGateAddedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  nftGateAddedEvent.parameters.push(
    new ethereum.EventParam(
      "nftType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(nftType))
    )
  )

  return nftGateAddedEvent
}

export function createNFTGateRemovedEvent(nftAddress: Address): NFTGateRemoved {
  let nftGateRemovedEvent = changetype<NFTGateRemoved>(newMockEvent())

  nftGateRemovedEvent.parameters = new Array()

  nftGateRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )

  return nftGateRemovedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createWhitelistUpdatedEvent(
  users: Array<Address>,
  statuses: boolean
): WhitelistUpdated {
  let whitelistUpdatedEvent = changetype<WhitelistUpdated>(newMockEvent())

  whitelistUpdatedEvent.parameters = new Array()

  whitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("users", ethereum.Value.fromAddressArray(users))
  )
  whitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("statuses", ethereum.Value.fromBoolean(statuses))
  )

  return whitelistUpdatedEvent
}

export function createWithdrawalEvent(
  recipient: Address,
  amount: BigInt,
  purpose: string,
  token: Address
): Withdrawal {
  let withdrawalEvent = changetype<Withdrawal>(newMockEvent())

  withdrawalEvent.parameters = new Array()

  withdrawalEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam("purpose", ethereum.Value.fromString(purpose))
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return withdrawalEvent
}
