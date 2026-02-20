from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from ..models import CheckIn, Habit, get_color_for_count
from .serializers import CheckInSerializer, HabitSerializer


class HabitViewSet(ModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer


class CheckInViewSet(ModelViewSet):
    queryset = CheckIn.objects.all()
    serializer_class = CheckInSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]


@api_view(["GET"])
def heatmap(request):
    """Return a list of dates with check-in counts and associated colors.

    Query params:
      from  - start date (YYYY-MM-DD)
      to    - end date (YYYY-MM-DD)
    """

    from_str = request.GET.get("from")
    to_str = request.GET.get("to")
    start = parse_date(from_str) if from_str else None
    end = parse_date(to_str) if to_str else None
    if not start or not end:
        return Response({"detail": "from and to query params required"}, status=400)
    if end < start:
        return Response({"detail": "to must be after from"}, status=400)

    qs = CheckIn.objects.filter(date__range=(start, end))
    aggregated = qs.values("date").annotate(count=Count("id"))
    counts = {entry["date"]: entry["count"] for entry in aggregated}

    result = []
    current = start
    while current <= end:
        cnt = counts.get(current, 0)
        result.append({
            "date": current,
            "count": cnt,
            "color": get_color_for_count(cnt),
        })
        current += timedelta(days=1)
    return Response(result)


@api_view(["GET"])
def stats(request):
    """Return summary statistics for a single habit.

    Query params:
      habit_id - primary key of the habit
    """

    hid = request.GET.get("habit_id")
    if not hid:
        return Response({"detail": "habit_id required"}, status=400)
    try:
        habit = Habit.objects.get(pk=hid)
    except Habit.DoesNotExist:
        return Response({"detail": "Habit not found"}, status=404)

    total = habit.checkins.count()  # type: ignore
    # compute span from whichever comes first, habit creation or first checkin, up to today
    today = timezone.localdate()
    start_date = habit.created_at.date()
    first = habit.checkins.order_by("date").values_list("date", flat=True).first() # type: ignore
    if first and first < start_date:
        start_date = first
    days = (today - start_date).days + 1
    percentage = (total / days * 100) if days > 0 else 0

    return Response({
        "total_completed": total,
        "completion_percentage": percentage,
        "current_streak": habit.current_streak(),
        "longest_streak": habit.longest_streak(),
    })
