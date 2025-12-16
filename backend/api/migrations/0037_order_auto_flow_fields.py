from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0036_add_order_discount_to_catering_event"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="auto_advance_target",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="order",
            name="auto_advance_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="order",
            name="phase_started_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="order",
            name="phase_sequence",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="order",
            name="auto_advance_paused",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="order",
            name="auto_advance_pause_reason",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="order",
            name="auto_advance_duration_seconds",
            field=models.PositiveIntegerField(default=40),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(
                fields=["auto_advance_at"],
                name="order_auto_advance_at_idx",
            ),
        ),
    ]
