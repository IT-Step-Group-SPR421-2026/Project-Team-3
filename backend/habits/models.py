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
        dates = set(self.checkins.order_by("-date").values_list("date", flat=True)) # type: ignore
        if not dates:
            return 0

        streak = 0
        day = timezone.localdate()
        while day in dates:
            streak += 1
            day = day - timedelta(days=1)
        return streak

    def longest_streak(self):
        dates_qs = self.checkins.order_by("date").values_list("date", flat=True)  # type: ignore
        dates = list(dict.fromkeys(dates_qs))  
        if not dates:
            return 0

        max_streak = 1
        current = 1
        prev = dates[0]
        for d in dates[1:]:
            if d == prev + timedelta(days=1):
                current += 1
            else:
                current = 1
            if current > max_streak:
                max_streak = current
            prev = d
        return max_streak


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

    @classmethod
    def count_for_date(cls, date):
        return cls.objects.filter(date=date).count()

    def color(self):
        """
        0   -> '#ebedf0'  (gray)
        1-2 -> '#9be9a8'  (light green)
        3-4 -> '#40c463'  (medium green)
        5+  -> '#216e39'  (dark green)
        """
        count = self.count_for_date(self.date)
        if count == 0:
            return "#ebedf0"
        if 1 <= count <= 2:
            return "#9be9a8"
        if 3 <= count <= 4:
            return "#40c463"
        return "#216e39"