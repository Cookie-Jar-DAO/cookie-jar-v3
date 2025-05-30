// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import {CookieJarLib} from "./libraries/CookieJarLib.sol";

/// @title CookieJar
/// @notice A decentralized smart contract for controlled fund withdrawals. Supports both whitelist and NFT‐gated access modes.
/// @dev Deposits accept ETH and ERC20 tokens (deducting a 1% fee) and withdrawals are subject to configurable rules.
contract CookieJar is AccessControl {
    using SafeERC20 for IERC20;

    /// @notice Array of approved NFT gates (used in NFTGated mode).
    CookieJarLib.NFTGate[] public nftGates;

    address[] public whitelist;

    CookieJarLib.WithdrawalData[] public withdrawalData;

    /// @notice Mapping for optimized NFT gate lookup.
    mapping(address => CookieJarLib.NFTType) private nftGateMapping;

    uint256 public currencyHeldByJar;
    address public immutable currency;
    uint256 public immutable minDeposit;
    /// @notice Fee percentage, 10000 = 100%
    uint256 public immutable feePercentageOnDeposit;
    /// @notice Access control mode: Whitelist or NFTGated.
    CookieJarLib.AccessType public immutable accessType;
    /// @notice Withdrawal option: Fixed or Variable.
    CookieJarLib.WithdrawalTypeOptions public immutable withdrawalOption;

    /// @notice If true, each recipient can only claim from the jar once.
    bool public immutable oneTimeWithdrawal;
    /// @notice Fixed withdrawal amount (used if withdrawalOption is Fixed).
    uint256 public fixedAmount;
    /// @notice Maximum withdrawal amount (used if withdrawalOption is Variable).
    uint256 public maxWithdrawal;
    /// @notice Time (in seconds) required between withdrawals.
    uint256 public withdrawalInterval;
    /// @notice If true, each withdrawal must have a purpose string of at least 20 characters.
    bool public immutable strictPurpose;
    /// @notice Fee collector address; note that admin is not the fee collector.
    address public feeCollector;
    /// @notice If true, emergency withdrawal is enabled.
    bool public immutable emergencyWithdrawalEnabled;

    // --- Timelock Mappings ---
    /// @notice Stores the last withdrawal timestamp for each whitelisted address for whitelist mode.
    mapping(address user => uint256 lastWithdrawalTimestamp) public lastWithdrawalWhitelist;
    /// @notice Stores the last withdrawal timestamp for each NFT token for NFT-gated mode.
    mapping(address nftGate => mapping(uint256 tokenId => uint256 lastWithdrawlTimestamp)) public lastWithdrawalNFT;

    /// @notice Initializes a new CookieJar contract.
    /// @param _jarOwner The admin address.
    /// @param _accessType Access mode: Whitelist or NFTGated.
    /// @param _nftAddresses Array of NFT contract addresses (only used if _accessType is NFTGated).
    /// @param _nftTypes Array of NFT types corresponding to _nftAddresses.
    /// @param _withdrawalOption Withdrawal type: Fixed or Variable.
    /// @param _fixedAmount Fixed withdrawal amount (if _withdrawalOption is Fixed).
    /// @param _maxWithdrawal Maximum allowed withdrawal (if _withdrawalOption is Variable).
    /// @param _withdrawalInterval Time interval between withdrawals.
    /// @param _strictPurpose If true, the withdrawal purpose must be at least 20 characters.
    /// @param _feeCollector The fee collector address.
    /// @param _emergencyWithdrawalEnabled If true, emergency withdrawal is enabled.
    /// @param _oneTimeWithdrawal If true, each recipient can only claim from the jar once.
    /// @param _whitelist Array of whitelisted addresses. Must be empty if _accessType is NFTGated, as whitelist is not used in this mode.
    constructor(
        address _jarOwner,
        address _supportedCurrency,
        CookieJarLib.AccessType _accessType,
        address[] memory _nftAddresses,
        CookieJarLib.NFTType[] memory _nftTypes,
        CookieJarLib.WithdrawalTypeOptions _withdrawalOption,
        uint256 _fixedAmount,
        uint256 _maxWithdrawal,
        uint256 _withdrawalInterval,
        uint256 _minDeposit,
        uint256 _feePercentageOnDeposit,
        bool _strictPurpose,
        address _feeCollector,
        bool _emergencyWithdrawalEnabled,
        bool _oneTimeWithdrawal,
        address[] memory _whitelist
    ) {
        if (_jarOwner == address(0)) revert CookieJarLib.AdminCannotBeZeroAddress();
        if (_feeCollector == address(0)) revert CookieJarLib.FeeCollectorAddressCannotBeZeroAddress();
        accessType = _accessType;
        if (accessType == CookieJarLib.AccessType.NFTGated) {
            if (_nftAddresses.length == 0) revert CookieJarLib.NoNFTAddressesProvided();
            if (_nftAddresses.length != _nftTypes.length) revert CookieJarLib.NFTArrayLengthMismatch();
            if (_whitelist.length > 0) revert CookieJarLib.WhitelistNotAllowedForNFTGated();
            for (uint256 i = 0; i < _nftAddresses.length; i++) {
                _addNFTGate(_nftAddresses[i], _nftTypes[i]);
            }
        }
        withdrawalOption = _withdrawalOption;
        minDeposit = _minDeposit;
        fixedAmount = _fixedAmount;
        maxWithdrawal = _maxWithdrawal;
        currency = _supportedCurrency;
        withdrawalInterval = _withdrawalInterval;
        strictPurpose = _strictPurpose;
        feeCollector = _feeCollector;
        feePercentageOnDeposit = _feePercentageOnDeposit;
        emergencyWithdrawalEnabled = _emergencyWithdrawalEnabled;
        oneTimeWithdrawal = _oneTimeWithdrawal;
        _setRoleAdmin(CookieJarLib.JAR_WHITELISTED, CookieJarLib.JAR_OWNER);
        _grantRole(CookieJarLib.JAR_OWNER, _jarOwner);
        _grantRoles(CookieJarLib.JAR_WHITELISTED, _whitelist);
    }

    // --- Admin Functions ---

    /// @notice Updates the jar whitelist status of a user.
    /// @param _users The address of the user.
    function grantJarWhitelistRole(address[] calldata _users) external onlyRole(CookieJarLib.JAR_OWNER) {
        if (accessType != CookieJarLib.AccessType.Whitelist) revert CookieJarLib.InvalidAccessType();
        _grantRoles(CookieJarLib.JAR_WHITELISTED, _users);
    }

    function revokeJarWhitelistRole(address[] calldata _users) external onlyRole(CookieJarLib.JAR_OWNER) {
        if (accessType != CookieJarLib.AccessType.Whitelist) revert CookieJarLib.InvalidAccessType();
        _revokeRoles(CookieJarLib.JAR_WHITELISTED, _users);
    }

    /// @notice Updates the fee collector address. Only the fee collector can call this function.
    /// @param _newFeeCollector The new fee collector address.
    function updateFeeCollector(address _newFeeCollector) external {
        if (msg.sender != feeCollector) revert CookieJarLib.NotFeeCollector();
        if (_newFeeCollector == address(0)) revert CookieJarLib.FeeCollectorAddressCannotBeZeroAddress();
        address old = feeCollector;
        feeCollector = _newFeeCollector;
        emit CookieJarLib.FeeCollectorUpdated(old, _newFeeCollector);
    }

    /// @notice Adds a new NFT gate if it is not already registered.
    /// @param _nftAddress The NFT contract address.
    /// @param _nftType The NFT type.
    function addNFTGate(address _nftAddress, CookieJarLib.NFTType _nftType) external onlyRole(CookieJarLib.JAR_OWNER) {
        if (accessType != CookieJarLib.AccessType.NFTGated) revert CookieJarLib.InvalidAccessType();
        _addNFTGate(_nftAddress, _nftType);
    }

    /// @notice Removes an NFT gate.
    /// @param _nftAddress The NFT contract address.
    function removeNFTGate(address _nftAddress) external onlyRole(CookieJarLib.JAR_OWNER) {
        if (accessType != CookieJarLib.AccessType.NFTGated) revert CookieJarLib.InvalidAccessType();
        if (nftGateMapping[_nftAddress] == CookieJarLib.NFTType.None) revert CookieJarLib.NFTGateNotFound();

        delete nftGateMapping[_nftAddress];

        uint256 gateIndex;
        uint256 numGates = nftGates.length;
        for (uint256 i = 0; i < numGates; i++) {
            if (nftGates[i].nftAddress == _nftAddress) {
                gateIndex = i;
                break;
            }
        }
        nftGates[gateIndex] = nftGates[nftGates.length - 1];
        nftGates.pop();

        emit CookieJarLib.NFTGateRemoved(_nftAddress);
    }

    /// @notice Updates the maximum withdrawal amount, only works if withdrawalOption is Variable.
    /// @param _maxWithdrawal The new maximum withdrawal amount.
    function UpdateMaxWithdrawalAmount(uint256 _maxWithdrawal) external onlyRole(CookieJarLib.JAR_OWNER) {
        if (withdrawalOption == CookieJarLib.WithdrawalTypeOptions.Fixed) revert CookieJarLib.InvalidWithdrawalType();
        if (_maxWithdrawal == 0) revert CookieJarLib.ZeroAmount();
        maxWithdrawal = _maxWithdrawal;
        emit CookieJarLib.MaxWithdrawalUpdated(_maxWithdrawal);
    }

    /// @notice Updates the fixed withdrawal amount, only works if withdrawalOption is Fixed.
    /// @param _fixedAmount The new fixed withdrawal amount.
    function updateFixedWithdrawalAmount(uint256 _fixedAmount) external onlyRole(CookieJarLib.JAR_OWNER) {
        if (withdrawalOption == CookieJarLib.WithdrawalTypeOptions.Variable) {
            revert CookieJarLib.InvalidWithdrawalType();
        }
        if (_fixedAmount == 0) revert CookieJarLib.ZeroAmount();
        fixedAmount = _fixedAmount;
        emit CookieJarLib.FixedWithdrawalAmountUpdated(_fixedAmount);
    }

    /// @notice Updates the withdrawal interval.
    /// @param _withdrawalInterval The new withdrawal interval.
    function updateWithdrawalInterval(uint256 _withdrawalInterval) external onlyRole(CookieJarLib.JAR_OWNER) {
        if (_withdrawalInterval == 0) revert CookieJarLib.ZeroAmount();
        withdrawalInterval = _withdrawalInterval;
        emit CookieJarLib.WithdrawalIntervalUpdated(_withdrawalInterval);
    }

    /// @notice Allows the admin to perform an emergency withdrawal of funds from the jar.
    /// @param token If address(3) then ETH is withdrawn; otherwise, ERC20 token address.
    /// @param amount The amount to withdraw.
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(CookieJarLib.JAR_OWNER) {
        if (!emergencyWithdrawalEnabled) revert CookieJarLib.EmergencyWithdrawalDisabled();
        if (amount == 0) revert CookieJarLib.ZeroAmount();
        if (token == currency) {
            if (currencyHeldByJar < amount) revert CookieJarLib.InsufficientBalance();
            currencyHeldByJar -= amount;
        }
        emit CookieJarLib.EmergencyWithdrawal(msg.sender, token, amount);
        if (token == address(3)) {
            (bool sent,) = msg.sender.call{value: amount}("");
            if (!sent) revert CookieJarLib.TransferFailed();
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }
    }

    // --- User Functions ---

    /// @notice Deposits ETH into the contract, deducting deposit fee. Only works if the jar's currency is ETH.
    function depositETH() public payable {
        if (msg.value == 0) revert CookieJarLib.ZeroAmount();
        if (currency != address(3)) revert CookieJarLib.InvalidTokenAddress();
        if (msg.value < minDeposit) revert CookieJarLib.LessThanMinimumDeposit();

        (uint256 fee, uint256 remainingAmount) = _calculateFee(msg.value);
        (bool success,) = payable(feeCollector).call{value: fee}("");
        if (!success) revert CookieJarLib.FeeTransferFailed();
        currencyHeldByJar += remainingAmount;
        emit CookieJarLib.Deposit(msg.sender, remainingAmount, currency);
    }

    /// @notice Deposits Currency tokens into the contract, deducting deposit fee. Only works if the jar's currency is
    ///  an ERC20 token.
    /// @param amount The amount of tokens to deposit.
    function depositCurrency(uint256 amount) public {
        if (amount == 0) revert CookieJarLib.ZeroAmount();
        if (currency == address(3)) revert CookieJarLib.InvalidTokenAddress();
        if (amount < minDeposit) revert CookieJarLib.LessThanMinimumDeposit();

        IERC20(currency).safeTransferFrom(msg.sender, address(this), amount);
        (uint256 fee, uint256 remainingAmount) = _calculateFee(amount);
        bool success = IERC20(currency).transfer(feeCollector, fee);
        if (!success) revert CookieJarLib.FeeTransferFailed();
        currencyHeldByJar += remainingAmount;
        emit CookieJarLib.Deposit(msg.sender, remainingAmount, currency);
    }

    /// @notice Withdraws funds (ETH or ERC20) for whitelisted users.
    /// @param amount The amount to withdraw.
    /// @param purpose A description for the withdrawal.
    function withdrawWhitelistMode(uint256 amount, string calldata purpose)
        external
        onlyRole(CookieJarLib.JAR_WHITELISTED)
    {
        if (accessType != CookieJarLib.AccessType.Whitelist) revert CookieJarLib.InvalidAccessType();
        _checkAndUpdateWithdraw(amount, purpose, lastWithdrawalWhitelist[msg.sender]);
        lastWithdrawalWhitelist[msg.sender] = block.timestamp;
        _withdraw(amount, purpose);
    }

    /// @notice Withdraws funds (ETH or ERC20) for NFT-gated users.
    /// @param amount The amount to withdraw.
    /// @param purpose A description for the withdrawal.
    /// @param gateAddress The NFT contract address used for gating.
    /// @param tokenId The NFT token id used for gating.
    function withdrawNFTMode(uint256 amount, string calldata purpose, address gateAddress, uint256 tokenId) external {
        if (accessType != CookieJarLib.AccessType.NFTGated) revert CookieJarLib.InvalidAccessType();
        if (gateAddress == address(0)) revert CookieJarLib.InvalidNFTGate();
        _checkAccessNFT(gateAddress, tokenId);
        _checkAndUpdateWithdraw(amount, purpose, lastWithdrawalNFT[gateAddress][tokenId]);
        lastWithdrawalNFT[gateAddress][tokenId] = block.timestamp;
        _withdraw(amount, purpose);
    }

    // --- View Functions ---

    /// @notice Returns the NFT gates array.
    /// @return CookieJarLib.NFTGate[] The array of approvedNFT gates.
    function getNFTGatesArray() external view returns (CookieJarLib.NFTGate[] memory) {
        return nftGates;
    }

    /// @notice Returns the withdrawal data array.
    /// @return CookieJarLib.WithdrawalData[] The array of withdrawal data.
    function getWithdrawalDataArray() external view returns (CookieJarLib.WithdrawalData[] memory) {
        return withdrawalData;
    }

    /// @notice Returns the whitelist of addresses.
    /// @return address[] The array of whitelisted addresses.
    function getWhitelist() external view returns (address[] memory) {
        return whitelist;
    }

    // --- Internal Functions ---

    function _grantRole(bytes32 role, address account) internal override returns (bool success) {
        success = super._grantRole(role, account);
        if (success && role == CookieJarLib.JAR_WHITELISTED) {
            whitelist.push(account);
        }
    }

    function _revokeRole(bytes32 role, address account) internal override returns (bool success) {
        success = super._revokeRole(role, account);
        if (success && role == CookieJarLib.JAR_WHITELISTED) {
            for (uint256 i = 0; i < whitelist.length; i++) {
                if (whitelist[i] == account) {
                    whitelist[i] = whitelist[whitelist.length - 1];
                    whitelist.pop();
                    break;
                }
            }
        }
    }

    function _grantRoles(bytes32 role, address[] memory users) internal {
        for (uint256 i = 0; i < users.length; i++) {
            _grantRole(role, users[i]);
        }
    }

    function _revokeRoles(bytes32 role, address[] memory users) internal {
        for (uint256 i = 0; i < users.length; i++) {
            _revokeRole(role, users[i]);
        }
    }

    /// @notice Adds a new NFT gate if it is not already registered.
    /// @param _nftAddress The NFT contract address.
    /// @param _nftType The NFT type.
    function _addNFTGate(address _nftAddress, CookieJarLib.NFTType _nftType) internal {
        if (_nftAddress == address(0)) revert CookieJarLib.InvalidNFTGate();
        if (_nftType == CookieJarLib.NFTType.None) revert CookieJarLib.InvalidNFTType();
        if (nftGateMapping[_nftAddress] != CookieJarLib.NFTType.None) revert CookieJarLib.DuplicateNFTGate();
        CookieJarLib.NFTGate memory gate = CookieJarLib.NFTGate({nftAddress: _nftAddress, nftType: _nftType});
        nftGates.push(gate);
        nftGateMapping[_nftAddress] = _nftType;
        emit CookieJarLib.NFTGateAdded(_nftAddress, _nftType);
    }

    function _calculateFee(uint256 _principalAmount) internal view returns (uint256 fee, uint256 amountRemaining) {
        fee = (_principalAmount * feePercentageOnDeposit) / 10000;
        amountRemaining = _principalAmount - fee;
    }

    /// @notice Checks if the caller has NFT-gated access via the specified gate.
    /// @param gateAddress The NFT contract address used for gating.
    /// @param tokenId The NFT token id.
    function _checkAccessNFT(address gateAddress, uint256 tokenId) internal view {
        CookieJarLib.NFTType nftType = nftGateMapping[gateAddress];
        if (nftType == CookieJarLib.NFTType.None) revert CookieJarLib.InvalidNFTGate();
        if (nftType == CookieJarLib.NFTType.ERC721) {
            if (IERC721(gateAddress).ownerOf(tokenId) != msg.sender) {
                revert CookieJarLib.NotAuthorized();
            }
        } else if (nftType == CookieJarLib.NFTType.ERC1155) {
            if (IERC1155(gateAddress).balanceOf(msg.sender, tokenId) == 0) {
                revert CookieJarLib.NotAuthorized();
            }
        }
    }

    function _checkAndUpdateWithdraw(uint256 amount, string calldata purpose, uint256 lastWithdrawal) internal {
        if (amount == 0) revert CookieJarLib.ZeroAmount();
        if (strictPurpose && bytes(purpose).length < 10) revert CookieJarLib.InvalidPurpose();
        if (oneTimeWithdrawal && lastWithdrawal != 0) revert CookieJarLib.WithdrawalAlreadyDone();
        uint256 nextAllowed = lastWithdrawal + withdrawalInterval;
        if (block.timestamp < nextAllowed) revert CookieJarLib.WithdrawalTooSoon(nextAllowed);
        if (withdrawalOption == CookieJarLib.WithdrawalTypeOptions.Fixed) {
            if (amount != fixedAmount) revert CookieJarLib.WithdrawalAmountNotAllowed(amount, fixedAmount);
        } else {
            if (amount > maxWithdrawal) revert CookieJarLib.WithdrawalAmountNotAllowed(amount, maxWithdrawal);
        }
        if (currencyHeldByJar < amount) revert CookieJarLib.InsufficientBalance();

        currencyHeldByJar -= amount;
        CookieJarLib.WithdrawalData memory temp = CookieJarLib.WithdrawalData({amount: amount, purpose: purpose, recipient: msg.sender});
        withdrawalData.push(temp);
    }

    function _withdraw(uint256 amount, string calldata purpose) internal {
        emit CookieJarLib.Withdrawal(msg.sender, amount, purpose);
        if (currency == address(3)) {
            (bool sent,) = msg.sender.call{value: amount}("");
            if (!sent) revert CookieJarLib.TransferFailed();
        } else {
            IERC20(currency).safeTransfer(msg.sender, amount);
        }
    }
}
