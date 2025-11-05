import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../UI/button';

export const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState(todo.task);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editTask.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(todo._id, editTask);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTask(todo.task);
  };

  return (
    <li className="todo-item">
      <div className="todo-item-content">
        {isEditing ? (
          <input
            className="edit-input"
            value={editTask}
            onChange={(e) => setEditTask(e.target.value)}
          />
        ) : (
          <span>{todo.task}</span>
        )}
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <>
            <Button
              variant="save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              variant="cancel"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </>
        )  : (
          <>
            <Button
              variant="edit"
              title="Edit"
              onClick={() => setIsEditing(true)}
            >
              ✏️
            </Button>
            <Button
              variant="delete"
              title="Delete"
              onClick={() => onDelete(todo._id)}
            >
              🗑️
            </Button>
          </>
        )}
      </div>
    </li>
  );
};

TodoItem.propTypes = {
  todo: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    task: PropTypes.string.isRequired
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};