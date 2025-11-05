from rest_framework import serializers

class TodoSerializer(serializers.Serializer):
    task = serializers.CharField(max_length=255)
    done = serializers.BooleanField(default=False, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
