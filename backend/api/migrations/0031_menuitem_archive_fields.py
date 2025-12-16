from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0030_order_queue_overhaul"),
    ]

    operations = [
        migrations.AddField(
            model_name="menuitem",
            name="archived",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="menuitem",
            name="archived_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(fields=["archived"], name="menuitem_archived_idx"),
        ),
    ]
