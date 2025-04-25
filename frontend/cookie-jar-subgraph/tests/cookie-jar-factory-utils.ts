import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  BlacklistRoleGranted,
  CookieJarCreated,
  OwnershipTransferred,
  ProtocolAdminUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/CookieJarFactory/CookieJarFactory"

export function createBlacklistRoleGrantedEvent(
  users: Array<Address>
): BlacklistRoleGranted {
  let blacklistRoleGrantedEvent =
    changetype<BlacklistRoleGranted>(newMockEvent())

  blacklistRoleGrantedEvent.parameters = new Array()

  blacklistRoleGrantedEvent.parameters.push(
    new ethereum.EventParam("users", ethereum.Value.fromAddressArray(users))
  )

  return blacklistRoleGrantedEvent
}

export function createCookieJarCreatedEvent(
  creator: Address,
  cookieJarAddress: Address,
  metadata: string
): CookieJarCreated {
  let cookieJarCreatedEvent = changetype<CookieJarCreated>(newMockEvent())

  cookieJarCreatedEvent.parameters = new Array()

  cookieJarCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  cookieJarCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "cookieJarAddress",
      ethereum.Value.fromAddress(cookieJarAddress)
    )
  )
  cookieJarCreatedEvent.parameters.push(
    new ethereum.EventParam("metadata", ethereum.Value.fromString(metadata))
  )

  return cookieJarCreatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createProtocolAdminUpdatedEvent(
  previous: Address,
  current: Address
): ProtocolAdminUpdated {
  let protocolAdminUpdatedEvent =
    changetype<ProtocolAdminUpdated>(newMockEvent())

  protocolAdminUpdatedEvent.parameters = new Array()

  protocolAdminUpdatedEvent.parameters.push(
    new ethereum.EventParam("previous", ethereum.Value.fromAddress(previous))
  )
  protocolAdminUpdatedEvent.parameters.push(
    new ethereum.EventParam("current", ethereum.Value.fromAddress(current))
  )

  return protocolAdminUpdatedEvent
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
