from django.urls import include, path

# delegate everything to the habits app router and custom views
urlpatterns = [
    path("", include("habits.api.urls")),
]
