// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CookieJar.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title CookieJarFactory
/// @notice A factory contract to deploy "cookie jars" for users.
/// @notice A cookie jar is a contract that allows users to deposit funds, and create a whitelist for users that can "claim", example airdrops.
/// @notice DO NOT DIRECTLY SEND FUNDS TO THIS CONTRACT, USE DEPOSIT FUNCTIONS TO DEPOSIT AND STORE THE DATA IN THIS CONTRACT.
/// @dev Handles Protocol Access Control and jar deployments.
contract CookieJarFactory is AccessControl {
    /// @dev Openzeppelin AccessControl role instances.
    bytes32 public constant OWNER = keccak256("OWNER");
    bytes32 public constant PROTOCOL_ADMIN = keccak256("PROTOCOL_ADMIN");
    bytes32 public constant BLACKLISTED_JAR_CREATORS = keccak256("BLACKLISTED_JAR_CREATORS");

    address[] public cookieJars;
    string[] public metadatas;

    address public immutable defaultFeeCollector;
    uint256 public immutable defaultFeePercentage;

    uint256 public immutable minETHDeposit;
    uint256 public immutable minERC20Deposit;

    // --- Custom Error ---
    error CookieJarFactory__Blacklisted();
    error CookieJarFactory__NotAuthorized();
    error CookieJarFactory__MismatchedArrayLengths();
    error CookieJarFactory__UserIsNotBlacklisted();
    error CookieJarFactory__NotValidERC20();

    // --- Events ---
    event CookieJarCreated(address indexed creator, address cookieJarAddress, string metadata);
    event BlacklistRoleGranted(address[] users);
    event ProtocolAdminUpdated(address indexed previous, address indexed current);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyNotBlacklisted(address _user) {
        if (hasRole(BLACKLISTED_JAR_CREATORS, _user)) revert CookieJarFactory__Blacklisted();
        _;
    }

    /// @param _defaultFeeCollector The address that will receive the fees from all deposits on all jars.
    /// @param _owner The contract owner address.
    /// @param _feePercentage The default fee percentage for all deposits on all jars. 100% = 10000.
    /// @param _minETHDeposit The minimum ETH deposit amount.
    /// @param _minERC20Deposit The minimum ERC20 deposit amount.
    constructor(
        address _defaultFeeCollector,
        address _owner,
        uint256 _feePercentage,
        uint256 _minETHDeposit,
        uint256 _minERC20Deposit
    ) {
        if (_defaultFeeCollector == address(0)) revert CookieJarLib.FeeCollectorAddressCannotBeZeroAddress();
        defaultFeeCollector = _defaultFeeCollector;
        defaultFeePercentage = _feePercentage;
        minETHDeposit = _minETHDeposit;
        minERC20Deposit = _minERC20Deposit;
        _grantRole(OWNER, _owner);
        _grantRole(PROTOCOL_ADMIN, _owner);
        _setRoleAdmin(PROTOCOL_ADMIN, OWNER);
        _setRoleAdmin(BLACKLISTED_JAR_CREATORS, OWNER);
    }

    // --- Restricted Functions ---

    /// @notice Update the global blacklist for an address.
    /// @dev Restricts the ability to create new CookieJars for a given address.
    /// @param _users The address to update.
    function grantBlacklistedJarCreatorsRole(address[] calldata _users) external onlyRole(PROTOCOL_ADMIN) {
        if (_users.length == 0) revert CookieJarFactory__MismatchedArrayLengths();

        for (uint256 i = 0; i < _users.length; i++) {
            _grantRole(BLACKLISTED_JAR_CREATORS, _users[i]);
        }

        emit BlacklistRoleGranted(_users);
    }

    /// @notice Removes a user from blacklist.
    /// @param _users The address to update.
    function revokeBlacklistedJarCreatorsRole(address[] calldata _users) external onlyRole(PROTOCOL_ADMIN) {
        if (_users.length == 0) revert CookieJarFactory__MismatchedArrayLengths();
        for (uint256 i = 0; i < _users.length; i++) {
            _revokeRole(BLACKLISTED_JAR_CREATORS, _users[i]);
        }
        emit BlacklistRoleGranted(_users);
    }

    /// @notice Grants the protocol admin role to a new address.
    /// @param _admin The address to update.
    function grantProtocolAdminRole(address _admin) external onlyRole(OWNER) {
        _grantRole(PROTOCOL_ADMIN, _admin);
        emit ProtocolAdminUpdated(msg.sender, _admin);
    }

    /// @notice Grants owner role to a new address, and revokes previous owner with the owner role.
    /// @param _newOwner Address of the new owner.
    function transferOwnership(address _newOwner) public onlyRole(OWNER) {
        _revokeRole(OWNER, msg.sender);
        _grantRole(OWNER, _newOwner);
        emit OwnershipTransferred(msg.sender, _newOwner);
    }

    // --- Public Functions ---

    /// @notice Creates a new CookieJar contract and updates jar data in CookieJarRegistry.
    /// @notice Currently only one currency ERC20 is supported.
    /// @notice Creator needs to call deposit function before creating a jar, and all the funds deposited will be sent to new jar.
    /// @param _cookieJarOwner Address of the new CookieJar owner.
    /// @param _supportedCurrency Address of the supported currency for the jar address(3) if native ETH.
    /// @param _accessType Claim mode: Whitelist or NFTGated.
    /// @param _nftAddresses Array of NFT contract addresses (only for NFTGated mode).
    /// @param _nftTypes Array of NFT types corresponding to _nftAddresses.
    /// @param _withdrawalOption Fixed or Variable withdrawal type.
    /// @param _fixedAmount Withdrawal amount if Fixed.
    /// @param _maxWithdrawal Maximum allowed withdrawal if Variable.
    /// @param _withdrawalInterval Time interval between withdrawals.
    /// @param _strictPurpose If true, requires a purpose length ≥20 characters.
    /// @param _emergencyWithdrawalEnabled If true, emergency withdrawal is enabled.
    /// @param metadata Optional metadata for off-chain tracking.
    function createCookieJar(
        address _cookieJarOwner,
        address _supportedCurrency,
        CookieJarLib.AccessType _accessType,
        address[] calldata _nftAddresses,
        CookieJarLib.NFTType[] calldata _nftTypes,
        CookieJarLib.WithdrawalTypeOptions _withdrawalOption,
        uint256 _fixedAmount,
        uint256 _maxWithdrawal,
        uint256 _withdrawalInterval,
        bool _strictPurpose,
        bool _emergencyWithdrawalEnabled,
        bool _oneTimeWithdrawal,
        address[] calldata _whitelist,
        string calldata metadata
    ) external onlyNotBlacklisted(msg.sender) returns (address) {
        uint256 minDeposit = minETHDeposit;
        if (_supportedCurrency != address(3)) {
            if (ERC20(_supportedCurrency).decimals() == 0) revert CookieJarFactory__NotValidERC20();
            minDeposit = minERC20Deposit;
        }
        CookieJar newJar = new CookieJar(
            _cookieJarOwner,
            _supportedCurrency,
            _accessType,
            _nftAddresses,
            _nftTypes,
            _withdrawalOption,
            _fixedAmount,
            _maxWithdrawal,
            _withdrawalInterval,
            minDeposit,
            defaultFeePercentage,
            _strictPurpose,
            defaultFeeCollector,
            _emergencyWithdrawalEnabled,
            _oneTimeWithdrawal,
            _whitelist
        );

        address jarAddress = address(newJar);
        cookieJars.push(jarAddress);
        metadatas.push(metadata);

        emit CookieJarCreated(msg.sender, jarAddress, metadata);
        return jarAddress;
    }

    function getCookieJars() external view returns (address[] memory) {
        return cookieJars;
    }

    function getMetadatas() external view returns (string[] memory) {
        return metadatas;
    }
}
