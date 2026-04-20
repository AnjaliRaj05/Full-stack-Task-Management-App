import { useState } from 'react';
import { X, Send, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { tasksAPI } from '../services/api';
import '../styles/Modal.css';

const CreateTaskModal = ({ task, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    labels: task?.labels?.join(', ') || '',
  });
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const toggleSubtask = (index) => {
    setSubtasks(subtasks.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        labels: formData.labels
          ? formData.labels
              .split(',')
              .map((l) => l.trim())
              .filter(Boolean)
          : [],
        subtasks,
      };

      if (task?._id) {
        await tasksAPI.updateTask(task._id, payload);
      } else {
        await tasksAPI.createTask(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task?._id ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe the task..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="labels" className="form-label">
                Labels (comma-separated)
              </label>
              <input
                type="text"
                id="labels"
                name="labels"
                value={formData.labels}
                onChange={handleChange}
                className="form-input"
                placeholder="bug, frontend, urgent"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="form-group">
            <label className="form-label">Subtasks</label>
            <div className="subtask-input-row">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="form-input"
                placeholder="Add a subtask..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
              />
              <button type="button" onClick={addSubtask} className="btn btn-sm btn-secondary">
                <Plus size={16} />
              </button>
            </div>
            {subtasks.length > 0 && (
              <ul className="subtask-list">
                {subtasks.map((st, i) => (
                  <li key={i} className="subtask-item">
                    <label className="subtask-check">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => toggleSubtask(i)}
                      />
                      <span className={st.completed ? 'subtask-done' : ''}>{st.title}</span>
                    </label>
                    <button type="button" onClick={() => removeSubtask(i)} className="btn-icon-sm">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} /> {loading ? 'Saving...' : task?._id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
