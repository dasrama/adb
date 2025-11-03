import React, { useState, useEffect } from 'react';
import './App.css';

export function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

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
    if (!text.trim()) return;
    try {
      const res = await fetch('http://localhost:8080/todos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setText('');
        fetchTodos();
      } else {
        console.error('Failed to create todo', await res.text());
      }
    } catch (err) {
      console.error('Failed to create todo', err);
    }
  };

  return (
    <div className="App">
      <div>
        <h1>List of TODOs</h1>
        <ul>
          {todos.map((t) => (
            <li key={t._id}>{t.text}</li>
          ))}
        </ul>
      </div>
      <div>
        <h1>Create a ToDo</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="todo">ToDo: </label>
            <input id="todo" type="text" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div style={{ marginTop: '5px' }}>
            <button type="submit">Add ToDo!</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
