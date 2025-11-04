from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging
import json

from .repository import TodoRepository

repo = TodoRepository()


@method_decorator(csrf_exempt, name='dispatch')
class TodoListView(APIView):
    def get(self, request):
        try:
            items = repo.list()
            return Response(items, status=status.HTTP_200_OK)
        except Exception as exc:
            logging.exception("Failed to fetch todos")
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            payload = request.data if hasattr(request, "data") else json.loads(request.body.decode("utf-8") or "{}")
            task = payload.get("task") or payload.get("text")
            if not task or not str(task).strip():
                return Response({"error": "Missing 'task' field"}, status=status.HTTP_400_BAD_REQUEST)
            created = repo.create(task=str(task).strip())
            return Response(created, status=status.HTTP_201_CREATED)
        except Exception as exc:
            logging.exception("Failed to insert todo")
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class TodoDetailView(APIView):
    def put(self, request, pk):
        try:
            payload = request.data if hasattr(request, "data") else json.loads(request.body.decode("utf-8") or "{}")
            update = {}
            if "task" in payload:
                update["task"] = payload.get("task")
            if "done" in payload:
                update["done"] = bool(payload.get("done"))
            if not update:
                return Response({"error": "Nothing to update"}, status=status.HTTP_400_BAD_REQUEST)
            updated = repo.update(pk, update)
            if not updated:
                return Response({"error": "Not found or invalid id"}, status=status.HTTP_404_NOT_FOUND)
            return Response(updated, status=status.HTTP_200_OK)
        except Exception as exc:
            logging.exception("Failed to update todo")
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            deleted = repo.delete(pk)
            if not deleted:
                return Response({"error": "Not found or invalid id"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as exc:
            logging.exception("Failed to delete todo")
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        