import uuid

from django.db import migrations, models
import django.db.models.deletion


def seed_stations(apps, schema_editor):
    Station = apps.get_model("api", "KitchenStation")
    defaults = [
        {
            "code": "grill",
            "name": "Grill",
            "tags": ["grill", "protein"],
            "capacity": 4,
            "auto_batch_window_seconds": 120,
            "sort_order": 10,
        },
        {
            "code": "fry",
            "name": "Fry",
            "tags": ["fry", "sides"],
            "capacity": 6,
            "auto_batch_window_seconds": 90,
            "sort_order": 20,
        },
        {
            "code": "salad",
            "name": "Salad",
            "tags": ["salad", "cold", "prep"],
            "capacity": 3,
            "auto_batch_window_seconds": 60,
            "sort_order": 30,
        },
        {
            "code": "dessert",
            "name": "Dessert",
            "tags": ["dessert", "prep"],
            "capacity": 2,
            "auto_batch_window_seconds": 75,
            "sort_order": 40,
        },
        {
            "code": "bar",
            "name": "Beverage Bar",
            "tags": ["drink", "bar"],
            "capacity": 3,
            "auto_batch_window_seconds": 45,
            "sort_order": 50,
        },
        {
            "code": "expo",
            "name": "Expo",
            "tags": ["expo", "assemble"],
            "capacity": 8,
            "auto_batch_window_seconds": 30,
            "sort_order": 5,
            "is_expo": True,
        },
    ]
    for payload in defaults:
        Station.objects.update_or_create(
            code=payload["code"],
            defaults={
                "name": payload["name"],
                "tags": payload.get("tags", []),
                "capacity": payload.get("capacity", 4),
                "auto_batch_window_seconds": payload.get(
                    "auto_batch_window_seconds", 90
                ),
                "make_to_stock": payload.get("make_to_stock", []),
                "is_active": True,
                "is_expo": payload.get("is_expo", False),
                "sort_order": payload.get("sort_order", 0),
            },
        )


def hydrate_order_counters(apps, schema_editor):
    Order = apps.get_model("api", "Order")
    OrderItem = apps.get_model("api", "OrderItem")

    status_map = {
        "pending": "new",
        "in_queue": "accepted",
        "in_progress": "in_prep",
        "ready": "staged",
    }
    for order in Order.objects.all():
        total_items = OrderItem.objects.filter(order=order).count()
        Order.objects.filter(pk=order.pk).update(
            total_items_cached=total_items,
            partial_ready_items=0,
            status=status_map.get(order.status, order.status),
        )


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0029_cateringevent_cateringeventitem_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="KitchenStation",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("code", models.CharField(max_length=32, unique=True)),
                ("name", models.CharField(max_length=64)),
                ("tags", models.JSONField(blank=True, default=list)),
                ("capacity", models.PositiveIntegerField(default=4)),
                (
                    "auto_batch_window_seconds",
                    models.PositiveIntegerField(default=90),
                ),
                ("make_to_stock", models.JSONField(blank=True, default=list)),
                ("is_active", models.BooleanField(default=True)),
                ("is_expo", models.BooleanField(default=False)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "kitchen_station",
            },
        ),
        migrations.AddIndex(
            model_name="kitchenstation",
            index=models.Index(
                fields=["is_active", "sort_order"], name="kitchen_station_active_idx"
            ),
        ),
        migrations.CreateModel(
            name="OrderEvent",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("event_type", models.CharField(max_length=64)),
                ("from_state", models.CharField(blank=True, max_length=32)),
                ("to_state", models.CharField(blank=True, max_length=32)),
                ("station_code", models.CharField(blank=True, max_length=32)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="api.appuser",
                    ),
                ),
                (
                    "order",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="events",
                        to="api.order",
                    ),
                ),
            ],
            options={
                "db_table": "order_event",
            },
        ),
        migrations.AddIndex(
            model_name="orderevent",
            index=models.Index(
                fields=["order", "created_at"], name="order_event_order_created_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="orderevent",
            index=models.Index(fields=["event_type"], name="order_event_type_idx"),
        ),
        migrations.AddField(
            model_name="order",
            name="bulk_reference",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="order",
            name="channel",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="order",
            name="eta_seconds",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="order",
            name="handoff_code",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="order",
            name="handoff_verified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="order",
            name="handoff_verified_by",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="order",
            name="is_throttled",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="order",
            name="last_station_code",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="order",
            name="late_by_seconds",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="order",
            name="meta",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="order",
            name="partial_ready_items",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="order",
            name="priority",
            field=models.CharField(default="normal", max_length=16),
        ),
        migrations.AddField(
            model_name="order",
            name="promised_time",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="order",
            name="quoted_minutes",
            field=models.PositiveIntegerField(default=15),
        ),
        migrations.AddField(
            model_name="order",
            name="shelf_slot",
            field=models.CharField(blank=True, max_length=16),
        ),
        migrations.AddField(
            model_name="order",
            name="throttle_reason",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="order",
            name="total_items_cached",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name="order",
            name="status",
            field=models.CharField(
                choices=[
                    ("new", "New"),
                    ("pending", "Pending"),
                    ("accepted", "Accepted"),
                    ("in_queue", "In Queue"),
                    ("in_prep", "In Preparation"),
                    ("in_progress", "In Progress"),
                    ("assembling", "Assembling"),
                    ("staged", "Staged"),
                    ("ready", "Ready"),
                    ("handoff", "Handoff"),
                    ("completed", "Completed"),
                    ("cancelled", "Cancelled"),
                    ("voided", "Voided"),
                    ("refunded", "Refunded"),
                ],
                default="pending",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="allergens",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="batch_id",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="cook_seconds_actual",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="cook_seconds_estimate",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="fired_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="hold_until",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="meta",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="modifiers",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="notes",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="priority",
            field=models.CharField(default="normal", max_length=16),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="ready_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="sequence",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="state",
            field=models.CharField(
                choices=[
                    ("queued", "Queued"),
                    ("firing", "Firing"),
                    ("cooking", "Cooking"),
                    ("hold", "Hold"),
                    ("delayed", "Delayed"),
                    ("ready", "Item Ready"),
                    ("refired", "Re-fired"),
                    ("cancelled", "Cancelled"),
                    ("completed", "Completed"),
                ],
                default="queued",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="station_code",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="station_name",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddIndex(
            model_name="orderitem",
            index=models.Index(fields=["station_code", "state"], name="order_item_station_state_idx"),
        ),
        migrations.AddIndex(
            model_name="orderitem",
            index=models.Index(fields=["batch_id"], name="order_item_batch_idx"),
        ),
        migrations.AddField(
            model_name="orderevent",
            name="item",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="events",
                to="api.orderitem",
            ),
        ),
        migrations.RunPython(seed_stations, migrations.RunPython.noop),
        migrations.RunPython(hydrate_order_counters, migrations.RunPython.noop),
    ]
