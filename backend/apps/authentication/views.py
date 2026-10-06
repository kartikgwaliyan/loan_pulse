from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    AdminUserManageSerializer
)
from .permissions import IsAdminUserRole
from apps.audit.models import AuditLog

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Audit log login
            username = request.data.get('username')
            user = User.objects.filter(username=username).first()
            if user:
                AuditLog.log_action(
                    user=user,
                    action='LOGIN',
                    target_type='USER',
                    target_id=str(user.id),
                    ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
                    details={'username': user.username, 'role': user.role}
                )
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log registration
        AuditLog.log_action(
            user=user,
            action='USER_REGISTRATION',
            target_type='USER',
            target_id=str(user.id),
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details={'email': user.email, 'role': user.role}
        )

        return Response({
            "success": True,
            "message": "User registered successfully! Please proceed to complete onboarding and KYC.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "phone": user.phone
            }
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class AdminUserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = AdminUserManageSerializer
    queryset = User.objects.all().order_by('-date_joined')
    filterset_fields = ['role', 'is_active', 'branch']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = AdminUserManageSerializer
    queryset = User.objects.all()
