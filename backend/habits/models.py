from django.db import models
from datetime import timedelta
from django.utils import timezone


class Habit(models.Model):
    # Firebase UID of the owning user
    user_id = models.CharField(max_length=128, db_index=True, blank=True, default="")
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    color = models.CharField(max_length=24, default="#9be9a8")

    def __str__(self):
        return f"Habit: {self.name}"

    def current_streak(self):
        dates = set(self.checkins.order_by("-date").values_list("date", flat=True))  # type: ignore
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


def get_color_for_count(count: int) -> str:
    """
    0   -> '#ebedf0'  (gray)
    1-2 -> '#9be9a8'  (light green)
    3-4 -> '#40c463'  (medium green)
    5+  -> '#216e39'  (dark green)
    """
    if count == 0:
        return "#ebedf0"
    if 1 <= count <= 2:
        return "#9be9a8"
    if 3 <= count <= 4:
        return "#40c463"
    return "#216e39"


class CheckIn(models.Model):
    # Denormalized user id to quickly filter per-user checkins
    user_id = models.CharField(max_length=128, db_index=True, blank=True, default="")
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

    @classmethod
    def color_for_date(cls, date):

        return get_color_for_count(cls.count_for_date(date))

    def color(self):

        return self.__class__.color_for_date(self.date)


class UserStats(models.Model):
    # Firebase UID
    user_id = models.CharField(max_length=128, unique=True, db_index=True)
    display_name = models.CharField(max_length=255, blank=True, default="")
    xp_total = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"UserStats({self.user_id})"


class XpEvent(models.Model):
    """Tracks XP awards to prevent double-crediting the same habit/date."""

    user_id = models.CharField(max_length=128, db_index=True)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="xp_events")
    date = models.DateField()
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user_id", "habit", "date"], name="uniq_xp_event"
            )
        ]

    def __str__(self):
        return f"XpEvent({self.user_id}, {self.habit_id}, {self.date})"


class Subscription(models.Model):
    """
    Tracks one-time permanent subscription for users
    Transaction hash stored for verification on-chain
    """

    # Firebase UID of the user
    user_id = models.CharField(max_length=128, unique=True, db_index=True)
    # Wallet address that made the purchase
    wallet_address = models.CharField(max_length=42, unique=True, db_index=True)
    # Transaction hash of the payment (proof on blockchain)
    tx_hash = models.CharField(max_length=66, unique=True, db_index=True)
    # Whether subscription is active (local cache)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Subscription({self.user_id}, active={self.is_active})"
