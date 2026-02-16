from rest_framework.routers import DefaultRouter
from .views import CheckInViewSet, HabitViewSet

habit_router = DefaultRouter()
habit_router.register(r"habits", HabitViewSet)
habit_router.register(r"checkins", CheckInViewSet)
