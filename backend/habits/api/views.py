from datetime import date, timedelta

from django.db.models import Count
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from ..models import CheckIn, Habit, get_color_for_count
from .serializers import CheckInSerializer, HabitSerializer
from rest_framework.permissions import IsAuthenticated




class HabitViewSet(ModelViewSet):
    # provide a fallback queryset so DRF's router can infer a basename
    queryset = Habit.objects.none()
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self): # type: ignore
        uid = getattr(self.request.user, "uid", None)
        if not uid:
            return Habit.objects.none()
        return Habit.objects.filter(user_id=uid)

    def perform_create(self, serializer):
        uid = getattr(self.request.user, "uid", None)
        serializer.save(user_id=uid or "")


class CheckInViewSet(ModelViewSet):
    # provide a fallback queryset so DRF's router can infer a basename
    queryset = CheckIn.objects.none()
    serializer_class = CheckInSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self): # type: ignore
        uid = getattr(self.request.user, "uid", None)
        if not uid:
            return CheckIn.objects.none()
        return CheckIn.objects.filter(user_id=uid)

    def perform_create(self, serializer):
        # ensure the habit belongs to the current user
        uid = getattr(self.request.user, "uid", None) or ""
        habit = serializer.validated_data.get("habit")
        if habit.user_id and habit.user_id != uid:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Cannot add checkin for a habit you do not own")
        serializer.save(user_id=uid)


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

    # enforce a maximum range of 1 year (inclusive)
    days_span = (end - start).days + 1
    if days_span > 366:
        return Response({"detail": "Date range too large (max 1 year)"}, status=400)

    uid = getattr(request.user, "uid", None)
    if not uid:
        return Response({"detail": "Authentication required"}, status=401)

    qs = CheckIn.objects.filter(user_id=uid, date__range=(start, end))
    aggregated = qs.values("date").annotate(count=Count("id"))
    counts = {entry["date"]: entry["count"] for entry in aggregated}

    result = []
    current = start
    while current <= end:
        cnt = counts.get(current, 0)
        result.append(
            {
                "date": current,
                "count": cnt,
                "color": get_color_for_count(cnt),
            }
        )
        current += timedelta(days=1)
    return Response(result)


@api_view(["GET"])
def stats(request):
    """Return summary statistics.

    When ``habit_id`` is provided, returns stats for that habit.
    When omitted, returns global stats across all habits.

    Query params:
      habit_id - optional primary key of the habit
    """

    hid = request.GET.get("habit_id")

    def build_buckets(qs):
        # weekly buckets
        weekly_qs = (
            qs.values("date__year", "date__week")
            .annotate(count=Count("id"))
            .order_by("date__year", "date__week")
        )
        weekly = []
        for entry in weekly_qs:
            year = entry["date__year"]
            week = entry["date__week"]
            # ISO week start (Monday)
            week_start = date.fromisocalendar(year, week, 1)
            weekly.append({"week_start": week_start, "count": entry["count"]})

        # monthly buckets
        monthly_qs = (
            qs.values("date__year", "date__month")
            .annotate(count=Count("id"))
            .order_by("date__year", "date__month")
        )
        monthly = []
        for entry in monthly_qs:
            year = entry["date__year"]
            month = entry["date__month"]
            month_start = date(year, month, 1)
            monthly.append({"month_start": month_start, "count": entry["count"]})

        return {"weekly": weekly, "monthly": monthly}

    if hid:
        try:
            habit = Habit.objects.get(pk=hid)
        except Habit.DoesNotExist:
            return Response({"detail": "Habit not found"}, status=404)

        # ensure habit belongs to current user
        uid = getattr(request.user, "uid", None)
        if not uid or habit.user_id != uid:
            return Response({"detail": "Not found"}, status=404)

        total = habit.checkins.count()  # type: ignore
        # compute span from whichever comes first, habit creation or first checkin, up to today
        today = timezone.localdate()
        start_date = habit.created_at.date()
        first = habit.checkins.order_by("date").values_list("date", flat=True).first() # type: ignore
        if first and first < start_date:
            start_date = first
        days = (today - start_date).days + 1
        percentage = (total / days * 100) if days > 0 else 0

        buckets = build_buckets(habit.checkins.all())  # type: ignore

        return Response({
            "scope": "habit",
            "habit_id": habit.id,  # type: ignore
            "total_completed": total,
            "completion_percentage": percentage,
            "current_streak": habit.current_streak(),
            "longest_streak": habit.longest_streak(),
            **buckets,
        })

    # global stats (no habit_id)
    uid = getattr(request.user, "uid", None)
    if not uid:
        return Response({"detail": "Authentication required"}, status=401)

    qs = CheckIn.objects.filter(user_id=uid)
    total_completed = qs.count()
    buckets = build_buckets(qs)

    return Response({
        "scope": "global",
        "total_completed": total_completed,
        "habits_count": Habit.objects.filter(user_id=uid).count(),
        **buckets,
    })
