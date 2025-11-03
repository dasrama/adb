from django.shortcuts import render
from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from datetime import datetime
import json, logging, os

mongo_uri = f"mongodb://{os.environ['MONGO_HOST']}:{os.environ['MONGO_PORT']}"
db = MongoClient(mongo_uri)['test_db']


class TodoListView(APIView):
    def get(self, request):
        try:
            todos = []
            for doc in db.todos.find():
                doc['_id'] = str(doc['_id'])
                todos.append(doc)
            return Response(todos, status=status.HTTP_200_OK)
        except Exception as e:
            logging.exception("Failed to fetch todos")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            payload = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8') or '{}')
            task = payload.get('task')
            
            if not task:
                return Response({'error': 'Missing "task" field'}, status=status.HTTP_400_BAD_REQUEST)

            doc = {
                'task': task,
                'done': False,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }

            res = db.todos.insert_one(doc)
            doc['_id'] = str(res.inserted_id)
            return Response(doc, status=status.HTTP_201_CREATED)
        except Exception as e:
            logging.exception("Failed to insert todo")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        try:
            try:
                oid = ObjectId(pk)
            except Exception:
                return Response({'error': 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)

            payload = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8') or '{}')
            update = {}

            if 'task' in payload:
                update['task'] = payload['task']
            if 'done' in payload:
                update['done'] = bool(payload['done'])

            if not update:
                return Response({'error': 'Nothing to update'}, status=status.HTTP_400_BAD_REQUEST)

            update['updated_at'] = datetime.now()

            res = db.todos.update_one({'_id': oid}, {'$set': update})
            if res.matched_count == 0:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

            doc = db.todos.find_one({'_id': oid})
            doc['_id'] = str(doc['_id'])
            return Response(doc, status=status.HTTP_200_OK)
        except Exception as e:
            logging.exception("Failed to update todo")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            try:
                oid = ObjectId(pk)
            except Exception:
                return Response({'error': 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)

            res = db.todos.delete_one({'_id': oid})
            if res.deleted_count == 0:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logging.exception("Failed to delete todo")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
