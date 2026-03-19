"""
Subscription service - Firestore/Django based with blockchain verification
Handles subscription state and habit limit enforcement
"""
import os
from typing import Optional, Tuple
from web3 import Web3  # type: ignore
from django.utils import timezone
from .models import Subscription
import logging

logger = logging.getLogger(__name__)

# Contract details for payment verification
CONTRACT_ADDRESS = os.getenv("SUBSCRIPTION_CONTRACT_ADDRESS", "")
RPC_URL = os.getenv("SUBSCRIPTION_RPC_URL", "http://127.0.0.1:8545")

# Free tier limit
FREE_TIER_LIMIT = 5


class SubscriptionService:
    """Service for managing subscriptions with blockchain verification"""

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(RPC_URL))
        self.is_connected = False

        if not self.w3.is_connected():
            logger.warning(f"Failed to connect to RPC at {RPC_URL}")
            return

        self.is_connected = True
        logger.info(f"Connected to RPC at {RPC_URL}")

    def verify_transaction(self, tx_hash: str) -> Tuple[bool, str]:
        """
        Verify a transaction was successful on the blockchain
        Returns (is_valid, message)
        """
        if not self.is_connected:
            logger.warning("Blockchain service not connected")
            return False, "Blockchain service unavailable"

        try:
            # Check if transaction exists and was successful
            tx = self.w3.eth.get_transaction_receipt(tx_hash) # type: ignore
            
            if tx is None:
                return False, "Transaction not found on blockchain"

            if tx['status'] != 1:
                return False, "Transaction failed"

            return True, "Transaction verified"

        except Exception as e:
            logger.error(f"Error verifying transaction {tx_hash}: {e}")
            return False, f"Error verifying transaction: {str(e)}"

    def is_premium_user(self, user_id: str) -> bool:
        """
        Check if user has premium subscription (local check)
        """
        try:
            subscription = Subscription.objects.filter(user_id=user_id).first()
            return subscription is not None and subscription.is_active
        except Exception as e:
            logger.error(f"Error checking premium status for user {user_id}: {e}")
            return False

    def get_subscription_status(self, user_id: str) -> dict:
        """
        Get subscription status for a user
        """
        try:
            subscription = Subscription.objects.filter(user_id=user_id).first()

            if not subscription:
                return {
                    "is_premium": False,
                    "is_active": False,
                    "wallet_address": None,
                    "tx_hash": None,
                }

            return {
                "is_premium": subscription.is_active,
                "is_active": subscription.is_active,
                "wallet_address": subscription.wallet_address,
                "tx_hash": subscription.tx_hash,
                "created_at": subscription.created_at.isoformat(),
            }

        except Exception as e:
            logger.error(f"Error getting subscription status for user {user_id}: {e}")
            return {
                "is_premium": False,
                "is_active": False,
                "wallet_address": None,
            }

    def can_create_habit(self, user_id: str) -> Tuple[bool, str]:
        """
        Check if user can create a new habit
        Returns (can_create, reason)
        """
        try:
            from .models import Habit

            # Count existing habits
            habit_count = Habit.objects.filter(user_id=user_id).count()

            # Check if premium
            is_premium = self.is_premium_user(user_id)

            if is_premium:
                return True, "Premium user - unlimited habits"

            if habit_count >= FREE_TIER_LIMIT:
                return (
                    False,
                    f"Free tier limited to {FREE_TIER_LIMIT} habits. Upgrade to premium to create more."
                )

            return True, f"Free user - {FREE_TIER_LIMIT - habit_count} habits remaining"

        except Exception as e:
            logger.error(f"Error checking habit creation for user {user_id}: {e}")
            return False, "Error checking subscription status"

    def register_subscription(
        self,
        user_id: str,
        wallet_address: str,
        tx_hash: str
    ) -> Subscription:
        """
        Register a new subscription after payment verification
        """
        try:
            # Verify transaction first
            is_valid, message = self.verify_transaction(tx_hash)
            if not is_valid:
                raise ValueError(f"Transaction verification failed: {message}")

            # Normalize address
            wallet_address = Web3.to_checksum_address(wallet_address)

            subscription, created = Subscription.objects.update_or_create(
                user_id=user_id,
                defaults={
                    "wallet_address": wallet_address,
                    "tx_hash": tx_hash,
                    "is_active": True,
                }
            )

            if created:
                logger.info(f"Created subscription for user {user_id} with wallet {wallet_address}")
            else:
                logger.info(f"Updated subscription for user {user_id}")

            return subscription

        except Exception as e:
            logger.error(f"Error registering subscription: {e}")
            raise

    def get_subscription_price(self) -> Optional[str]:
        """
        Get current subscription price from contract
        """
        if not self.is_connected or not CONTRACT_ADDRESS:
            return None

        try:
            # Simple ABI for getting price
            abi = [
                {
                    "inputs": [],
                    "name": "subscriptionPrice",
                    "outputs": [{"type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                }
            ]

            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(CONTRACT_ADDRESS),
                abi=abi
            )
            price_wei = contract.functions.subscriptionPrice().call()
            # Convert wei to ether
            price_eth = self.w3.from_wei(price_wei, 'ether')
            return str(price_eth)

        except Exception as e:
            logger.error(f"Error getting subscription price: {e}")
            return None


# Singleton instance
_service = None


def get_subscription_service() -> SubscriptionService:
    """Get or create subscription service instance"""
    global _service
    if _service is None:
        _service = SubscriptionService()
    return _service

