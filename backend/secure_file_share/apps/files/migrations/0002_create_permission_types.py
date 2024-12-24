from django.db import migrations

def create_permission_types(apps, schema_editor):
    FilePermissionType = apps.get_model('files', 'FilePermissionType')
    
    permission_types = [
        ('READ', 'Can view and download files'),
        ('WRITE', 'Can modify and delete files'),
        ('SHARE', 'Can share files with others'),
    ]
    
    for name, description in permission_types:
        FilePermissionType.objects.create(name=name, description=description)

class Migration(migrations.Migration):
    dependencies = [
        ('files', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_permission_types),
    ] 