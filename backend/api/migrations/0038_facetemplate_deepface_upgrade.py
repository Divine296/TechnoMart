# Generated migration for DeepFace upgrade

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0037_order_auto_flow_fields'),
    ]

    operations = [
        # Add new fields for DeepFace
        migrations.AddField(
            model_name='facetemplate',
            name='embedding',
            field=models.TextField(default='[]', help_text='JSON array of facial embedding vector'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='facetemplate',
            name='model_name',
            field=models.CharField(default='Facenet512', help_text='DeepFace model used: Facenet512, VGG-Face, ArcFace, etc.', max_length=32),
        ),
        migrations.AddField(
            model_name='facetemplate',
            name='distance_metric',
            field=models.CharField(default='cosine', help_text='Distance metric: cosine, euclidean, euclidean_l2', max_length=16),
        ),

        # Make ahash nullable and optional (for backward compatibility)
        migrations.AlterField(
            model_name='facetemplate',
            name='ahash',
            field=models.CharField(blank=True, help_text='DEPRECATED: Legacy average hash field', max_length=16, null=True),
        ),

        # Add index on model_name for faster queries
        migrations.AddIndex(
            model_name='facetemplate',
            index=models.Index(fields=['model_name'], name='face_templa_model_n_idx'),
        ),
    ]
