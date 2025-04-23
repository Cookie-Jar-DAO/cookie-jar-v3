import {
  AdminUpdated as AdminUpdatedEvent,
  BlacklistUpdated as BlacklistUpdatedEvent,
  Deposit as DepositEvent,
  EmergencyWithdrawal as EmergencyWithdrawalEvent,
  FeeCollectorUpdated as FeeCollectorUpdatedEvent,
  NFTGateAdded as NFTGateAddedEvent,
  NFTGateRemoved as NFTGateRemovedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  WhitelistUpdated as WhitelistUpdatedEvent,
  Withdrawal as WithdrawalEvent,
} from "../generated/CookieJar/CookieJar"
import {
  AdminUpdated,
  BlacklistUpdated,
  CookieJarRoleAdminChanged,
  Deposit,
  EmergencyWithdrawal,
  FeeCollectorUpdated,
  NFTGateAdded,
  NFTGateRemoved,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  WhitelistUpdated,
  Withdrawal,
  CookieJarRoleGranted,
  CookieJarRoleRevoked
} from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"

export function handleAdminUpdated(event: AdminUpdatedEvent): void {
  let entity = new AdminUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newAdmin = event.params.newAdmin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleBlacklistUpdated(event: BlacklistUpdatedEvent): void {
  let entity = new BlacklistUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.users = changetype<Bytes[]>(event.params.users)
  entity.statuses = event.params.statuses

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.sender = event.params.sender
  entity.amount = event.params.amount
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleEmergencyWithdrawal(
  event: EmergencyWithdrawalEvent,
): void {
  let entity = new EmergencyWithdrawal(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.admin = event.params.admin
  entity.token = event.params.token
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleFeeCollectorUpdated(
  event: FeeCollectorUpdatedEvent,
): void {
  let entity = new FeeCollectorUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.oldFeeCollector = event.params.oldFeeCollector
  entity.newFeeCollector = event.params.newFeeCollector

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleNFTGateAdded(event: NFTGateAddedEvent): void {
  let entity = new NFTGateAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.nftAddress = event.params.nftAddress
  entity.nftType = event.params.nftType

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleNFTGateRemoved(event: NFTGateRemovedEvent): void {
  let entity = new NFTGateRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.nftAddress = event.params.nftAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new CookieJarRoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new CookieJarRoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this
  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new CookieJarRoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleWhitelistUpdated(event: WhitelistUpdatedEvent): void {
  let entity = new WhitelistUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.users = changetype<Bytes[]>(event.params.users)
  entity.statuses = event.params.statuses

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}

export function handleWithdrawal(event: WithdrawalEvent): void {
  let entity = new Withdrawal(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.recipient = event.params.recipient
  entity.amount = event.params.amount
  entity.purpose = event.params.purpose
  entity.token = event.params.token

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address; // <-- Add this

  entity.save()
}
