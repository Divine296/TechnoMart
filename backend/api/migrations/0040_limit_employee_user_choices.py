from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0039_rename_face_templa_model_n_idx_face_templa_model_n_a2ae7c_idx_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="employee",
            name="user",
            field=models.OneToOneField(
                blank=True,
                limit_choices_to={"role__in": ["staff", "manager"]},
                null=True,
                on_delete=models.deletion.SET_NULL,
                related_name="employee_profile",
                to="api.appuser",
            ),
        ),
    ]
