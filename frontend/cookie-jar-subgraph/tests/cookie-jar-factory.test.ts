import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes } from "@graphprotocol/graph-ts"
import { BlacklistRoleGranted } from "../generated/schema"
import { BlacklistRoleGranted as BlacklistRoleGrantedEvent } from "../generated/CookieJarFactory/CookieJarFactory"
import { handleBlacklistRoleGranted } from "../src/cookie-jar-factory"
import { createBlacklistRoleGrantedEvent } from "./cookie-jar-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let users = [
      Address.fromString("0x0000000000000000000000000000000000000001")
    ]
    let newBlacklistRoleGrantedEvent = createBlacklistRoleGrantedEvent(users)
    handleBlacklistRoleGranted(newBlacklistRoleGrantedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("BlacklistRoleGranted created and stored", () => {
    assert.entityCount("BlacklistRoleGranted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BlacklistRoleGranted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "users",
      "[0x0000000000000000000000000000000000000001]"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
