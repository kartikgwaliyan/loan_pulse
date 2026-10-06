from rest_framework import serializers
from .models import KYCDocument
import os

ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

class KYCDocumentSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.SerializerMethodField()
    customer_id = serializers.CharField(source='customer.customer_id', read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = KYCDocument
        fields = [
            'id', 'customer', 'customer_id', 'customer_name', 'document_type',
            'document_number', 'file', 'file_name', 'file_size', 'mime_type',
            'status', 'verified_by', 'verified_by_name', 'verified_at',
            'remarks', 'expiry_date', 'uploaded_at'
        ]
        read_only_fields = ['id', 'status', 'verified_by', 'verified_at', 'file_size', 'mime_type', 'uploaded_at']

    def get_verified_by_name(self, obj):
        if obj.verified_by:
            return obj.verified_by.get_full_name() or obj.verified_by.username
        return None

    def get_customer_name(self, obj):
        return obj.customer.user.get_full_name() or obj.customer.user.username

    def validate_file(self, file_obj):
        # Validate extension
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # Validate size
        if file_obj.size > MAX_FILE_SIZE_BYTES:
            raise serializers.ValidationError(
                f"File size exceeds maximum allowed limit of 5MB. Current size: {file_obj.size / (1024*1024):.2f}MB"
            )

        return file_obj

    def create(self, validated_data):
        file_obj = validated_data.get('file')
        if file_obj:
            validated_data['file_name'] = file_obj.name
            validated_data['file_size'] = file_obj.size
            validated_data['mime_type'] = getattr(file_obj, 'content_type', '')
        return super().create(validated_data)

class KYCVerifySerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['VERIFIED', 'REJECTED'])
    remarks = serializers.CharField(required=False, allow_blank=True)
