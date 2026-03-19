from django.contrib import admin
from .models import CheckIn, Habit, UserStats, Subscription


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ("name", "user_id", "created_at", "color")
    list_filter = ("created_at", "color")
    search_fields = ("name", "user_id", "description")
    readonly_fields = ("created_at",)


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ("habit", "user_id", "date", "created_at")
    list_filter = ("date", "created_at")
    search_fields = ("habit__name", "user_id")
    readonly_fields = ("created_at",)


@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ("user_id", "display_name", "xp_total", "updated_at")
    list_filter = ("updated_at",)
    search_fields = ("user_id", "display_name")
    readonly_fields = ("updated_at",)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "user_id",
        "wallet_address",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("user_id", "wallet_address", "tx_hash")
    readonly_fields = ("created_at", "updated_at", "tx_hash")

    fieldsets = (
        (
            "User Information",
            {
                "fields": ("user_id", "wallet_address"),
            }
        ),
        (
            "Subscription Details",
            {
                "fields": ("tx_hash", "is_active"),
            }
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            }
        ),
    )
