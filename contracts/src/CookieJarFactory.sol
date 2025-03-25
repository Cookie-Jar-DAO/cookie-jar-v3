// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CookieJar.sol";
import "./CookieJarRegistry.sol";

contract CookieJarFactory {
    // Array to track deployed CookieJar instances.
    CookieJar[] public cookieJars;
    // Mapping to store metadata for each CookieJar instance.
    mapping(address => string) public cookieJarMetadata;

    // Default fee collector for new CookieJar contracts.
    address public defaultFeeCollector;
    uint256 public defaultFee;
    address public admin;
    /// @notice Mapping of addresses allowed to withdraw in Whitelist mode.
    /// @notice Mapping of addresses that are blacklisted.
    mapping(address => bool) public blacklist;


    // Reference to the CookieJarRegistry contract.
    CookieJarRegistry public registry;

    // --- Custom Error ---
    error NotFeeCollector();
    error FeeTransferFailed();
    error FeeNotEnough();
    error Blacklisted();
    error NotAuthorized();
    // --- Event ---
    event CookieJarCreated(
        address indexed creator,
        address cookieJarAddress,
        string metadata
    );
    event DefaultFeeSet(uint256 indexed defaultFee);
    event GlobalBlacklistUpdated(address indexed user, bool status);

    // --- Modifier ---
      modifier onlyAuthorized() {
        if (msg.sender != admin) revert NotAuthorized();
        _;
    }
     modifier checkAccessBlacklist(){
        if (blacklist[msg.sender]) revert Blacklisted();
        _;
    }


    /**
     * @notice Constructor for the CookieJarFactory.
     * @param _defaultFeeCollector The default fee collector address.
     * @param _registry The address of the CookieJarRegistry contract.
     */
    constructor(
        address _defaultFeeCollector,
        address _registry,
        uint256 _defaultFee,
        address _admin
    ) {
        defaultFeeCollector = _defaultFeeCollector;
        registry = CookieJarRegistry(_registry);
        defaultFee = _defaultFee;
        admin = _admin;
    }
    
    /// @notice Update the global blacklist for an address.
    /// @param _user The address to update.
    /// @param _status The new blacklist status.
    function updateGlobalBlacklist(address _user, bool _status) external onlyAuthorized {
        blacklist[_user] = _status;
        emit GlobalBlacklistUpdated(_user, _status);
    }


    function setDefaultFee(uint256 _defaultFee) external {
        require(
            msg.sender == defaultFeeCollector,
            "Only the default fee collector can set the default fee."
        );
        defaultFee = _defaultFee;
        emit DefaultFeeSet(defaultFee);
    }

    /// @notice Update the default fee collector for new CookieJar contracts.
    /// @param newFeeCollector The new fee collector address.
    function updateDefaultFeeCollector(address newFeeCollector) external {
        if (msg.sender != defaultFeeCollector) {
            revert NotFeeCollector();
        }
        defaultFeeCollector = newFeeCollector;
    }

    /// @notice Deploy a new CookieJar contract.
    /// @param _admin The admin address.
    /// @param _accessType Access mode: Whitelist or NFTGated.
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
        address _admin,
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
    ) checkAccessBlacklist external  payable returns (address)  {
        if (defaultFee != 0) {
            if (msg.value < defaultFee) revert FeeNotEnough();
            (bool sent, ) = defaultFeeCollector.call{value: msg.value}("");
            if (!sent) revert FeeTransferFailed();
        }

        CookieJar newJar = new CookieJar(
            _admin,
            _accessType,
            _nftAddresses,
            _nftTypes,
            _withdrawalOption,
            _fixedAmount,
            _maxWithdrawal,
            _withdrawalInterval,
            _strictPurpose,
            defaultFeeCollector,
            _emergencyWithdrawalEnabled
        );

        cookieJars.push(newJar);
        cookieJarMetadata[address(newJar)] = metadata;
        // Register the new CookieJar in the registry with msg.sender as the creator.
        registry.registerCookieJar(address(newJar), msg.sender, metadata);
        emit CookieJarCreated(msg.sender, address(newJar), metadata);
        return address(newJar);
    }
}
