from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

from .repository import TodoRepository
from .serializers import TodoSerializer

repo = TodoRepository()

@method_decorator(csrf_exempt, name='dispatch')
class TodoListView(APIView):

    def get(self, request):
        try:
            items = repo.list()
            return Response(items, status=status.HTTP_200_OK)
        except Exception as exc:
            logging.exception("Failed to fetch todos")
            return Response({
                "success": False,
                "error": {"type": type(exc).__name__, "message": str(exc)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = TodoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            created = repo.create(serializer.validated_data['task'])
            return Response({
                "success": True,
                "data": created
            }, status=status.HTTP_201_CREATED)
        except Exception as exc:
            logging.exception("Failed to create todo")
            return Response({
                "success": False,
                "error": {"type": type(exc).__name__, "message": str(exc)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class TodoDetailView(APIView):

    def get(self, request, pk):
        todo = repo.get(pk)
        if not todo:
            return Response({
                "success": False,
                "error": {"message": "Todo not found"}
            }, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "data": todo}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        serializer = TodoSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            updated = repo.update(pk, serializer.validated_data)
            if updated:
                return Response({"success": True, "data": updated}, status=status.HTTP_200_OK)
            return Response({
                "success": False,
                "error": {"message": "Update failed or todo not found"}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            logging.exception(f"Failed to update todo id={pk}")
            return Response({
                "success": False,
                "error": {"type": type(exc).__name__, "message": str(exc)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            deleted = repo.delete(pk)
            if deleted:
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response({
                "success": False,
                "error": {"message": "Delete failed or todo not found"}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            logging.exception(f"Failed to delete todo id={pk}")
            return Response({
                "success": False,
                "error": {"type": type(exc).__name__, "message": str(exc)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
