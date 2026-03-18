// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HabitFlowSubscription
 * @dev Simple payment contract for HabitFlow subscriptions
 * 
 * Features:
 * - Receives one-time permanent subscription payments
 * - Admin-controlled pricing
 * - Payment verification via transaction hash
 * - Subscription state stored off-chain (Firestore/Django)
 * - No dependencies - minimal and standalone
 */
contract HabitFlowSubscription {

    // =============================================================================
    // State Variables
    // =============================================================================

    /// @dev Contract owner (can update price and withdraw)
    address public owner;

    /// @dev Price for premium subscription in wei (e.g., 0.1 ETH)
    uint256 public subscriptionPrice = 0.005 ether;

    // =============================================================================
    // Events
    // =============================================================================

    event SubscriptionPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    event PriceUpdated(uint256 newPrice);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // =============================================================================
    // Modifiers
    // =============================================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // =============================================================================
    // Constructor
    // =============================================================================

    constructor() {
        owner = msg.sender;
    }

    // =============================================================================
    // Public Functions - Payment Only
    // =============================================================================

    /**
     * @dev Purchase a subscription
     * Emits event with buyer address and payment amount
     * Subscription state managed off-chain in Firestore/Django
     */
    function purchaseSubscription() external payable {
        require(msg.value >= subscriptionPrice, "Insufficient payment");
        
        // Transfer payment to contract owner
        (bool success, ) = payable(owner).call{value: msg.value}("");
        require(success, "Payment transfer failed");

        emit SubscriptionPurchased(msg.sender, msg.value, block.timestamp);
    }

    // =============================================================================
    // Admin Functions
    // =============================================================================

    /**
     * @dev Update subscription price
     * @param newPrice New price in wei
     */
    function setSubscriptionPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        subscriptionPrice = newPrice;
        emit PriceUpdated(newPrice);
    }

    /**
     * @dev Transfer ownership to a new owner
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    // =============================================================================
    // Receive Function
    // =============================================================================

    /**
     * @dev Receive ETH transfers
     */
    receive() external payable {}
}
