import { useState, useCallback } from 'react';
import { todoApi } from '../services/api';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApi.list();
      setTodos(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (task) => {
    try {
      setError(null);
      await todoApi.create(task);
      await fetchTodos();
    } catch (err) {
      setError(err.message);
      console.error('Failed to create todo:', err);
    }
  }, [fetchTodos]);

  const updateTodo = useCallback(async (id, task) => {
    try {
      setError(null);
      const result = await todoApi.update(id, task);
      const updated = result.data || result
      setTodos(prev => prev.map(t => t._id === id ? updated : t));
    } catch (err) {
      setError(err.message);
      console.error('Failed to update todo:', err);
    }
  }, []);

  const deleteTodo = useCallback(async (id) => {
    try {
      setError(null);
      await todoApi.delete(id);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete todo:', err);
      await fetchTodos();
    }
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo
  };
};