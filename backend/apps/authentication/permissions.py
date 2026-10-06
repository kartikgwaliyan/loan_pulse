from rest_framework import permissions

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CUSTOMER')

class IsLoanOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['LOAN_OFFICER', 'ADMIN'])

class IsRiskAnalyst(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['RISK_ANALYST', 'ADMIN'])

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['MANAGER', 'ADMIN'])

class IsCollectionOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['COLLECTION_OFFICER', 'ADMIN'])

class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser))

class IsEmployeeOrAdmin(permissions.BasePermission):
    """Allows Loan Officers, Risk Analysts, Managers, Collection Officers, or Admins"""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ['LOAN_OFFICER', 'RISK_ANALYST', 'MANAGER', 'COLLECTION_OFFICER', 'ADMIN']
