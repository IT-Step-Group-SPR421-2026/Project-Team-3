from django.contrib import admin
from .models import CheckIn, Habit

# Register your models here.
admin.site.register(Habit)
admin.site.register(CheckIn)
