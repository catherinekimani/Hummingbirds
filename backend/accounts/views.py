from django.http import JsonResponse
from django.shortcuts import render

def health(request):
    return JsonResponse({"status": "ok"})
