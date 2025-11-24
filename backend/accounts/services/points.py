import uuid
from dataclasses import dataclass
from typing import Optional, Union

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from .. import models


@dataclass(frozen=True)
class AwardPointsResult:
    transaction: models.PointTransaction
    new_total: int


class PointTransactionService:
    @transaction.atomic
    def award_points(
            self,
            user: models.User,
            points: int,
            source_type: str,
            source_id: Optional[uuid.UUID] = None,
            reason: Optional[str] = None,
            created_at: Optional[timezone.datetime] = None,
    ) -> AwardPointsResult:
        if not source_type or not source_type.strip():
            raise ValueError("source_type is required")

        if points == 0:
            raise ValueError("points must be non-zero")

        tx = models.PointTransaction.objects.create(
            user=user,
            points=points,
            source_type=source_type.strip(),
            source_id=source_id,
            reason=reason,
            created_at=created_at or None,  # auto_now_add handles None
        )

        new_total = self.get_total_points(user)

        return AwardPointsResult(transaction=tx, new_total=new_total)

    def get_total_points(self, user: Union[models.User, uuid.UUID]) -> int:
        user_id = user.id if isinstance(user, models.User) else user

        agg = (
            models.PointTransaction.objects
            .filter(user_id=user_id)
            .aggregate(total=Sum("points"))
        )
        return int(agg["total"] or 0)

    def get_points_breakdown_by_source(
            self,
            user: Union[models.User, uuid.UUID],
    ):
        user_id = user.id if isinstance(user, models.User) else user

        return (
            models.PointTransaction.objects
            .filter(user_id=user_id)
            .values("source_type")
            .annotate(total=Sum("points"))
            .order_by("source_type")
        )

    @transaction.atomic
    def revoke_points(
            self,
            user: models.User,
            points: int,
            source_type: str,
            source_id: Optional[uuid.UUID] = None,
            reason: Optional[str] = None,
    ) -> AwardPointsResult:
        return self.award_points(
            user=user,
            points=-abs(points),
            source_type=source_type,
            source_id=source_id,
            reason=reason or "revoke",
        )
