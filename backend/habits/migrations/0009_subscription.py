"""
Migration: Create Subscription model for Firestore-based architecture
One-time permanent subscription with transaction hash verification
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('habits', '0008_userstats_display_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='Subscription',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                (
                    'user_id',
                    models.CharField(
                        db_index=True,
                        max_length=128,
                        unique=True,
                        help_text='Firebase UID',
                    ),
                ),
                (
                    'wallet_address',
                    models.CharField(
                        db_index=True,
                        max_length=42,
                        unique=True,
                        help_text='Ethereum wallet address',
                    ),
                ),
                (
                    'tx_hash',
                    models.CharField(
                        db_index=True,
                        max_length=66,
                        unique=True,
                        help_text='Transaction hash - proof of payment on blockchain',
                    ),
                ),
                (
                    'is_active',
                    models.BooleanField(
                        default=True,
                        help_text='One-time purchase = always active until disabled',
                    ),
                ),
                (
                    'created_at',
                    models.DateTimeField(
                        auto_now_add=True,
                    ),
                ),
                (
                    'updated_at',
                    models.DateTimeField(
                        auto_now=True,
                    ),
                ),
            ],
            options={
                'verbose_name': 'Subscription',
                'verbose_name_plural': 'Subscriptions',
                'ordering': ['-created_at'],
            },
        ),
    ]
