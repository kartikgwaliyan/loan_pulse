from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "success": False,
            "error_code": exc.__class__.__name__.upper(),
            "message": "An error occurred while processing your request.",
            "errors": response.data,
            "status_code": response.status_code
        }
        
        # Format friendly message if details string exists
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_data["message"] = str(response.data['detail'])
            elif 'non_field_errors' in response.data:
                custom_data["message"] = " ".join([str(e) for e in response.data['non_field_errors']])
            else:
                first_key = next(iter(response.data))
                custom_data["message"] = f"Field error on '{first_key}': {response.data[first_key]}"
        elif isinstance(response.data, list):
            custom_data["message"] = " ".join([str(e) for e in response.data])

        response.data = custom_data

    return response
