// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CookieJarFactory.sol";
import "../src/CookieJar.sol";
import "../src/CookieJarRegistry.sol";
import "../script/HelperConfig.s.sol";
import "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract CookieJarFactoryTest is Test {
    HelperConfig public helperConfig;

    CookieJarFactory public factory;
    CookieJarRegistry public registry;
    address public owner = address(0xABCD);
    address public user = address(0x1234);
    address public user2 = address(0x5678);
    uint256 public fixedAmount = 1 ether;
    uint256 public maxWithdrawal = 2 ether;
    uint256 public withdrawalInterval = 1 days;
    bool public strictPurpose = true;
    address[] public users;
    bool[] public statuses;
    HelperConfig.NetworkConfig config;
    ERC20 testToken;

    function setUp() public {
        helperConfig = new HelperConfig();
        config = helperConfig.getAnvilConfig();
        vm.startPrank(owner);
        // Deploy the registry first.
        registry = new CookieJarRegistry();
        users = new address[](2);
        users[0] = user;
        users[1] = user2;

        testToken = new ERC20Mock();
        deal(address(testToken), address(user), 100e18);

        // Deploy the factory with the registry's address.
        factory = new CookieJarFactory(
            config.defaultFeeCollector,
            address(registry),
            owner,
            config.feePercentageOnDeposit,
            config.minETHDeposit,
            config.minERC20Deposit
        );
        // Let the registry know which factory is authorized.
        registry.setCookieJarFactory(address(factory));
        vm.deal(user, 100 ether);
        vm.deal(user2, 100 ether);
        vm.stopPrank();
    }

    function testBlacklistedJarCreatorsAccessControl() public {
        vm.prank(user);
        vm.expectRevert();
        // CookieJarFactory.CookieJarFactory__Blacklisted.selector
        factory.grantBlacklistedJarCreatorsRole(users);

        vm.prank(owner);
        factory.grantBlacklistedJarCreatorsRole(users);
        vm.prank(user);
        vm.expectRevert(
            CookieJarFactory.CookieJarFactory__Blacklisted.selector
        );
        factory.depositMinETH{value: 1 ether}();
    }

    function testOnlyOwnerGrantsAndRevokesProtocolAdminRoles() public {
        vm.startPrank(owner);
        factory.grantProtocolAdminRole(user);
        factory.grantProtocolAdminRole(user2);
        vm.stopPrank();
        vm.expectRevert();
        vm.prank(user);
        factory.revokeProtocolAdminRole(user2);
        vm.expectRevert();
        vm.prank(user2);
        factory.revokeProtocolAdminRole(owner);
    }

    function testTransferOwnership() public {
        vm.prank(owner);
        factory.transferOwnership(user);
        assertEq(factory.hasRole(keccak256("OWNER"), user), true);
        assertEq(factory.hasRole(keccak256("OWNER"), owner), false);
    }

    function testDepositMinETH() public {
        vm.prank(user);
        uint256 collectorBalanceBefore = config.defaultFeeCollector.balance;
        factory.depositMinETH{value: 0.01 ether}();
        uint256 amount = factory.getUserDepositAmount(user, address(3));
        assertGt(amount, 0.009 ether);
        assertGt(config.defaultFeeCollector.balance, 0);
        assertEq(
            config.defaultFeeCollector.balance,
            collectorBalanceBefore +
                (factory.defaultFeePercentage() * 0.01 ether) /
                100
        );
    }

    function testDepositMinERC20() public {
        vm.startPrank(user);
        testToken.approve(address(factory), 50e18);
        uint256 collectorBalanceBefore = ERC20(testToken).balanceOf(
            config.defaultFeeCollector
        );

        factory.depositMinERC20(50e18, address(testToken));
        vm.stopPrank();
        uint256 amount = factory.getUserDepositAmount(user, address(testToken));
        assertGt(amount, 49e18);
        assertEq(
            ERC20(testToken).balanceOf(config.defaultFeeCollector),
            collectorBalanceBefore +
                (factory.defaultFeePercentage() * 50e18) /
                100
        );
    }

    function testDepositMinERC20ByBlacklistedPerson() public {
        vm.prank(owner);
        factory.grantBlacklistedJarCreatorsRole(users);
        vm.startPrank(users[0]);
        vm.expectRevert(
            CookieJarFactory.CookieJarFactory__Blacklisted.selector
        );
        factory.depositMinERC20(100, address(3));
    }

    /// @notice Test creating a cookie jar by a blacklisted person
    function testCreateCookieJarByBlacklistedPerson() public {
        address[] memory emptyAddresses = new address[](0);
        uint8[] memory emptyTypes = new uint8[](0);
        vm.prank(owner);
        factory.grantBlacklistedJarCreatorsRole(users);
        vm.startPrank(users[0]);
        vm.expectRevert(
            CookieJarFactory.CookieJarFactory__Blacklisted.selector
        );
        factory.createCookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            strictPurpose,
            true, // emergencyWithdrawalEnabled
            "Test Metadata"
        );
        vm.stopPrank();
    }

    /// @notice Test creating a CookieJar in Whitelist mode and verifying registry creator.
    function testCreateETHCookieJarWhitelist() public {
        uint256 initialBalance = address(config.defaultFeeCollector).balance;
        address[] memory emptyAddresses = new address[](0);
        uint8[] memory emptyTypes = new uint8[](0);
        vm.startPrank(user);
        factory.depositMinETH{value: 50e18}();
        address jarAddress = factory.createCookieJar(
            user,
            address(3),
            /// @dev address(3) for ETH jars.
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            strictPurpose,
            true, // emergencyWithdrawalEnabled
            "Test Metadata"
        );
        assertGt(jarAddress.balance, 49e18);
        assertNotEq(jarAddress, address(0));
        uint256 finalBalance = address(config.defaultFeeCollector).balance;
        assertEq(
            finalBalance,
            initialBalance + (50e18 * config.feePercentageOnDeposit) / 100,
            "Fee collector should receive the exact fee amount"
        );
        assertEq(
            CookieJar(payable(jarAddress)).currencyHeldByJar(),
            50e18 - ((50e18 * config.feePercentageOnDeposit) / 100)
        );
        assertEq(
            jarAddress.balance,
            50e18 - ((50e18 * config.feePercentageOnDeposit) / 100)
        );
        CookieJarRegistry.CookieJarInfo memory temp = registry
            .getJarByCreatorAddress(user);
        assertEq(temp.metadata, "Test Metadata");

        vm.stopPrank();
    }

    function testCreateERC20CookieJarWhitelist() public {
        uint256 initialBalance = ERC20(address(testToken)).balanceOf(
            address(config.defaultFeeCollector)
        );
        address[] memory emptyAddresses = new address[](0);
        uint8[] memory emptyTypes = new uint8[](0);
        vm.startPrank(user);
        ERC20(address(testToken)).approve(address(factory), 10e18);
        factory.depositMinERC20(10e18, address(testToken));
        address jarAddress = factory.createCookieJar(
            user,
            address(testToken),
            /// @dev address(3) for ETH jars.
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            strictPurpose,
            true, // emergencyWithdrawalEnabled
            "Test Metadata"
        );
        assertGt(ERC20(testToken).balanceOf(jarAddress), 9e18);
        assertLt(ERC20(testToken).balanceOf(jarAddress), 10e18);
        assertNotEq(jarAddress, address(0));
        uint256 finalBalance = ERC20(address(testToken)).balanceOf(
            address(config.defaultFeeCollector)
        );
        assertEq(
            finalBalance,
            initialBalance + (10e18 * config.feePercentageOnDeposit) / 100,
            "Fee collector should receive the exact fee amount"
        );
        assertEq(
            CookieJar(payable(jarAddress)).currencyHeldByJar(),
            10e18 - ((10e18 * config.feePercentageOnDeposit) / 100)
        );
        CookieJarRegistry.CookieJarInfo memory temp = registry
            .getJarByCreatorAddress(user);
        assertEq(temp.metadata, "Test Metadata");

        vm.stopPrank();
    }

    /// @notice Test creating a CookieJar in NFTGated mode and verifying registry creator.
    function testCreateETHCookieJarNFTMode() public {
        address[] memory nftAddresses = new address[](1);
        nftAddresses[0] = address(0x1234);
        uint8[] memory nftTypes = new uint8[](1);
        nftTypes[0] = uint8(CookieJarLib.NFTType.ERC721);
        vm.startPrank(user);
        factory.depositMinETH{value: 50e18}();
        address jarAddress = factory.createCookieJar(
            user,
            address(3),
            /// @dev address(3) for ETH jars.
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            strictPurpose,
            true, // emergencyWithdrawalEnabled
            "Test Metadata"
        );
        CookieJarRegistry.CookieJarInfo memory temp = registry
            .getJarByCreatorAddress(user);
        assertEq(
            CookieJar(payable(jarAddress)).currencyHeldByJar(),
            50e18 - ((50e18 * config.feePercentageOnDeposit) / 100)
        );
        assertEq(
            jarAddress.balance,
            50e18 - ((50e18 * config.feePercentageOnDeposit) / 100)
        );
        assertEq(temp.metadata, "Test Metadata");
    }

    function testCreateERC20CookieJarNFTMode() public {
        address[] memory nftAddresses = new address[](1);
        nftAddresses[0] = address(0x1234);
        uint8[] memory nftTypes = new uint8[](1);
        nftTypes[0] = uint8(CookieJarLib.NFTType.ERC721);
        vm.startPrank(user);
        ERC20(address(testToken)).approve(address(factory), 10e18);
        factory.depositMinERC20(10e18, address(testToken));
        address jarAddress = factory.createCookieJar(
            user,
            address(testToken),
            /// @dev address(3) for ETH jars.
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            strictPurpose,
            true, // emergencyWithdrawalEnabled
            "Test Metadata"
        );
        CookieJarRegistry.CookieJarInfo memory temp = registry
            .getJarByCreatorAddress(user);
        assertEq(
            CookieJar(payable(jarAddress)).currencyHeldByJar(),
            10e18 - ((10e18 * config.feePercentageOnDeposit) / 100)
        );
        assertEq(
            ERC20(testToken).balanceOf(jarAddress),
            10e18 - ((10e18 * config.feePercentageOnDeposit) / 100)
        );
        assertEq(temp.metadata, "Test Metadata");
    }

    function testWithoutFeeForCreatingCookieJar() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                CookieJarFactory
                    .CookieJarFactory__LessThanMinimumDeposit
                    .selector
            )
        );
        factory.depositMinETH{value: 99}();
    }

    /// @notice Test that NFTGated mode must have at least one NFT address.
    function testCreateETHCookieJarNFTModeNoAddresses() public {
        address[] memory emptyAddresses = new address[](0);
        uint8[] memory emptyTypes = new uint8[](0);

        vm.startPrank(user);

        factory.depositMinETH{value: 50e18}();
        vm.expectRevert(
            abi.encodeWithSelector(CookieJarLib.NoNFTAddressesProvided.selector)
        );
        factory.createCookieJar(
            user,
            address(3),
            /// @dev address(3) for ETH jars.
            CookieJarLib.AccessType.NFTGated,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            strictPurpose,
            true, // emergencyWithdrawalEnabled
            "Test Metadata"
        );
        vm.stopPrank();
    }

    /// @notice Test that factory creation reverts if an invalid NFT type (>2) is provided.
    function testFactoryCreateCookieJarInvalidNFTType() public {
        address[] memory nftAddresses = new address[](1);
        nftAddresses[0] = address(0x1234);
        uint8[] memory nftTypes = new uint8[](1);
        nftTypes[0] = 3; // invalid NFT type

        vm.startPrank(user);

        factory.depositMinETH{value: 50e18}();
        vm.expectRevert(
            abi.encodeWithSelector(CookieJarLib.InvalidNFTType.selector)
        );
        factory.createCookieJar(
            user,
            address(3),
            /// @dev address(3) for ETH jars.
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            strictPurpose,
            true, // emergencyWithdrawalEnabled
            "Test Metadata"
        );
        vm.stopPrank();
    }
}
