import React, { useState, useEffect } from 'react';
import './App.css';

export function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTask, setEditingTask] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const API_BASE = 'http://localhost:8000/todos/';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
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
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ task }),
      });
      if (res.ok) {
        setTask('');
        await fetchTodos();
      } else {
        console.error('Failed to create todo', await res.text());
      }
    } catch (err) {
      console.error('Failed to create todo', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this todo?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}${id}/`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
      if (res.status === 204 || res.ok) {
        setTodos((prev) => prev.filter((t) => t._id !== id));
      } else {
        console.error('Failed to delete', await res.text());
        await fetchTodos();
      }
    } catch (err) {
      console.error('Delete failed', err);
      await fetchTodos();
    } finally {
      setDeletingId(null);
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
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ task: editingTask }),
      });
      if (res.ok) {
        try {
          const updated = await res.json();
          setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
        } catch {
          await fetchTodos();
        }
        setEditingId(null);
        setEditingTask('');
      } else {
        console.error('Failed to update', await res.text());
      }
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setSavingId(null);
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
                    <button
                      className="icon-btn save-btn"
                      onClick={() => saveEdit(t._id)}
                      disabled={savingId === t._id}
                    >
                      {savingId === t._id ? 'Saving…' : 'Save'}
                    </button>
                    <button className="icon-btn cancel-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="icon-btn edit-btn" title="Edit" onClick={() => startEdit(t._id, t.task)}>
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      title="Delete"
                      onClick={() => handleDelete(t._id)}
                      disabled={deletingId === t._id}
                    >
                      🗑️
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
