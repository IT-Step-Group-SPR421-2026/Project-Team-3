from django.test import TestCase
from datetime import date, timedelta

from django.utils import timezone

from .models import Habit, CheckIn, get_color_for_count


class HabitModelTests(TestCase):
    def test_longest_streak_computation(self):
        h = Habit.objects.create(name="Workout")
        # create checkins: 2026-01-01, 2026-01-02, 2026-01-04, 2026-01-05, 2026-01-06
        CheckIn.objects.create(habit=h, date=date(2026, 1, 1))
        CheckIn.objects.create(habit=h, date=date(2026, 1, 2))
        CheckIn.objects.create(habit=h, date=date(2026, 1, 4))
        CheckIn.objects.create(habit=h, date=date(2026, 1, 5))
        CheckIn.objects.create(habit=h, date=date(2026, 1, 6))

        self.assertEqual(h.longest_streak(), 3)


class CheckInColorTests(TestCase):
    def test_color_mapping_by_total_checkins_per_day(self):
        h1 = Habit.objects.create(name="A")
        h2 = Habit.objects.create(name="B")
        d = date(2026, 2, 1)

        c1 = CheckIn.objects.create(habit=h1, date=d)
        # total = 1 -> #9be9a8
        self.assertEqual(c1.color(), "#9be9a8")

        c2 = CheckIn.objects.create(habit=h2, date=d)
        # total = 2 -> still #9be9a8
        self.assertEqual(c1.color(), "#9be9a8")
        self.assertEqual(c2.color(), "#9be9a8")

        # add two more checkins (different habits allowed)
        h3 = Habit.objects.create(name="C")
        h4 = Habit.objects.create(name="D")
        c3 = CheckIn.objects.create(habit=h3, date=d)
        c4 = CheckIn.objects.create(habit=h4, date=d)
        # total = 4 -> #40c463
        self.assertEqual(c1.color(), "#40c463")
        self.assertEqual(c4.color(), "#40c463")

        # add one more to reach 5
        h5 = Habit.objects.create(name="E")
        c5 = CheckIn.objects.create(habit=h5, date=d)
        self.assertEqual(c5.color(), "#216e39")
        self.assertEqual(c1.color(), "#216e39")

    def test_color_helpers_and_classmethod(self):
        # direct mapping tests for get_color_for_count
        self.assertEqual(get_color_for_count(0), "#ebedf0")
        self.assertEqual(get_color_for_count(1), "#9be9a8")
        self.assertEqual(get_color_for_count(2), "#9be9a8")
        self.assertEqual(get_color_for_count(3), "#40c463")
        self.assertEqual(get_color_for_count(4), "#40c463")
        self.assertEqual(get_color_for_count(5), "#216e39")

        # classmethod should reflect aggregated counts for a date
        h1 = Habit.objects.create(name="X")
        h2 = Habit.objects.create(name="Y")
        d = date(2026, 3, 3)
        CheckIn.objects.create(habit=h1, date=d)
        self.assertEqual(CheckIn.color_for_date(d), "#9be9a8") 
        CheckIn.objects.create(habit=h2, date=d)
        self.assertEqual(CheckIn.color_for_date(d), "#9be9a8")
        # add more to push into other buckets
        for i in range(3):
            h = Habit.objects.create(name=f"Z{i}")
            CheckIn.objects.create(habit=h, date=d)
        self.assertEqual(CheckIn.color_for_date(d), "#216e39")

class ApiEndpointTests(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient

        self.client = APIClient()

    def test_heatmap_endpoint_ranges_and_colors(self):
        h = Habit.objects.create(name="Heat")
        CheckIn.objects.create(habit=h, date=date(2026, 2, 10))
        CheckIn.objects.create(habit=h, date=date(2026, 2, 12))
        resp = self.client.get("/api/heatmap/", {"from": "2026-02-10", "to": "2026-02-13"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 4)
        counts = {item["date"]: item for item in data}
        self.assertEqual(counts["2026-02-10"]["count"], 1)
        self.assertEqual(counts["2026-02-11"]["count"], 0)
        self.assertEqual(counts["2026-02-12"]["count"], 1)
        self.assertEqual(counts["2026-02-11"]["color"], get_color_for_count(0))

    def test_stats_endpoint_basic_metrics(self):
        h = Habit.objects.create(name="StatHabit", created_at=timezone.now())
        CheckIn.objects.create(habit=h, date=timezone.localdate())
        CheckIn.objects.create(habit=h, date=timezone.localdate() - timedelta(days=1))
        resp = self.client.get("/api/stats/", {"habit_id": h.id}) # type: ignore
        self.assertEqual(resp.status_code, 200)
        payload = resp.json()
        self.assertEqual(payload["total_completed"], 2)
        self.assertTrue(0 <= payload["completion_percentage"] <= 100)
        self.assertEqual(payload["current_streak"], h.current_streak())
        self.assertEqual(payload["longest_streak"], h.longest_streak())

    def test_missing_parameters_and_errors(self):
        resp = self.client.get("/api/heatmap/")
        self.assertEqual(resp.status_code, 400)
        resp = self.client.get("/api/stats/")
        self.assertEqual(resp.status_code, 400)
        resp = self.client.get("/api/stats/", {"habit_id": 9999})
        self.assertEqual(resp.status_code, 404)
