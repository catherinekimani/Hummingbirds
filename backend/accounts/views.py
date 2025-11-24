import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Donation, User
from .services.paystack import PaystackService
from .services.points import PointTransactionService

def health(request):
    return JsonResponse({"status": "ok"})

@csrf_exempt
def donate(request):
    """
    POST /api/donate
    body: { "phone_number": "...", "amount": 123 }
    returns: { "authorization_url": "...", "reference": "..." }
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8"))
        phone = body["phone_number"].strip()
        amount = int(body["amount"])
        if amount <= 0:
            return JsonResponse({"detail": "amount must be > 0"}, status=400)
    except Exception:
        return JsonResponse({"detail": "Invalid payload"}, status=400)

    user = User.objects.filter(phone=phone).first()
    email = (user.email if user and getattr(user, "email", None)
             else f"{phone}@example.com")

    paystack = PaystackService()
    init = paystack.initialize_transaction(
        email=email,
        amount_major=amount,
        metadata={"phone_number": phone, "purpose": "donation"},
        callback_url=getattr(request, "PAYSTACK_CALLBACK_URL", None) or None,
    )

    Donation.objects.create(
        user=user,
        phone_number=phone,
        amount=amount,
        reference=init.reference,
        status="initialized",
    )

    return JsonResponse({
        "authorization_url": init.authorization_url,
        "reference": init.reference,
    })

@csrf_exempt
def paystack_webhook(request):
    """
    POST /api/paystack/webhook
    Paystack sends events here. We:
      - verify signature
      - listen for charge.success
      - award 5 points once per donation reference
    """
    raw_body = request.body
    signature = request.headers.get("x-paystack-signature", "")

    paystack = PaystackService()
    if not signature or not paystack.verify_webhook_signature(raw_body, signature):
        return HttpResponse(status=400)

    event = json.loads(raw_body.decode("utf-8"))
    event_type = event.get("event")
    data = event.get("data", {})

    if event_type != "charge.success":
        # acknowledge other events
        return HttpResponse(status=200)

    reference = data.get("reference")
    if not reference:
        return HttpResponse(status=200)

    donation = Donation.objects.filter(reference=reference).select_for_update().first()
    if not donation:
        return HttpResponse(status=200)

    if donation.points_awarded:
        return HttpResponse(status=200)

    donation.status = "success"
    donation.points_awarded = True
    donation.save(update_fields=["status", "points_awarded"])

    if donation.user_id:
        pts = PointTransactionService()
        pts.award_points(
            user=donation.user,
            points=5,
            source_type="donation",
            source_id=None,
            reason=f"Donation {reference}",
        )

    return HttpResponse(status=200)
