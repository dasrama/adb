import React, { useEffect } from 'react';
import { TodoList } from './components/Todo/TodoList';
import { TodoForm } from './components/Todo/TodoForm';
import { useTodos } from './hooks/useTodos';
import './App.css';

export function App() {
  const {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo
  } = useTodos();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  if (loading) return <div className="App">Loading...</div>;
  if (error) return <div className="App">Error: {error}</div>;

  return (
    <div className="App">
      <TodoList
        todos={todos}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
      />
      <TodoForm onSubmit={addTodo} />
    </div>
  );
}

export default App;