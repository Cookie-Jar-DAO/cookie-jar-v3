// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {CookieJarFactory} from "../src/CookieJarFactory.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Mock is ERC721 {
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}

contract Deploy is Script {
    HelperConfig helperConfig;
    HelperConfig.NetworkConfig config;

    function run() public {
        helperConfig = new HelperConfig();
        config = helperConfig.getAnvilConfig();
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);
        bytes32 devguildSalt = keccak256(abi.encodePacked("devguild"));

        // Deploy Factory with Registry address
        CookieJarFactory factory = new CookieJarFactory{salt: devguildSalt}(
            config.defaultFeeCollector,
            0x487a30c88900098b765d76285c205c7c47582512,
            config.feePercentageOnDeposit,
            config.minETHDeposit,
            config.minERC20Deposit
        );

        console.log("CookieJarFactory deployed at: ", address(factory));

        ERC721Mock erc721 = new ERC721Mock{salt: devguildSalt}("TestNFT", "TNFT");

        erc721.mint(deployer, 1);
        console.log("ERC721Mock deployed at:", address(erc721));
        console.log("Token ID 1 minted to:", deployer);

        vm.stopBroadcast();
    }
}
