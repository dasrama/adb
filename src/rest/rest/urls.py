from django.urls import path
from .views import TodoListView

urlpatterns = [
    path('todos/', TodoListView.as_view(), name='todo-list'),
    path('todos/<str:pk>/', TodoListView.as_view(), name='todo-detail'),  # Add this line
]