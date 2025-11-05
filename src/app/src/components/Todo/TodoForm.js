import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../UI/button';

export const TodoForm = ({ onSubmit }) => {
  const [task, setTask] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    
    try {
      await onSubmit(task);
      setTask('');
    } catch (err) {
      // Error handling done in parent
    }
  };

  return (
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
          <Button type="submit" variant="primary">
            Add Todo
          </Button>
        </div>
      </form>
    </div>
  );
};

TodoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};