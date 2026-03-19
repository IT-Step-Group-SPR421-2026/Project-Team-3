from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from ..subscription_service import get_subscription_service
from ..models import Subscription
from .subscription_serializers import SubscriptionSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(["GET"])
def subscription_status(request):
    """
    Get current subscription status for authenticated user
    
    Returns:
        - is_premium: boolean
        - is_active: boolean
        - wallet_address: string or null
        - tx_hash: string or null (proof of payment on blockchain)
        - created_at: timestamp
    """
    uid = getattr(request.user, "uid", None)
    if not uid:
        return Response({"detail": "Authentication required"}, status=401)

    service = get_subscription_service()
    status = service.get_subscription_status(uid)

    return Response(status)


@api_view(["GET"])
def can_create_habit(request):
    """
    Check if user can create a new habit
    
    Returns:
        - can_create: boolean
        - reason: string
        - current_habits: integer (current count)
        - free_tier_limit: integer
    """
    uid = getattr(request.user, "uid", None)
    if not uid:
        return Response({"detail": "Authentication required"}, status=401)

    service = get_subscription_service()
    can_create, reason = service.can_create_habit(uid)

    # Get current habit count
    from ..models import Habit
    habit_count = Habit.objects.filter(user_id=uid).count()

    return Response({
        "can_create": can_create,
        "reason": reason,
        "current_habits": habit_count,
        "free_tier_limit": 5,
    })


class SubscriptionRegistrationView(APIView):
    """
    Register a blockchain subscription after payment
    
    POST /api/subscriptions/register/
    {
        "wallet_address": "0x...",
        "tx_hash": "0x..."
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            uid = getattr(request.user, "uid", None)
            if not uid:
                return Response(
                    {"detail": "Authentication required"},
                    status=401
                )

            wallet_address = request.data.get("wallet_address")
            tx_hash = request.data.get("tx_hash")

            if not wallet_address:
                return Response(
                    {"detail": "wallet_address is required"},
                    status=400
                )

            if not tx_hash:
                return Response(
                    {"detail": "tx_hash is required"},
                    status=400
                )

            service = get_subscription_service()
            subscription = service.register_subscription(
                uid,
                wallet_address,
                tx_hash
            )

            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data, status=201)

        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=400
            )
        except Exception as e:
            logger.error(f"Error registering subscription: {e}")
            return Response(
                {"detail": "Internal server error"},
                status=500
            )


@api_view(["GET"])
def subscription_info(request):
    """
    Get subscription information and pricing
    
    Returns:
        - free_tier_limit: number of free habits
        - price: subscription price in ETH
        - contract_address: smart contract address
        - contract_network: blockchain network
        - purchase_type: 'one-time'
    """
    import os
    
    service = get_subscription_service()
    price = service.get_subscription_price()
    
    return Response({
        "free_tier_limit": 5,
        "price": price or "0.1",  # Default to 0.1 ETH if not available
        "premium_features": [
            "Unlimited habits",
            "Advanced analytics",
            "Priority support",
        ],
        "contract_address": os.getenv("SUBSCRIPTION_CONTRACT_ADDRESS", ""),
        "contract_network": os.getenv("SUBSCRIPTION_NETWORK", "polygon"),
        "purchase_type": "one-time",
    })

