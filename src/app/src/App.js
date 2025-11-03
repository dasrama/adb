import React, { useState, useEffect } from 'react';
import './App.css';

export function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTask, setEditingTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('http://localhost:8080/todos/');
      const data = await res.json();
      setTodos(data || []);
    } catch (err) {
      console.error('Failed to fetch todos', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    try {
      const res = await fetch('http://localhost:8080/todos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      });
      if (res.ok) {
        setTask('');
        fetchTodos();
      } else {
        console.error('Failed to create todo', await res.text());
      }
    } catch (err) {
      console.error('Failed to create todo', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this todo?')) return;
    try {
      const res = await fetch(`http://localhost:8080/todos/${id}/`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        fetchTodos();
      } else {
        console.error('Failed to delete', await res.text());
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const startEdit = (id, currentTask) => {
    setEditingId(id);
    setEditingTask(currentTask);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTask('');
  };

  const saveEdit = async (id) => {
    if (!editingTask.trim()) return;
    try {
      const res = await fetch(`http://localhost:8080/todos/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: editingTask }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditingTask('');
        fetchTodos();
      } else {
        console.error('Failed to update', await res.text());
      }
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  return (
    <div className="App">
      <div className="todo-section">
        <h1>📝 My TODOs</h1>
        <ul>
          {todos.map((t) => (
            <li key={t._id} className="todo-item">
              <div className="todo-item-content">
                {editingId === t._id ? (
                  <input
                    className="edit-input"
                    value={editingTask}
                    onChange={(e) => setEditingTask(e.target.value)}
                  />
                ) : (
                  <span>{t.task}</span>
                )}
              </div>

              <div className="todo-actions">
                {editingId === t._id ? (
                  <>
                    <button className="icon-btn save-btn" onClick={() => saveEdit(t._id)}>Save</button>
                    <button className="icon-btn cancel-btn" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      className="icon-btn edit-btn"
                      title="Edit"
                      onClick={() => startEdit(t._id, t.task)}
                    >
                      {/* pencil SVG */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#2b8aee"/>
                        <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#1c6fb8"/>
                      </svg>
                    </button>

                    <button
                      className="icon-btn delete-btn"
                      title="Delete"
                      onClick={() => handleDelete(t._id)}
                    >
                      {/* trash SVG */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z" fill="#ff6b6b"/>
                        <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#ff4d4f"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="todo-section">
        <h1>➕ Add New TODO</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              id="todo"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit">Add Todo</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
