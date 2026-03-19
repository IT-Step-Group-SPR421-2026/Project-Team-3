from rest_framework import serializers
from ..models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscription data"""

    class Meta:
        model = Subscription
        fields = [
            'user_id',
            'wallet_address',
            'tx_hash',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user_id', 'created_at', 'updated_at']
