from rest_framework.serializers import ModelSerializer, SerializerMethodField
from ..models import CheckIn, Habit


class HabitSerializer(ModelSerializer):
    current_streak = SerializerMethodField()
    longest_streak = SerializerMethodField()

    class Meta:
        model = Habit
        fields = (
            "id",
            "name",
            "color",
            "description",
            "created_at",
            "current_streak",
            "longest_streak",
        )

    def get_current_streak(self, obj):
        return obj.current_streak()

    def get_longest_streak(self, obj):
        return obj.longest_streak()


class CheckInSerializer(ModelSerializer):
    color = SerializerMethodField()

    class Meta:
        model = CheckIn
        fields = ("id", "habit", "date", "created_at", "color")

    def get_color(self, obj):
        return obj.color()
