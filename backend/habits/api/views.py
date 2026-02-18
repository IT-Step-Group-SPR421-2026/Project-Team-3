from rest_framework.viewsets import ModelViewSet
from ..models import CheckIn, Habit
from .serializers import CheckInSerializer, HabitSerializer


class HabitViewSet(ModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer


class CheckInViewSet(ModelViewSet):
    queryset = CheckIn.objects.all()
    serializer_class = CheckInSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]
