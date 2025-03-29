// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CookieJar.sol";
import "./CookieJarRegistry.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title CookieJarFactory
 * @notice A factory contract to deploy "cookie jars" for users.
 * @notice A cookie jar is a contract that allows users to deposit funds, and create a whitelist for users that can "claim", example airdrops.
 * @notice DO NOT DIRECTLY SEND FUNDS TO THIS CONTRACT, USE DEPOSIT FUNCTIONS TO DEPOSIT AND STORE THE DATA IN THIS CONTRACT.
 * @dev Handles Protocol Access Control and jar deployments.
 */
contract CookieJarFactory is AccessControl {
    /// @dev Openzeppelin AccessControl role instances.
    bytes32 public constant OWNER = keccak256("OWNER");
    bytes32 public constant PROTOCOL_ADMIN = keccak256("PROTOCOL_ADMIN");
    bytes32 public constant BLACKLISTED_JAR_CREATORS = keccak256("BLACKLISTED_JAR_CREATORS");

    /// @dev Default fee collector for new CookieJar contracts.
    address public defaultFeeCollector;
    uint256 public defaultFeePercentage;

    uint256 public minETHDeposit;
    uint256 public minERC20Deposit;

    /// @dev Instance of the CookieJarRegistry contract.
    CookieJarRegistry public registry;

    /// @dev Mapping to store user deposited amounts for jar creation.
    mapping(address => mapping(address => uint256)) jarOwnerToCurrencyAddressToAmount;

    // --- Custom Error ---
    error CookieJarFactory__NotFeeCollector();
    error CookieJarFactory__TransferFailed();
    error CookieJarFactory__LessThanMinimumDeposit();
    error CookieJarFactory__Blacklisted();
    error CookieJarFactory__NotAuthorized();
    error CookieJarFactory__MismatchedArrayLengths();
    error CookieJarFactory__UserIsNotBlacklisted();
    error CookieJarFactory__NotValidERC20();
    error CookieJarFactory__NotSufficientAllowance();
    error CookieJarFactory__WithdrawingMoreThanDeposited();

    // --- Events ---
    event CookieJarCreated(address indexed creator, address cookieJarAddress, string metadata);
    event BlacklistRoleGranted(address[] users);
    event ProtocolAdminUpdated(address indexed previous, address indexed current);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyNotBlacklisted(address _user) {
        if (hasRole(BLACKLISTED_JAR_CREATORS, _user) == true) {
            revert CookieJarFactory__Blacklisted();
        }
        _;
    }

    modifier onlyDepositedMinAmount(address _currency, address _jarCreator) {
        if (_currency == address(3)) {
            if (jarOwnerToCurrencyAddressToAmount[_jarCreator][address(3)] < minETHDeposit) {
                revert CookieJarFactory__LessThanMinimumDeposit();
            }
        } else {
            if (jarOwnerToCurrencyAddressToAmount[_jarCreator][_currency] < minERC20Deposit) {
                revert CookieJarFactory__LessThanMinimumDeposit();
            }
        }
        _;
    }

    /**
     * @param _defaultFeeCollector The default fee collector address.
     * @param _registry The address of the CookieJarRegistry contract.
     * @param _owner The contract owner address.
     * @param _feePercentage The default fee percentage for all deposits on all vaults.
     * Fee is calculated inside Jar contract whenever a deposit is made, according to the decimals of the currency.
     */
    constructor(
        address _defaultFeeCollector,
        address _registry,
        address _owner,
        uint256 _feePercentage,
        uint256 _minETHDeposit,
        uint256 _minERC20Deposit
    ) {
        defaultFeeCollector = _defaultFeeCollector;
        registry = CookieJarRegistry(_registry);
        defaultFeePercentage = _feePercentage;
        minETHDeposit = _minETHDeposit;
        minERC20Deposit = _minERC20Deposit;
        _grantRole(OWNER, _owner);
        _grantRole(PROTOCOL_ADMIN, _owner);
        _setRoleAdmin(PROTOCOL_ADMIN, OWNER);
        _setRoleAdmin(BLACKLISTED_JAR_CREATORS, OWNER);
    }

    // --- Restricted Functions ---

    /**
     * @notice Update the global blacklist for an address.
     * @dev Restricts the ability to create new CookieJars for a given address.
     * @param _users The address to update.
     */
    function grantBlacklistedJarCreatorsRole(address[] calldata _users) external onlyRole(PROTOCOL_ADMIN) {
        if (_users.length < 1) {
            revert CookieJarFactory__MismatchedArrayLengths();
        }

        for (uint256 i = 0; i < _users.length; i++) {
            _grantRole(BLACKLISTED_JAR_CREATORS, _users[i]);
        }

        emit BlacklistRoleGranted(_users);
    }

    /**
     * @notice Removes a user from blacklist.
     * @param _users The address to update.
     */
    function revokeBlacklistedJarCreatorsRole(address[] calldata _users) external onlyRole(PROTOCOL_ADMIN) {
        if (hasRole(BLACKLISTED_JAR_CREATORS, msg.sender) != true) {
            revert CookieJarFactory__UserIsNotBlacklisted();
        }
        if (_users.length < 1) {
            revert CookieJarFactory__MismatchedArrayLengths();
        }
        for (uint256 i = 0; i < _users.length; i++) {
            _revokeRole(BLACKLISTED_JAR_CREATORS, _users[i]);
        }
        emit BlacklistRoleGranted(_users);
    }

    /**
     * @notice Grants the protocol admin role to a new address.
     * @param _admin The address to update.
     */
    function grantProtocolAdminRole(address _admin) external onlyRole(OWNER) {
        _grantRole(PROTOCOL_ADMIN, _admin);
        emit ProtocolAdminUpdated(msg.sender, _admin);
    }

    /**
     * @notice Grants owner role to a new address, and revokes previous owner with the owner role.
     * @param _newOwner Address of the new owner.
     */
    function transferOwnership(address _newOwner) public onlyRole(OWNER) {
        _revokeRole(OWNER, msg.sender);
        _grantRole(OWNER, _newOwner);
        emit OwnershipTransferred(msg.sender, _newOwner);
    }

    /**
     * @notice This function is called to deposit minimum jar creation funds, in ETH.
     * @notice NO FEE ON FIRST TIME DEPOSITS i.e. USING THIS CONTRACT TO CREATE A NEW JAR.
     * @notice This needs to be called before createCookieJar, in order to create a jar.
     */
    function depositMinETH() external payable onlyNotBlacklisted(msg.sender) {
        if (msg.value < minETHDeposit) {
            revert CookieJarFactory__LessThanMinimumDeposit();
        }
        uint256 amountRemaining = _calculateAndTransferFeeToCollector(msg.value, address(3));
        jarOwnerToCurrencyAddressToAmount[msg.sender][address(3)] += amountRemaining;
    }

    /**
     * @notice This function is called to deposit minimum jar creation funds, in ERC20.
     * @notice NO FEE ON FIRST TIME DEPOSITS i.e. USING THIS CONTRACT TO CREATE A NEW JAR.
     * @param _amount Amount of ERC20 to deposit.
     * @param _currency Token address of ERC20 to deposit.
     * @return success Boolean indicating success or failure.
     */
    function depositMinERC20(uint256 _amount, address _currency)
        external
        onlyNotBlacklisted(msg.sender)
        returns (bool success)
    {
        if (ERC20(_currency).decimals() < 1) {
            revert CookieJarFactory__NotValidERC20();
        }
        if (ERC20(_currency).allowance(msg.sender, address(this)) < _amount) {
            revert CookieJarFactory__NotSufficientAllowance();
        }
        if (_amount < minERC20Deposit) {
            revert CookieJarFactory__LessThanMinimumDeposit();
        }
        success = ERC20(_currency).transferFrom(msg.sender, address(this), _amount);
        uint256 amountRemaining = _calculateAndTransferFeeToCollector(_amount, _currency);
        jarOwnerToCurrencyAddressToAmount[msg.sender][_currency] += amountRemaining;
    }

    /**
     * @notice This function is called to withdraw deposited funds, in ETH.
     * @param _amount Amount of ETH to withdraw.
     */
    function withdrawDepositedETH(uint256 _amount) external onlyDepositedMinAmount(address(3), msg.sender) {
        if (_amount > jarOwnerToCurrencyAddressToAmount[msg.sender][address(3)]) {
            revert CookieJarFactory__WithdrawingMoreThanDeposited();
        }
        (bool success,) = payable(msg.sender).call{value: _amount}("");
        if (!success) revert CookieJarFactory__TransferFailed();
        jarOwnerToCurrencyAddressToAmount[msg.sender][address(3)] -= _amount;
    }

    /**
     * @notice This function is called to withdraw deposited funds, in ERC20.
     * @param _amount Amount of ERC20 to withdraw.
     * @param _currency Token address of ERC20 to withdraw.
     */
    function withdrawDepositedERC20(uint256 _amount, address _currency)
        external
        onlyDepositedMinAmount(_currency, msg.sender)
    {
        if (_amount > jarOwnerToCurrencyAddressToAmount[msg.sender][_currency]) {
            revert CookieJarFactory__WithdrawingMoreThanDeposited();
        }
        bool success = ERC20(_currency).transfer(msg.sender, _amount);
    }

    // --- Public Functions ---
    /**
     * @notice Creates a new CookieJar contract and updates jar data in CookieJarRegistry.
     * @notice Currently only one currency ERC20 is supported.
     * @notice Creator needs to call deposit function before creating a jar, and all the funds deposited will be sent to new jar.
     * @param _cookieJarOwner Address of the new CookieJar owner.
     * @param _supportedCurrency Address of the supported currency for the jar address(3) if native ETH.
     * @param _accessType Claim mode: Whitelist or NFTGated.
     * @param _nftAddresses Array of NFT contract addresses (only for NFTGated mode).
     * @param _nftTypes Array of NFT types corresponding to _nftAddresses.
     * @param _withdrawalOption Fixed or Variable withdrawal type.
     * @param _fixedAmount Withdrawal amount if Fixed.
     * @param _maxWithdrawal Maximum allowed withdrawal if Variable.
     * @param _withdrawalInterval Time interval between withdrawals.
     * @param _strictPurpose If true, requires a purpose length ≥20 characters.
     * @param _emergencyWithdrawalEnabled If true, emergency withdrawal is enabled.
     * @param metadata Optional metadata for off-chain tracking.
     */
    function createCookieJar(
        address _cookieJarOwner,
        address _supportedCurrency,
        CookieJar.AccessType _accessType,
        address[] calldata _nftAddresses,
        uint8[] calldata _nftTypes,
        CookieJar.WithdrawalTypeOptions _withdrawalOption,
        uint256 _fixedAmount,
        uint256 _maxWithdrawal,
        uint256 _withdrawalInterval,
        bool _strictPurpose,
        bool _emergencyWithdrawalEnabled,
        string calldata metadata
    )
        external
        onlyNotBlacklisted(msg.sender)
        onlyDepositedMinAmount(_supportedCurrency, _cookieJarOwner)
        returns (address)
    {
        /// @dev Checks if the address is a valid ERC20 contract, in case the currency is not native ETH.
        if (_supportedCurrency != address(3)) {
            if (ERC20(_supportedCurrency).decimals() < 1) {
                revert CookieJarFactory__NotValidERC20();
            }
        }
        CookieJar newJar = new CookieJar(
            address(this),
            _cookieJarOwner,
            _supportedCurrency,
            _accessType,
            _nftAddresses,
            _nftTypes,
            _withdrawalOption,
            _fixedAmount,
            _maxWithdrawal,
            _withdrawalInterval,
            minETHDeposit,
            minERC20Deposit,
            defaultFeePercentage,
            _strictPurpose,
            defaultFeeCollector,
            _emergencyWithdrawalEnabled
        );

        /// @dev Registers and updates the new CookieJar in the registry with msg.sender as the creator.
        registry.registerAndStoreCookieJar(newJar, metadata);
        _transferCurrencyToJar(address(newJar), _supportedCurrency, msg.sender);
        emit CookieJarCreated(msg.sender, address(newJar), metadata);
        return address(newJar);
    }

    /**
     * @notice Internal function to handle funds sending to individual jars while creation.
     */
    function _transferCurrencyToJar(address _jar, address _currency, address _onBehalfOf)
        internal
        returns (bool success)
    {
        uint256 mappedValue = jarOwnerToCurrencyAddressToAmount[_onBehalfOf][_currency];
        if (_currency == address(3)) {
            (success,) = _jar.call{value: mappedValue}("");
        } else {
            ERC20(_currency).approve(_jar, mappedValue);
            success = ERC20(_currency).transfer(_jar, mappedValue);
        }
    }

    function _calculateAndTransferFeeToCollector(uint256 _principalAmount, address _token)
        internal
        returns (uint256 amountRemaining)
    {
        uint256 fee = (_principalAmount * defaultFeePercentage) / 100;

        if (_token == address(3)) {
            (bool success,) = payable(defaultFeeCollector).call{value: fee}("");
            if (!success) revert CookieJarFactory__TransferFailed();
        } else {
            bool success = ERC20(_token).transfer(defaultFeeCollector, fee);
            if (!success) revert CookieJarFactory__TransferFailed();
        }
        amountRemaining = _principalAmount - fee;
    }

    /**
     * @param _user Address of the account.
     * @param _token Address of the token, address(3) in case of ETH.
     * @return amount Amount of token deposited in this contract.
     */
    function getUserDepositAmount(address _user, address _token) external view returns (uint256 amount) {
        return jarOwnerToCurrencyAddressToAmount[_user][_token];
    }
}
