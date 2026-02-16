from django.urls import include, path
from rest_framework.routers import DefaultRouter
from habits.api.urls import habit_router

router = DefaultRouter()
router.registry.extend(habit_router.registry)
urlpatterns = [path("", include(router.urls))]
