import { useState } from 'react';
import {
  CheckCircle,
  Edit2,
  Trash,
  Calendar,
  AlertCircle,
  Clock,
  Flag,
  Tag,
  Eye,
} from 'lucide-react';
import { tasksAPI } from '../services/api';
import '../styles/TaskCard.css';

const priorityColors = {
  low: '#10b981',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

const TaskCard = ({ task, currentUser, onUpdate, onEdit, onDelete, onView }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = currentUser.role === 'admin';
  const isOwner = currentUser.id === task.createdBy?._id || currentUser.id === task.createdBy;

  const isOverdue =
    task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();

  const handleToggleStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const nextStatus =
        task.status === 'pending'
          ? 'in-progress'
          : task.status === 'in-progress'
            ? 'completed'
            : 'pending';
      await tasksAPI.updateTask(task._id, { status: nextStatus });
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel =
    task.status === 'pending' ? 'Start' : task.status === 'in-progress' ? 'Complete' : 'Reopen';

  const subtasksDone = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtasksTotal = task.subtasks?.length || 0;

  return (
    <div className={`task-card card ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="task-badges">
          <span className={`badge badge-${task.status}`}>
            {task.status === 'in-progress'
              ? 'In Progress'
              : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          <span
            className="badge badge-priority"
            style={{
              color: priorityColors[task.priority],
              borderColor: priorityColors[task.priority] + '50',
              background: priorityColors[task.priority] + '15',
            }}
          >
            <Flag size={10} /> {task.priority}
          </span>
        </div>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="task-labels">
          {task.labels.map((label, i) => (
            <span key={i} className="task-label">
              <Tag size={10} /> {label}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks progress */}
      {subtasksTotal > 0 && (
        <div className="task-subtask-progress">
          <div className="subtask-bar">
            <div
              className="subtask-bar-fill"
              style={{ width: `${(subtasksDone / subtasksTotal) * 100}%` }}
            />
          </div>
          <span className="subtask-count">
            {subtasksDone}/{subtasksTotal} subtasks
          </span>
        </div>
      )}

      <div className="task-meta">
        <span className="task-meta-item">
          <Calendar size={14} />
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        {task.dueDate && (
          <span className={`task-meta-item ${isOverdue ? 'text-overdue' : ''}`}>
            <Clock size={14} />
            Due: {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && ' (overdue)'}
          </span>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="task-actions">
        <button onClick={handleToggleStatus} className="btn btn-sm btn-primary" disabled={loading}>
          <CheckCircle size={16} /> {statusLabel}
        </button>

        {onView && (
          <button onClick={() => onView(task)} className="btn btn-sm btn-secondary">
            <Eye size={16} /> Details
          </button>
        )}

        {isOwner && onEdit && (
          <button onClick={() => onEdit(task)} className="btn btn-sm btn-secondary">
            <Edit2 size={16} />
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => onDelete(task)}
            className="btn btn-sm btn-danger"
            disabled={loading}
          >
            <Trash size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
