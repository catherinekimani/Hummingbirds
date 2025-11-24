from django.urls import path
from . import views

urlpatterns = [
    path("health", views.health),
    path("donate", views.donate),
    path("paystack/webhook", views.paystack_webhook),
]
