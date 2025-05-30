// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CookieJar.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

// --- Mock ERC20 ---
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyERC20 is ERC20 {
    constructor() ERC20("Dummy", "DUM") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// --- Mock ERC721 ---
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DummyERC721 is ERC721 {
    uint256 public nextdummyTokenId;

    constructor() ERC721("Dummy721", "D721") {}

    function mint(address to) external returns (uint256) {
        uint256 dummyTokenId = nextdummyTokenId;
        _mint(to, dummyTokenId);
        nextdummyTokenId++;
        return dummyTokenId;
    }
}

// --- Mock ERC1155 ---
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract DummyERC1155 is ERC1155 {
    constructor() ERC1155("https://dummy.uri/") {}

    function mint(address to, uint256 id, uint256 amount) external {
        _mint(to, id, amount, "");
    }
}

contract CookieJarTest is Test {
    CookieJar public jarWhitelistETHFixed;
    CookieJar public jarWhitelistERC20Fixed;
    CookieJar public jarNFTETHFixed;
    CookieJar public jarNFTERC20Variable;
    CookieJar public jarWhitelistETHOneTimeWithdrawal;
    CookieJar public jarNFTERC20OneTimeWithdrawal;
    CookieJar public jarWhitelistETHVariable;
    CookieJar public jarWhitelistERC20Variable;
    CookieJar public jarNFTETHVariable;
    CookieJar public jarNFTERC20Fixed;

    address public owner = address(0xABCD);
    address public user = address(0xBEEF);
    address public user2 = address(0xC0DE);
    address public attacker = address(0xBAD);

    uint256 public withdrawalInterval = 1 days;
    uint256 public fixedAmount = 1 ether;
    uint256 public maxWithdrawal = 2 ether;
    bool public strictPurpose = true;

    DummyERC20 public dummyToken;
    DummyERC721 public dummyERC721;
    DummyERC1155 public dummyERC1155;

    address[] public users;
    address[] public emptyAddresses;
    CookieJarLib.NFTType[] public emptyTypes;
    address[] public nftAddresses;
    CookieJarLib.NFTType[] public nftTypes;
    address[] public emptyWhitelist;
    string public purpose = "Withdrawal for a legitimate purpose!";
    string public shortPurpose = "Too short";

    uint256 public minETHDeposit = 100 wei;
    uint256 public minERC20Deposit = 100;
    uint256 public feePercentageOnDeposit = 1000;
    address public feeCollector = address(0xFEE);

    function setUp() public {
        dummyToken = new DummyERC20();
        dummyERC721 = new DummyERC721();
        dummyERC1155 = new DummyERC1155();

        users = new address[](2);
        users[0] = user;
        users[1] = user2;

        emptyAddresses = new address[](0);
        emptyTypes = new CookieJarLib.NFTType[](0);
        emptyWhitelist = new address[](0);

        nftAddresses = new address[](2);
        nftAddresses[0] = address(dummyERC721);
        nftAddresses[1] = address(dummyERC1155);
        nftTypes = new CookieJarLib.NFTType[](2);
        nftTypes[0] = CookieJarLib.NFTType.ERC721;
        nftTypes[1] = CookieJarLib.NFTType.ERC1155;

        vm.deal(owner, 100_000 ether);
        dummyToken.mint(owner, 100_000 * 1e18);
        vm.startPrank(owner);

        jarWhitelistETHFixed = new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false, // oneTimeWithdrawalEnabled
            emptyWhitelist
        );

        jarWhitelistERC20Fixed = new CookieJar(
            owner,
            address(dummyToken),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minERC20Deposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );

        jarNFTETHFixed = new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );

        jarNFTERC20Variable = new CookieJar(
            owner,
            address(dummyToken),
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Variable,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minERC20Deposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            false, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );

        jarWhitelistETHVariable = new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Variable,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );

        jarWhitelistERC20Variable = new CookieJar(
            owner,
            address(dummyToken),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Variable,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minERC20Deposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );

        jarNFTETHVariable = new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Variable,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );

        jarWhitelistETHOneTimeWithdrawal = new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.Whitelist,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            true,
            emptyWhitelist
        );

        jarNFTERC20OneTimeWithdrawal = new CookieJar(
            owner,
            address(dummyToken),
            /// @dev address(3) for ETH jars.
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minERC20Deposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            true,
            emptyWhitelist
        );

        jarNFTERC20Fixed = new CookieJar(
            owner,
            address(dummyToken),
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minERC20Deposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );

        jarWhitelistETHFixed.depositETH{value: 1000 ether}();
        dummyToken.approve(address(jarWhitelistERC20Fixed), 1000 * 1e18);
        jarWhitelistERC20Fixed.depositCurrency(1000 * 1e18);
        jarNFTETHFixed.depositETH{value: 1000 ether}();
        dummyToken.approve(address(jarNFTERC20Variable), 1000 * 1e18);
        jarNFTERC20Variable.depositCurrency(1000 * 1e18);
        jarWhitelistETHOneTimeWithdrawal.depositETH{value: 1000 ether}();
        dummyToken.approve(address(jarNFTERC20OneTimeWithdrawal), 1000 * 1e18);
        jarNFTERC20OneTimeWithdrawal.depositCurrency(1000 * 1e18);
        jarWhitelistETHVariable.depositETH{value: 1000 ether}();
        dummyToken.approve(address(jarWhitelistERC20Variable), 1000 * 1e18);
        jarWhitelistERC20Variable.depositCurrency(1000 * 1e18);
        jarNFTETHVariable.depositETH{value: 1000 ether}();
        dummyToken.approve(address(jarNFTERC20Fixed), 1000 * 1e18);
        jarNFTERC20Fixed.depositCurrency(1000 * 1e18);
        vm.stopPrank();
    }

    // ==== constructor tests ====

    function test_ConstructorWhitelistETHFixed() public {
        CookieJar newJarWhitelistETHFixed = new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            false,
            feeCollector,
            true,
            false,
            users
        );

        assertEq(newJarWhitelistETHFixed.feeCollector(), feeCollector);
        assertEq(newJarWhitelistETHFixed.feePercentageOnDeposit(), feePercentageOnDeposit);
        assertEq(newJarWhitelistETHFixed.minDeposit(), minETHDeposit);
        assertEq(newJarWhitelistETHFixed.withdrawalInterval(), withdrawalInterval);
        assertFalse(newJarWhitelistETHFixed.strictPurpose());
        assertTrue(newJarWhitelistETHFixed.emergencyWithdrawalEnabled());
        assertFalse(newJarWhitelistETHFixed.oneTimeWithdrawal());
        assertEq(newJarWhitelistETHFixed.getWhitelist().length, 2);
        assertEq(newJarWhitelistETHFixed.getWhitelist()[0], user);
        assertEq(newJarWhitelistETHFixed.getWhitelist()[1], user2);
        assertEq(newJarWhitelistETHFixed.getNFTGatesArray().length, 0);
        assertEq(newJarWhitelistETHFixed.getWithdrawalDataArray().length, 0);
        assertEq(newJarWhitelistETHFixed.currency(), address(3));
        assertTrue(newJarWhitelistETHFixed.accessType() == CookieJarLib.AccessType.Whitelist);
        assertTrue(newJarWhitelistETHFixed.withdrawalOption() == CookieJarLib.WithdrawalTypeOptions.Fixed);
        assertEq(newJarWhitelistETHFixed.fixedAmount(), fixedAmount);
        assertEq(newJarWhitelistETHFixed.maxWithdrawal(), maxWithdrawal);
        assertEq(newJarWhitelistETHFixed.currencyHeldByJar(), 0);
        assertTrue(newJarWhitelistETHFixed.hasRole(keccak256("JAR_OWNER"), owner));
    }

    function test_ConstructorNFTGatedERC20Variable() public {
        CookieJar newJarNFTGatedERC20Variable = new CookieJar(
            owner,
            address(dummyToken),
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Variable,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minERC20Deposit,
            feePercentageOnDeposit,
            true,
            feeCollector,
            false,
            true,
            emptyAddresses
        );

        assertEq(newJarNFTGatedERC20Variable.feeCollector(), feeCollector);
        assertEq(newJarNFTGatedERC20Variable.feePercentageOnDeposit(), feePercentageOnDeposit);
        assertEq(newJarNFTGatedERC20Variable.minDeposit(), minERC20Deposit);
        assertEq(newJarNFTGatedERC20Variable.withdrawalInterval(), withdrawalInterval);
        assertTrue(newJarNFTGatedERC20Variable.strictPurpose());
        assertFalse(newJarNFTGatedERC20Variable.emergencyWithdrawalEnabled());
        assertTrue(newJarNFTGatedERC20Variable.oneTimeWithdrawal());
        assertEq(newJarNFTGatedERC20Variable.getWhitelist().length, 0);
        assertEq(newJarNFTGatedERC20Variable.getNFTGatesArray().length, 2);
        assertEq(newJarNFTGatedERC20Variable.getNFTGatesArray()[0].nftAddress, address(dummyERC721));
        assertTrue(newJarNFTGatedERC20Variable.getNFTGatesArray()[0].nftType == CookieJarLib.NFTType.ERC721);
        assertEq(newJarNFTGatedERC20Variable.getNFTGatesArray()[1].nftAddress, address(dummyERC1155));
        assertTrue(newJarNFTGatedERC20Variable.getNFTGatesArray()[1].nftType == CookieJarLib.NFTType.ERC1155);
        assertEq(newJarNFTGatedERC20Variable.getWithdrawalDataArray().length, 0);
        assertEq(newJarNFTGatedERC20Variable.currency(), address(dummyToken));
        assertTrue(newJarNFTGatedERC20Variable.accessType() == CookieJarLib.AccessType.NFTGated);
        assertTrue(newJarNFTGatedERC20Variable.withdrawalOption() == CookieJarLib.WithdrawalTypeOptions.Variable);
        assertEq(newJarNFTGatedERC20Variable.fixedAmount(), fixedAmount);
        assertEq(newJarNFTGatedERC20Variable.maxWithdrawal(), maxWithdrawal);
        assertEq(newJarNFTGatedERC20Variable.currencyHeldByJar(), 0);
        assertTrue(newJarNFTGatedERC20Variable.hasRole(keccak256("JAR_OWNER"), owner));
    }

    function test_RevertWhen_ConstructorWithInvalidOwner() public {
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.AdminCannotBeZeroAddress.selector));
        new CookieJar(
            address(0),
            address(3),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            false,
            feeCollector,
            true,
            false,
            users
        );
    }

    function test_RevertWhen_ConstructorWithInvalidFeeCollector() public {
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.FeeCollectorAddressCannotBeZeroAddress.selector));
        new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            false,
            address(0),
            true,
            false,
            users
        );
    }

    function test_RevertWhen_ConstructorNFTGatedWithEmptyNFTAddresses() public {
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.NoNFTAddressesProvided.selector));
        new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.NFTGated,
            emptyAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            false,
            feeCollector,
            true,
            false,
            users
        );
    }

    function test_RevertWhen_ConstructorNFTGatedWithEmptyNFTTypes() public {
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.NFTArrayLengthMismatch.selector));
        new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            false,
            feeCollector,
            true,
            false,
            users
        );
    }

    function test_RevertWhen_ConstructorNFTGatedWithInvalidNFTGate() public {
        address[] memory invalidAddresses = new address[](2);
        invalidAddresses[0] = address(0);
        invalidAddresses[1] = address(dummyERC1155);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidNFTGate.selector));
        new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.NFTGated,
            invalidAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            false,
            feeCollector,
            true,
            false,
            emptyAddresses
        );
    }

    function test_RevertWhen_ConstructorNFTGatedWithDuplicateNFTGates() public {
        address[] memory dupAddresses = new address[](2);
        dupAddresses[0] = address(dummyERC721);
        dupAddresses[1] = address(dummyERC721);
        CookieJarLib.NFTType[] memory dupTypes = new CookieJarLib.NFTType[](2);
        dupTypes[0] = CookieJarLib.NFTType.ERC721;
        dupTypes[1] = CookieJarLib.NFTType.ERC721;
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.DuplicateNFTGate.selector));
        new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.NFTGated,
            dupAddresses,
            dupTypes,
            CookieJarLib.WithdrawalTypeOptions.Fixed,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            true,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            true,
            emptyWhitelist
        );
    }

    // ==== admin functions tests ====

    function test_grantJarWhitelistRole() public {
        assertFalse(jarWhitelistETHFixed.hasRole(keccak256("JAR_WHITELISTED"), user));
        assertFalse(jarWhitelistETHFixed.hasRole(keccak256("JAR_WHITELISTED"), user2));
        vm.prank(owner);
        jarWhitelistETHFixed.grantJarWhitelistRole(users);
        assertTrue(jarWhitelistETHFixed.hasRole(keccak256("JAR_WHITELISTED"), user));
        assertTrue(jarWhitelistETHFixed.hasRole(keccak256("JAR_WHITELISTED"), user2));
        assertEq(jarWhitelistETHFixed.getWhitelist().length, 2);
        assertEq(jarWhitelistETHFixed.getWhitelist()[0], user);
        assertEq(jarWhitelistETHFixed.getWhitelist()[1], user2);
    }

    function test_RevertWhen_grantJarWhitelistRoleCalledByNonOwner() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_OWNER
            )
        );
        jarWhitelistETHFixed.grantJarWhitelistRole(users);
    }

    function test_RevertWhen_grantJarWhitelistRoleCalledWithInvalidAccessType() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidAccessType.selector));
        jarNFTETHFixed.grantJarWhitelistRole(users);
    }

    function test_revokeJarWhitelistRole() public {
        vm.startPrank(owner);
        jarWhitelistETHFixed.grantJarWhitelistRole(users);
        jarWhitelistETHFixed.revokeJarWhitelistRole(users);
        assertFalse(jarWhitelistETHFixed.hasRole(keccak256("JAR_WHITELISTED"), user));
        assertFalse(jarWhitelistETHFixed.hasRole(keccak256("JAR_WHITELISTED"), user2));
        assertEq(jarWhitelistETHFixed.getWhitelist().length, 0);
    }

    function test_RevertWhen_revokeJarWhitelistRoleCalledByNonOwner() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_OWNER
            )
        );
        jarWhitelistETHFixed.revokeJarWhitelistRole(users);
    }

    function test_RevertWhen_revokeJarWhitelistRoleCalledWithInvalidAccessType() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidAccessType.selector));
        jarNFTETHFixed.revokeJarWhitelistRole(users);
    }

    function test_updateFeeCollector() public {
        address newCollector = address(0x1234);
        vm.prank(feeCollector);
        jarWhitelistETHFixed.updateFeeCollector(newCollector);
        assertEq(jarWhitelistETHFixed.feeCollector(), newCollector);
    }

    function test_RevertWhen_updateFeeCollectorCalledByNonFeeCollector() public {
        address newCollector = address(0x1234);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.NotFeeCollector.selector));
        jarWhitelistETHFixed.updateFeeCollector(newCollector);
    }

    function test_RevertWhen_updateFeeCollectorCalledWithInvalidFeeCollector() public {
        vm.prank(feeCollector);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.FeeCollectorAddressCannotBeZeroAddress.selector));
        jarWhitelistETHFixed.updateFeeCollector(address(0));
    }

    function test_addNFTGate() public {
        uint256 nftGatesLengthBefore = jarNFTETHFixed.getNFTGatesArray().length;
        vm.startPrank(owner);
        jarNFTETHFixed.addNFTGate(address(1), CookieJarLib.NFTType.ERC1155);
        jarNFTETHFixed.addNFTGate(address(2), CookieJarLib.NFTType.ERC721);
        jarNFTETHFixed.addNFTGate(address(3), CookieJarLib.NFTType.ERC1155);
        jarNFTETHFixed.addNFTGate(address(4), CookieJarLib.NFTType.ERC721);
        assertEq(jarNFTETHFixed.getNFTGatesArray().length, nftGatesLengthBefore + 4);
        assertEq(jarNFTETHFixed.getNFTGatesArray()[nftGatesLengthBefore].nftAddress, address(1));
        assertTrue(jarNFTETHFixed.getNFTGatesArray()[nftGatesLengthBefore].nftType == CookieJarLib.NFTType.ERC1155);
        assertEq(jarNFTETHFixed.getNFTGatesArray()[nftGatesLengthBefore + 1].nftAddress, address(2));
        assertTrue(jarNFTETHFixed.getNFTGatesArray()[nftGatesLengthBefore + 1].nftType == CookieJarLib.NFTType.ERC721);
        assertEq(jarNFTETHFixed.getNFTGatesArray()[nftGatesLengthBefore + 2].nftAddress, address(3));
        assertTrue(jarNFTETHFixed.getNFTGatesArray()[nftGatesLengthBefore + 2].nftType == CookieJarLib.NFTType.ERC1155);
        assertEq(jarNFTETHFixed.getNFTGatesArray()[nftGatesLengthBefore + 3].nftAddress, address(4));
        assertTrue(jarNFTETHFixed.getNFTGatesArray()[nftGatesLengthBefore + 3].nftType == CookieJarLib.NFTType.ERC721);
        vm.stopPrank();
    }

    function test_RevertWhen_addNFTGateCalledByNonOwner() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_OWNER
            )
        );
        jarNFTETHFixed.addNFTGate(address(1), CookieJarLib.NFTType.ERC1155);
    }

    function test_RevertWhen_addNFTGateCalledWithInvalidAccessType() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidAccessType.selector));
        jarWhitelistETHFixed.addNFTGate(address(1), CookieJarLib.NFTType.ERC1155);
    }

    function test_RevertWhen_addNFTGateCalledWithInvalidNFTType() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidNFTType.selector));
        jarNFTETHFixed.addNFTGate(address(1), CookieJarLib.NFTType.None);
    }

    function test_RevertWhen_addNFTGateCalledWithInvalidNFTAddress() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidNFTGate.selector));
        jarNFTETHFixed.addNFTGate(address(0), CookieJarLib.NFTType.ERC1155);
    }

    function test_RevertWhen_addNFTGateCalledWithDuplicateNFTGate() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.DuplicateNFTGate.selector));
        jarNFTETHFixed.addNFTGate(address(dummyERC721), CookieJarLib.NFTType.ERC721);
    }

    function test_RemoveNFTGate() public {
        uint256 nftGatesLengthBefore = jarNFTETHFixed.getNFTGatesArray().length;
        vm.startPrank(owner);
        jarNFTETHFixed.addNFTGate(address(1), CookieJarLib.NFTType.ERC1155);
        jarNFTETHFixed.removeNFTGate(address(1));
        assertEq(jarNFTETHFixed.getNFTGatesArray().length, nftGatesLengthBefore);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.NFTGateNotFound.selector));
        jarNFTETHFixed.removeNFTGate(address(1));
    }

    function test_RevertWhen_RemoveNFTGateCalledByNonOwner() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_OWNER
            )
        );
        jarNFTETHFixed.removeNFTGate(address(1));
    }

    function test_RevertWhen_RemoveNFTGateCalledWithInvalidAccessType() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidAccessType.selector));
        jarWhitelistETHFixed.removeNFTGate(address(1));
    }

    function test_RevertWhen_RemoveNFTGateCalledWithInvalidNFTAddress() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.NFTGateNotFound.selector));
        jarNFTETHFixed.removeNFTGate(address(1));
    }

    function test_UpdateMaxWithdrawalAmount() public {
        vm.prank(owner);
        jarNFTERC20Variable.UpdateMaxWithdrawalAmount(1000 * 1e18);
        assertEq(jarNFTERC20Variable.maxWithdrawal(), 1000 * 1e18);
    }

    function test_RevertWhen_UpdateMaxWithdrawalAmountCalledByNonOwner() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_OWNER
            )
        );
        jarNFTERC20Variable.UpdateMaxWithdrawalAmount(1000 * 1e18);
    }

    function test_RevertWhen_UpdateMaxWithdrawalAmountCalledWithZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.ZeroAmount.selector));
        jarNFTERC20Variable.UpdateMaxWithdrawalAmount(0);
    }

    function test_RevertWhen_UpdateMaxWithdrawalAmountCalledWithFixedWithdrawal() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidWithdrawalType.selector));
        jarNFTETHFixed.UpdateMaxWithdrawalAmount(1000 * 1e18);
    }

    function test_UpdateFixedWithdrawalAmount() public {
        vm.prank(owner);
        jarNFTETHFixed.updateFixedWithdrawalAmount(1000 * 1e18);
        assertEq(jarNFTETHFixed.fixedAmount(), 1000 * 1e18);
    }

    function test_RevertWhen_UpdateFixedWithdrawalAmountCalledWithVariableWithdrawal() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidWithdrawalType.selector));
        jarNFTERC20Variable.updateFixedWithdrawalAmount(1000 * 1e18);
    }

    function test_RevertWhen_UpdateFixedWithdrawalAmountCalledWithZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.ZeroAmount.selector));
        jarNFTETHFixed.updateFixedWithdrawalAmount(0);
    }

    function test_RevertWhen_UpdateFixedWithdrawalAmountCalledByNonOwner() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_OWNER
            )
        );
        jarNFTETHFixed.updateFixedWithdrawalAmount(1000 * 1e18);
    }

    function test_UpdateWithdrawalInterval() public {
        vm.prank(owner);
        jarNFTETHFixed.updateWithdrawalInterval(1000 * 1e18);
        assertEq(jarNFTETHFixed.withdrawalInterval(), 1000 * 1e18);
    }

    function test_RevertWhen_UpdateWithdrawalIntervalCalledWithZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.ZeroAmount.selector));
        jarNFTETHFixed.updateWithdrawalInterval(0);
    }

    function test_RevertWhen_UpdateWithdrawalIntervalCalledByNonOwner() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_OWNER
            )
        );
        jarNFTETHFixed.updateWithdrawalInterval(1000 * 1e18);
    }

    function test_emergencyWithdrawETH() public {
        uint256 jarBalanceBefore = address(jarNFTETHFixed).balance;
        uint256 currencyHeldByJarBefore = jarNFTETHFixed.currencyHeldByJar();
        assertEq(currencyHeldByJarBefore, jarBalanceBefore);
        uint256 ownerBalanceBefore = owner.balance;
        vm.prank(owner);
        jarNFTETHFixed.emergencyWithdraw(address(3), fixedAmount);
        assertEq(address(jarNFTETHFixed).balance, jarBalanceBefore - fixedAmount);
        assertEq(jarNFTETHFixed.currencyHeldByJar(), currencyHeldByJarBefore - fixedAmount);
        assertEq(owner.balance, ownerBalanceBefore + fixedAmount);
    }

    function test_emergencyWithdrawERC20() public {
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarWhitelistERC20Fixed));
        uint256 currencyHeldByJarBefore = jarWhitelistERC20Fixed.currencyHeldByJar();
        assertEq(currencyHeldByJarBefore, jarBalanceBefore);
        uint256 ownerBalanceBefore = owner.balance;
        vm.prank(owner);
        jarWhitelistERC20Fixed.emergencyWithdraw(address(dummyToken), fixedAmount);
        assertEq(dummyToken.balanceOf(address(jarWhitelistERC20Fixed)), jarBalanceBefore - fixedAmount);
        assertEq(jarWhitelistERC20Fixed.currencyHeldByJar(), currencyHeldByJarBefore - fixedAmount);
        assertEq(dummyToken.balanceOf(owner), ownerBalanceBefore + fixedAmount);
    }

    function test_emergencyWithdrawERC20NotJarToken() public {
        dummyToken.mint(address(jarWhitelistETHFixed), fixedAmount);
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarWhitelistETHFixed));
        uint256 ownerBalanceBefore = dummyToken.balanceOf(owner);
        uint256 currencyHeldByJarBefore = jarWhitelistETHFixed.currencyHeldByJar();
        vm.prank(owner);
        jarWhitelistETHFixed.emergencyWithdraw(address(dummyToken), fixedAmount);
        assertEq(dummyToken.balanceOf(address(jarWhitelistETHFixed)), jarBalanceBefore - fixedAmount);
        assertEq(dummyToken.balanceOf(owner), ownerBalanceBefore + fixedAmount);
        assertEq(jarWhitelistETHFixed.currencyHeldByJar(), currencyHeldByJarBefore);
    }

    function test_emergencyWithdrawETHNotJarToken() public {
        vm.deal(address(jarNFTERC20Fixed), fixedAmount);
        uint256 jarBalanceBefore = address(jarNFTERC20Fixed).balance;
        uint256 currencyHeldByJarBefore = jarNFTERC20Fixed.currencyHeldByJar();
        uint256 ownerBalanceBefore = owner.balance;
        vm.prank(owner);
        jarNFTERC20Fixed.emergencyWithdraw(address(3), fixedAmount);
        assertEq(address(jarNFTERC20Fixed).balance, jarBalanceBefore - fixedAmount);
        assertEq(jarNFTERC20Fixed.currencyHeldByJar(), currencyHeldByJarBefore);
        assertEq(owner.balance, ownerBalanceBefore + fixedAmount);
    }

    function test_RevertWhen_emergencyWithdrawCalledByNonOwner() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_OWNER
            )
        );
        jarWhitelistETHFixed.emergencyWithdraw(address(3), 1e18);
    }

    function test_RevertWhen_emergencyWithdrawCalledWithEmergencyWithdrawalDisabled() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.EmergencyWithdrawalDisabled.selector));
        jarNFTERC20Variable.emergencyWithdraw(address(dummyToken), 1e18);
    }

    function test_RevertWhen_emergencyWithdrawCalledWithInsufficientBalance() public {
        uint256 jarBalanceBefore = address(jarNFTETHFixed).balance;
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InsufficientBalance.selector));
        jarNFTETHFixed.emergencyWithdraw(address(3), jarBalanceBefore + 1);
    }

    function test_RevertWhen_emergencyWithdrawCalledWithZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.ZeroAmount.selector));
        jarNFTETHFixed.emergencyWithdraw(address(3), 0);
    }

    // ===== Deposit Tests =====

    function test_DepositETH() public {
        uint256 feeBalanceBefore = feeCollector.balance;
        uint256 jarwhitebalanceBefore = address(jarWhitelistETHFixed).balance;
        uint256 currencyHeldByJarBefore = jarWhitelistETHFixed.currencyHeldByJar();
        vm.deal(user, minETHDeposit);
        uint256 userBalanceBefore = user.balance;
        vm.prank(user);
        jarWhitelistETHFixed.depositETH{value: minETHDeposit}();
        uint256 fee = ((jarWhitelistETHFixed.feePercentageOnDeposit() * minETHDeposit) / 10000);
        uint256 amountMinusFee = minETHDeposit - fee;
        assertEq(address(jarWhitelistETHFixed).balance, jarwhitebalanceBefore + amountMinusFee);
        assertEq(feeCollector.balance, feeBalanceBefore + fee);
        assertEq(jarWhitelistETHFixed.currencyHeldByJar(), currencyHeldByJarBefore + amountMinusFee);
        assertEq(user.balance, userBalanceBefore - minETHDeposit);
    }

    function test_RevertWhen_DepositETHWithLessThanMinAmount() public {
        vm.deal(user, minETHDeposit - 1);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.LessThanMinimumDeposit.selector));
        jarWhitelistETHFixed.depositETH{value: minETHDeposit - 1}();
    }

    function test_RevertWhen_DepositETHWithZeroAmount() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.ZeroAmount.selector));
        jarWhitelistETHFixed.depositETH{value: 0}();
    }

    function test_RevertWhen_DepositETHWithInvalidTokenAddress() public {
        vm.deal(user, 10 ether);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidTokenAddress.selector));
        jarWhitelistERC20Fixed.depositETH{value: 10 ether}();
    }

    function test_DepositCurrency() public {
        dummyToken.mint(user, fixedAmount);

        uint256 feeBalanceBefore = dummyToken.balanceOf(feeCollector);
        uint256 currencyHeldByJarBefore = jarWhitelistERC20Fixed.currencyHeldByJar();
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarWhitelistERC20Fixed));
        uint256 userBalanceBefore = dummyToken.balanceOf(user);
        vm.startPrank(user);
        dummyToken.approve(address(jarWhitelistERC20Fixed), fixedAmount);
        jarWhitelistERC20Fixed.depositCurrency(fixedAmount);
        vm.stopPrank();
        uint256 fee = ((jarWhitelistERC20Fixed.feePercentageOnDeposit() * fixedAmount) / 10000);
        uint256 amountMinusFee = fixedAmount - fee;
        assertEq(dummyToken.balanceOf(feeCollector), feeBalanceBefore + fee);
        assertEq(dummyToken.balanceOf(address(jarWhitelistERC20Fixed)), jarBalanceBefore + amountMinusFee);
        assertEq(jarWhitelistERC20Fixed.currencyHeldByJar(), currencyHeldByJarBefore + amountMinusFee);
        assertEq(dummyToken.balanceOf(user), userBalanceBefore - fixedAmount);
    }

    function test_RevertWhen_DepositCurrencyWithLessThanMinAmount() public {
        dummyToken.mint(user, minERC20Deposit - 1);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.LessThanMinimumDeposit.selector));
        jarWhitelistERC20Fixed.depositCurrency(minERC20Deposit - 1);
    }

    function test_RevertWhen_DepositCurrencyWithZeroAmount() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.ZeroAmount.selector));
        jarWhitelistERC20Fixed.depositCurrency(0);
    }

    function test_RevertWhen_DepositCurrencyWithInvalidTokenAddress() public {
        deal(address(dummyToken), user, fixedAmount);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidTokenAddress.selector));
        jarWhitelistETHFixed.depositCurrency(fixedAmount);
    }

    // ===== Withdrawal Tests (Whitelist Mode) =====

    function test_WithdrawWhitelistETHFixed() public {
        vm.prank(owner);
        jarWhitelistETHFixed.grantJarWhitelistRole(users);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 currencyHeldByJarBefore = jarWhitelistETHFixed.currencyHeldByJar();
        uint256 initialBalance = address(jarWhitelistETHFixed).balance;
        uint256 userBalanceBefore = user.balance;
        vm.prank(user);
        jarWhitelistETHFixed.withdrawWhitelistMode(fixedAmount, purpose);
        assertEq(address(jarWhitelistETHFixed).balance, initialBalance - fixedAmount);
        assertEq(jarWhitelistETHFixed.currencyHeldByJar(), currencyHeldByJarBefore - fixedAmount);
        assertEq(user.balance, userBalanceBefore + fixedAmount);
        assertEq(jarWhitelistETHFixed.lastWithdrawalWhitelist(user), block.timestamp);
    }

    function test_WithdrawWhitelistERC20Fixed() public {
        vm.prank(owner);
        jarWhitelistERC20Fixed.grantJarWhitelistRole(users);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 currencyHeldByJarBefore = jarWhitelistERC20Fixed.currencyHeldByJar();
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarWhitelistERC20Fixed));
        uint256 userBalanceBefore = dummyToken.balanceOf(user);
        vm.prank(user);
        jarWhitelistERC20Fixed.withdrawWhitelistMode(fixedAmount, purpose);
        assertEq(jarWhitelistERC20Fixed.currencyHeldByJar(), currencyHeldByJarBefore - fixedAmount);
        assertEq(dummyToken.balanceOf(user), userBalanceBefore + fixedAmount);
        assertEq(dummyToken.balanceOf(address(jarWhitelistERC20Fixed)), jarBalanceBefore - fixedAmount);
        assertEq(jarWhitelistERC20Fixed.lastWithdrawalWhitelist(user), block.timestamp);
    }

    function test_WithdrawWhitelistETHVariable() public {
        vm.prank(owner);
        jarWhitelistETHVariable.grantJarWhitelistRole(users);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 currencyHeldByJarBefore = jarWhitelistETHVariable.currencyHeldByJar();
        uint256 initialBalance = address(jarWhitelistETHVariable).balance;
        uint256 userBalanceBefore = user.balance;
        vm.prank(user);
        jarWhitelistETHVariable.withdrawWhitelistMode(maxWithdrawal, purpose);
        assertEq(address(jarWhitelistETHVariable).balance, initialBalance - maxWithdrawal);
        assertEq(jarWhitelistETHVariable.currencyHeldByJar(), currencyHeldByJarBefore - maxWithdrawal);
        assertEq(user.balance, userBalanceBefore + maxWithdrawal);
        assertEq(jarWhitelistETHVariable.lastWithdrawalWhitelist(user), block.timestamp);
    }

    function test_WithdrawWhitelistERC20Variable() public {
        vm.prank(owner);
        jarWhitelistERC20Variable.grantJarWhitelistRole(users);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 currencyHeldByJarBefore = jarWhitelistERC20Variable.currencyHeldByJar();
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarWhitelistERC20Variable));
        uint256 userBalanceBefore = dummyToken.balanceOf(user);
        vm.prank(user);
        jarWhitelistERC20Variable.withdrawWhitelistMode(maxWithdrawal, purpose);
        assertEq(jarWhitelistERC20Variable.currencyHeldByJar(), currencyHeldByJarBefore - maxWithdrawal);
        assertEq(dummyToken.balanceOf(user), userBalanceBefore + maxWithdrawal);
        assertEq(dummyToken.balanceOf(address(jarWhitelistERC20Variable)), jarBalanceBefore - maxWithdrawal);
        assertEq(jarWhitelistERC20Variable.lastWithdrawalWhitelist(user), block.timestamp);
    }

    function test_RevertWhen_WithdrawWhitelistWrongAccessType() public {
        vm.prank(owner);
        jarNFTETHFixed.grantRole(CookieJarLib.JAR_WHITELISTED, user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidAccessType.selector));
        jarNFTETHFixed.withdrawWhitelistMode(fixedAmount, purpose);
    }

    function test_RevertWhen_WithdrawNotWhitelisted() public {
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, CookieJarLib.JAR_WHITELISTED
            )
        );
        jarWhitelistETHFixed.withdrawWhitelistMode(fixedAmount, purpose);
    }

    function test_RevertWhen_WithdrawWhitelistAmountZero() public {
        vm.prank(owner);
        jarWhitelistETHFixed.grantJarWhitelistRole(users);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.ZeroAmount.selector));
        jarWhitelistETHFixed.withdrawWhitelistMode(0, purpose);
    }

    function test_RevertWhen_WithdrawWhitelistShortPurpose() public {
        vm.prank(owner);
        jarWhitelistETHFixed.grantJarWhitelistRole(users);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidPurpose.selector));
        jarWhitelistETHFixed.withdrawWhitelistMode(fixedAmount, shortPurpose);
    }

    function test_RevertWhen_WithdrawWhitelistAlreadyWithdrawn() public {
        vm.prank(owner);
        jarWhitelistETHOneTimeWithdrawal.grantJarWhitelistRole(users);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        jarWhitelistETHOneTimeWithdrawal.withdrawWhitelistMode(fixedAmount, purpose);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        vm.expectRevert(CookieJarLib.WithdrawalAlreadyDone.selector);
        jarWhitelistETHOneTimeWithdrawal.withdrawWhitelistMode(fixedAmount, purpose);
    }

    function test_RevertWhen_WithdrawWhitelistTooSoon() public {
        vm.prank(owner);
        jarWhitelistETHFixed.grantJarWhitelistRole(users);
        vm.prank(user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        jarWhitelistETHFixed.withdrawWhitelistMode(fixedAmount, purpose);
        uint256 nextAllowed = jarWhitelistETHFixed.lastWithdrawalWhitelist(user) + withdrawalInterval;
        vm.prank(user);
        skip(100);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.WithdrawalTooSoon.selector, nextAllowed));
        jarWhitelistETHFixed.withdrawWhitelistMode(fixedAmount, purpose);
    }

    function test_RevertWhen_WithdrawWhitelistWrongAmountFixed() public {
        vm.prank(owner);
        jarWhitelistETHFixed.grantJarWhitelistRole(users);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 wrongAmount = fixedAmount + 1;
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(CookieJarLib.WithdrawalAmountNotAllowed.selector, wrongAmount, fixedAmount)
        );
        jarWhitelistETHFixed.withdrawWhitelistMode(wrongAmount, purpose);
    }

    function test_RevertWhen_WithdrawWhitelistInsufficientBalance() public {
        vm.prank(owner);
        CookieJar newJar = new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.Whitelist,
            emptyAddresses,
            emptyTypes,
            CookieJarLib.WithdrawalTypeOptions.Variable,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );
        vm.prank(owner);
        newJar.grantJarWhitelistRole(users);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InsufficientBalance.selector));
        newJar.withdrawWhitelistMode(maxWithdrawal, purpose);
    }

    // ===== Withdrawal Tests (NFTGated Mode) =====

    function test_WithdrawNFTModeETHFixedERC721() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 jarBalanceBefore = address(jarNFTETHFixed).balance;
        uint256 currencyHeldByJarBefore = jarNFTETHFixed.currencyHeldByJar();
        uint256 userBalanceBefore = user.balance;
        vm.prank(user);
        jarNFTETHFixed.withdrawNFTMode(fixedAmount, purpose, address(dummyERC721), dummyTokenId);
        assertEq(address(jarNFTETHFixed).balance, jarBalanceBefore - fixedAmount);
        assertEq(jarNFTETHFixed.currencyHeldByJar(), currencyHeldByJarBefore - fixedAmount);
        assertEq(user.balance, userBalanceBefore + fixedAmount);
        assertEq(jarNFTETHFixed.lastWithdrawalNFT(address(dummyERC721), dummyTokenId), block.timestamp);
    }

    function test_WithdrawNFTModeETHFixedERC1155() public {
        uint256 dummyTokenId = 1;
        dummyERC1155.mint(user, dummyTokenId, 1);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 jarBalanceBefore = address(jarNFTETHFixed).balance;
        uint256 currencyHeldByJarBefore = jarNFTETHFixed.currencyHeldByJar();
        uint256 userBalanceBefore = user.balance;
        vm.prank(user);
        jarNFTETHFixed.withdrawNFTMode(fixedAmount, purpose, address(dummyERC1155), dummyTokenId);
        assertEq(address(jarNFTETHFixed).balance, jarBalanceBefore - fixedAmount);
        assertEq(jarNFTETHFixed.currencyHeldByJar(), currencyHeldByJarBefore - fixedAmount);
        assertEq(user.balance, userBalanceBefore + fixedAmount);
        assertEq(jarNFTETHFixed.lastWithdrawalNFT(address(dummyERC1155), dummyTokenId), block.timestamp);
    }

    function test_WithdrawNFTModeETHVariableERC721() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 jarBalanceBefore = address(jarNFTETHVariable).balance;
        uint256 currencyHeldByJarBefore = jarNFTETHVariable.currencyHeldByJar();
        uint256 userBalanceBefore = user.balance;
        vm.prank(user);
        jarNFTETHVariable.withdrawNFTMode(maxWithdrawal, purpose, address(dummyERC721), dummyTokenId);
        assertEq(address(jarNFTETHVariable).balance, jarBalanceBefore - maxWithdrawal);
        assertEq(jarNFTETHVariable.currencyHeldByJar(), currencyHeldByJarBefore - maxWithdrawal);
        assertEq(user.balance, userBalanceBefore + maxWithdrawal);
        assertEq(jarNFTETHVariable.lastWithdrawalNFT(address(dummyERC721), dummyTokenId), block.timestamp);
    }

    function test_WithdrawNFTModeETHVariableERC1155() public {
        uint256 dummyTokenId = 1;
        dummyERC1155.mint(user, dummyTokenId, 1);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 jarBalanceBefore = address(jarNFTETHVariable).balance;
        uint256 currencyHeldByJarBefore = jarNFTETHVariable.currencyHeldByJar();
        uint256 userBalanceBefore = user.balance;
        vm.prank(user);
        jarNFTETHVariable.withdrawNFTMode(maxWithdrawal, purpose, address(dummyERC1155), dummyTokenId);
        assertEq(address(jarNFTETHVariable).balance, jarBalanceBefore - maxWithdrawal);
        assertEq(jarNFTETHVariable.currencyHeldByJar(), currencyHeldByJarBefore - maxWithdrawal);
        assertEq(user.balance, userBalanceBefore + maxWithdrawal);
        assertEq(jarNFTETHVariable.lastWithdrawalNFT(address(dummyERC1155), dummyTokenId), block.timestamp);
    }

    function test_WithdrawNFTModeERC20FixedERC721() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarNFTERC20Fixed));
        uint256 currencyHeldByJarBefore = jarNFTERC20Fixed.currencyHeldByJar();
        uint256 userBalanceBefore = dummyToken.balanceOf(user);
        vm.prank(user);
        jarNFTERC20Fixed.withdrawNFTMode(fixedAmount, purpose, address(dummyERC721), dummyTokenId);
        assertEq(dummyToken.balanceOf(address(jarNFTERC20Fixed)), jarBalanceBefore - fixedAmount);
        assertEq(jarNFTERC20Fixed.currencyHeldByJar(), currencyHeldByJarBefore - fixedAmount);
        assertEq(dummyToken.balanceOf(user), userBalanceBefore + fixedAmount);
        assertEq(jarNFTERC20Fixed.lastWithdrawalNFT(address(dummyERC721), dummyTokenId), block.timestamp);
    }

    function test_WithdrawNFTModeERC20FixedERC1155() public {
        uint256 dummyTokenId = 1;
        dummyERC1155.mint(user, dummyTokenId, 1);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarNFTERC20Fixed));
        uint256 currencyHeldByJarBefore = jarNFTERC20Fixed.currencyHeldByJar();
        uint256 userBalanceBefore = dummyToken.balanceOf(user);
        vm.prank(user);
        jarNFTERC20Fixed.withdrawNFTMode(fixedAmount, purpose, address(dummyERC1155), dummyTokenId);
        assertEq(dummyToken.balanceOf(address(jarNFTERC20Fixed)), jarBalanceBefore - fixedAmount);
        assertEq(jarNFTERC20Fixed.currencyHeldByJar(), currencyHeldByJarBefore - fixedAmount);
        assertEq(dummyToken.balanceOf(user), userBalanceBefore + fixedAmount);
        assertEq(jarNFTERC20Fixed.lastWithdrawalNFT(address(dummyERC1155), dummyTokenId), block.timestamp);
    }

    function test_WithdrawNFTModeERC20VariableERC721() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarNFTERC20Variable));
        uint256 currencyHeldByJarBefore = jarNFTERC20Variable.currencyHeldByJar();
        uint256 userBalanceBefore = dummyToken.balanceOf(user);
        vm.prank(user);
        jarNFTERC20Variable.withdrawNFTMode(maxWithdrawal, purpose, address(dummyERC721), dummyTokenId);
        assertEq(dummyToken.balanceOf(address(jarNFTERC20Variable)), jarBalanceBefore - maxWithdrawal);
        assertEq(jarNFTERC20Variable.currencyHeldByJar(), currencyHeldByJarBefore - maxWithdrawal);
        assertEq(dummyToken.balanceOf(user), userBalanceBefore + maxWithdrawal);
        assertEq(jarNFTERC20Variable.lastWithdrawalNFT(address(dummyERC721), dummyTokenId), block.timestamp);
    }

    function test_WithdrawNFTModeERC20VariableERC1155() public {
        uint256 dummyTokenId = 1;
        dummyERC1155.mint(user, dummyTokenId, 1);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 jarBalanceBefore = dummyToken.balanceOf(address(jarNFTERC20Variable));
        uint256 currencyHeldByJarBefore = jarNFTERC20Variable.currencyHeldByJar();
        uint256 userBalanceBefore = dummyToken.balanceOf(user);
        vm.prank(user);
        jarNFTERC20Variable.withdrawNFTMode(maxWithdrawal, purpose, address(dummyERC1155), dummyTokenId);
        assertEq(dummyToken.balanceOf(address(jarNFTERC20Variable)), jarBalanceBefore - maxWithdrawal);
        assertEq(jarNFTERC20Variable.currencyHeldByJar(), currencyHeldByJarBefore - maxWithdrawal);
        assertEq(dummyToken.balanceOf(user), userBalanceBefore + maxWithdrawal);
        assertEq(jarNFTERC20Variable.lastWithdrawalNFT(address(dummyERC1155), dummyTokenId), block.timestamp);
    }

    function test_RevertWhen_WithdrawNFTModeInvalidAccessType() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidAccessType.selector));
        jarWhitelistETHFixed.withdrawNFTMode(fixedAmount, purpose, address(dummyERC721), 1);
    }

    function test_RevertWhen_WithdrawNFTModeInvalidNFTGate() public {
        DummyERC721 newDummyERC721 = new DummyERC721();
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidNFTGate.selector));
        jarNFTERC20Fixed.withdrawNFTMode(fixedAmount, purpose, address(newDummyERC721), 1);
    }

    function test_RevertWhen_WithdrawNFTModeNotOwnerERC721() public {
        uint256 dummyTokenId = dummyERC721.mint(attacker);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.NotAuthorized.selector));
        jarNFTETHFixed.withdrawNFTMode(fixedAmount, purpose, address(dummyERC721), dummyTokenId);
    }

    function test_RevertWhen_WithdrawNFTModeNotOwnerERC1155() public {
        uint256 dummyTokenId = 1;
        dummyERC1155.mint(attacker, dummyTokenId, 1);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.NotAuthorized.selector));
        jarNFTETHVariable.withdrawNFTMode(fixedAmount, purpose, address(dummyERC1155), dummyTokenId);
    }

    function test_RevertWhen_WithdrawNFTModeAmountZero() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.ZeroAmount.selector));
        jarNFTETHFixed.withdrawNFTMode(0, purpose, address(dummyERC721), dummyTokenId);
    }

    function test_RevertWhen_WithdrawNFTModeShortPurpose() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InvalidPurpose.selector));
        jarNFTERC20Fixed.withdrawNFTMode(fixedAmount, shortPurpose, address(dummyERC721), dummyTokenId);
    }

    function test_RevertWhen_WithdrawNFTModeAlreadyWithdrawn() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.startPrank(user);
        jarNFTERC20OneTimeWithdrawal.withdrawNFTMode(fixedAmount, purpose, address(dummyERC721), dummyTokenId);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.expectRevert(CookieJarLib.WithdrawalAlreadyDone.selector);
        jarNFTERC20OneTimeWithdrawal.withdrawNFTMode(fixedAmount, purpose, address(dummyERC721), dummyTokenId);
        vm.stopPrank();
    }

    function test_RevertWhen_WithdrawNFTModeTooSoon() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.prank(user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        jarNFTERC20Variable.withdrawNFTMode(fixedAmount, purpose, address(dummyERC721), dummyTokenId);
        uint256 nextAllowed =
            jarNFTERC20Variable.lastWithdrawalNFT(address(dummyERC721), dummyTokenId) + withdrawalInterval;
        vm.prank(user);
        skip(100);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.WithdrawalTooSoon.selector, nextAllowed));
        jarNFTERC20Variable.withdrawNFTMode(fixedAmount, purpose, address(dummyERC721), dummyTokenId);
    }

    function test_RevertWhen_WithdrawNFTModeWrongAmountFixed() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.warp(block.timestamp + withdrawalInterval + 1);
        uint256 wrongAmount = fixedAmount + 1;
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(CookieJarLib.WithdrawalAmountNotAllowed.selector, wrongAmount, fixedAmount)
        );
        jarNFTERC20Fixed.withdrawNFTMode(wrongAmount, purpose, address(dummyERC721), dummyTokenId);
    }

    function test_RevertWhen_WithdrawNFTModeInsufficientBalance() public {
        uint256 dummyTokenId = dummyERC721.mint(user);
        vm.prank(owner);
        CookieJar newJar = new CookieJar(
            owner,
            address(3),
            CookieJarLib.AccessType.NFTGated,
            nftAddresses,
            nftTypes,
            CookieJarLib.WithdrawalTypeOptions.Variable,
            fixedAmount,
            maxWithdrawal,
            withdrawalInterval,
            minETHDeposit,
            feePercentageOnDeposit,
            strictPurpose,
            feeCollector,
            true, // emergencyWithdrawalEnabled
            false,
            emptyWhitelist
        );
        vm.warp(block.timestamp + withdrawalInterval + 1);
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(CookieJarLib.InsufficientBalance.selector));
        newJar.withdrawNFTMode(maxWithdrawal, purpose, address(dummyERC721), dummyTokenId);
    }
}
