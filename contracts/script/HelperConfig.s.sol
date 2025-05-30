// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HelperConfig {
    address DEFAULT_FEE_COLLECTOR = address(0xcFF556854A07A8Ff47F8b178abb617901682D4eb);
    uint256 FEE_PERCENT_ON_DEPOSIT = 100;
    /// @dev 1% fee on deposit. 100=1% 1000=10%
    uint256 MIN_ETH_DEPOSIT = 0;
    uint256 MIN_ERC20_DEPOST = 0;

    struct NetworkConfig {
        address defaultFeeCollector;
        uint256 feePercentageOnDeposit;
        uint256 minETHDeposit;
        uint256 minERC20Deposit;
    }

    function getBaseSepoliaConfig() public view returns (NetworkConfig memory baseSepoliaConfig) {
        baseSepoliaConfig = NetworkConfig({
            defaultFeeCollector: DEFAULT_FEE_COLLECTOR,
            feePercentageOnDeposit: FEE_PERCENT_ON_DEPOSIT,
            minETHDeposit: MIN_ETH_DEPOSIT,
            minERC20Deposit: MIN_ERC20_DEPOST
        });
    }

    function getAnvilConfig() public view returns (NetworkConfig memory anvilConfig) {
        anvilConfig = NetworkConfig({
            defaultFeeCollector: DEFAULT_FEE_COLLECTOR,
            feePercentageOnDeposit: FEE_PERCENT_ON_DEPOSIT,
            minETHDeposit: MIN_ETH_DEPOSIT,
            minERC20Deposit: MIN_ERC20_DEPOST
        });
    }
}
