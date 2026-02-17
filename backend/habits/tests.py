from django.test import TestCase
from datetime import date

from .models import Habit, CheckIn


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