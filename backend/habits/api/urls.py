from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CheckInViewSet, HabitViewSet, heatmap, stats

habit_router = DefaultRouter()
habit_router.register(r"habits", HabitViewSet)
habit_router.register(r"checkins", CheckInViewSet)

urlpatterns = [
    path("", include(habit_router.urls)),
    path("heatmap/", heatmap, name="heatmap"),
    path("stats/", stats, name="stats"),
]
