from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CheckInViewSet, HabitViewSet, heatmap, leaderboard, stats, xp
from .subscription_views import (
    subscription_status,
    can_create_habit,
    SubscriptionRegistrationView,
    subscription_info,
)

habit_router = DefaultRouter()
habit_router.register(r"habits", HabitViewSet)
habit_router.register(r"checkins", CheckInViewSet)

urlpatterns = [
    path("", include(habit_router.urls)),
    path("heatmap/", heatmap, name="heatmap"),
    path("stats/", stats, name="stats"),
    path("xp/", xp, name="xp"),
    path("leaderboard/", leaderboard, name="leaderboard"),
    # Subscription endpoints
    path("subscriptions/status/", subscription_status, name="subscription_status"),
    path("subscriptions/can-create-habit/", can_create_habit, name="can_create_habit"),
    path("subscriptions/register/", SubscriptionRegistrationView.as_view(), name="subscription_register"),
    path("subscriptions/info/", subscription_info, name="subscription_info"),
]
