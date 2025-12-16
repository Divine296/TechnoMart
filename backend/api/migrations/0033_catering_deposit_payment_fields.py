# Generated manually for adding deposit and payment tracking fields to CateringEvent
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_add_menu_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='cateringevent',
            name='deposit_amount',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Deposit amount required', max_digits=12),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='deposit_paid',
            field=models.BooleanField(default=False, help_text='Whether deposit has been paid'),
        ),
        migrations.AddField(
            model_name='cateringevent',
            name='payment_status',
            field=models.CharField(default='unpaid', help_text='Overall payment status: unpaid, partial, paid', max_length=32),
        ),
    ]
