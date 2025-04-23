import {
  BlacklistRoleGranted as BlacklistRoleGrantedEvent,
  CookieJarCreated as CookieJarCreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ProtocolAdminUpdated as ProtocolAdminUpdatedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../generated/CookieJarFactory/CookieJarFactory"
import {
  BlacklistRoleGranted,
  CookieJarCreated,
  OwnershipTransferred,
  ProtocolAdminUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"

export function handleBlacklistRoleGranted(
  event: BlacklistRoleGrantedEvent
): void {
  let entity = new BlacklistRoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.users = changetype<Bytes[]>(event.params.users)

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCookieJarCreated(event: CookieJarCreatedEvent): void {
  let entity = new CookieJarCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.cookieJarAddress = event.params.cookieJarAddress
  entity.metadata = event.params.metadata

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProtocolAdminUpdated(
  event: ProtocolAdminUpdatedEvent
): void {
  let entity = new ProtocolAdminUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previous = event.params.previous
  entity.current = event.params.current

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
