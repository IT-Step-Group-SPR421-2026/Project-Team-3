from django.db import models
from datetime import timedelta
from django.utils import timezone


class Habit(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Habit: {self.name}"

    def current_streak(self):
        dates = set(self.checkins.order_by("-date").values_list("date", flat=True))
        if not dates:
            return 0

        streak = 0
        day = timezone.localdate()
        while day in dates:
            streak += 1
            day = day - timedelta(days=1)
        return streak


class CheckIn(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="checkins")
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["habit", "date"], name="uniq_checkin")
        ]
        ordering = ["-date"]

    def __str__(self):
        return f"CheckIn: {self.habit.name} on {self.date}"
