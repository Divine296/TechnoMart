# Generated manually for adding soft delete fields to CateringEvent
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_catering_deposit_payment_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='cateringevent',
            name='deleted_at',
            field=models.DateTimeField(blank=True, help_text='Soft delete timestamp', null=True),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='deleted_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='catering_events_deleted', to=settings.AUTH_USER_MODEL),
        ),
    ]
