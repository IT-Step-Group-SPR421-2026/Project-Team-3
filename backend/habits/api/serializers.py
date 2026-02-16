from rest_framework.serializers import ModelSerializer, SerializerMethodField
from ..models import CheckIn, Habit


class HabitSerializer(ModelSerializer):
    current_streak = SerializerMethodField()

    class Meta:
        model = Habit
        fields = ("id", "name", "description", "created_at", "current_streak")

    def get_current_streak(self, obj):
        return obj.current_streak()


class CheckInSerializer(ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ("id", "habit", "date", "created_at")
