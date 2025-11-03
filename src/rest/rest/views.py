from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json, logging, os
from pymongo import MongoClient

mongo_uri = 'mongodb://' + os.environ["MONGO_HOST"] + ':' + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)['test_db']

class TodoListView(APIView):
    def get(self, request):
        # Return all todo items from MongoDB
        try:
            items = []
            for doc in db.todos.find():
                doc['_id'] = str(doc.get('_id'))
                items.append(doc)
            return Response(items, status=status.HTTP_200_OK)
        except Exception as e:
            logging.exception("Failed to fetch todos")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
         
    def post(self, request):
        try:
            payload = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8') or '{}')
            text = payload.get('text') or payload.get('todo') or payload.get('description')
            if not text:
                return Response({'error': 'Missing "text" field'}, status=status.HTTP_400_BAD_REQUEST)
            doc = {'text': text, 'done': False}
            res = db.todos.insert_one(doc)
            doc['_id'] = str(res.inserted_id)
            return Response(doc, status=status.HTTP_201_CREATED)
        except Exception as e:
            logging.exception("Failed to insert todo")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

