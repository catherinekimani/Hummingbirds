import hmac
import hashlib
import json
import uuid
import requests
from dataclasses import dataclass
from typing import Optional, Dict, Any

from django.conf import settings

PAYSTACK_BASE_URL = getattr(settings, "PAYSTACK_BASE_URL", "https://api.paystack.co")

@dataclass(frozen=True)
class InitializeResult:
    authorization_url: str
    access_code: str
    reference: str


class PaystackService:

    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.base_url = getattr(settings, "PAYSTACK_BASE_URL", PAYSTACK_BASE_URL)

    def initialize_transaction(
        self,
        *,
        email: str,
        amount_major: int,
        reference: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        callback_url: Optional[str] = None,
    ) -> InitializeResult:
        """
        Calls Paystack Initialize Transaction.
        Paystack amount must be in cents.
        """
        reference = reference or uuid.uuid4().hex

        payload = {
            "email": email,
            "amount": amount_major * 100,  # subunit
            "reference": reference,
        }

        if metadata:
            payload["metadata"] = metadata
        if callback_url:
            payload["callback_url"] = callback_url

        resp = requests.post(
            f"{self.base_url}/transaction/initialize",
            headers={
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps(payload),
            timeout=15,
        )
        data = resp.json()

        if not data.get("status"):
            raise ValueError(data.get("message") or "Paystack init failed")

        d = data["data"]
        return InitializeResult(
            authorization_url=d["authorization_url"],
            access_code=d["access_code"],
            reference=d["reference"],
        )

    def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
        computed = hmac.new(
            self.secret_key.encode("utf-8"),
            raw_body,
            hashlib.sha512
        ).hexdigest()
        return hmac.compare_digest(computed, signature)
