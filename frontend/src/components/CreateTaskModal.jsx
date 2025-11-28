import { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { tasksAPI } from '../services/api';
import '../styles/Modal.css';

const CreateTaskModal = ({ task, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'pending',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) {
            setError('Title and Description are required');
            return;
        }

        setLoading(true);
        try {
            if (task?._id) {
                // Edit task
                await tasksAPI.updateTask(task._id, formData);
            } else {
                // Create task 
                console.log('Token:', localStorage.getItem('token'));
                await tasksAPI.createTask(formData);
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
                    {/* <h2>{task?._id ? 'Edit Task' : 'Create Task'}</h2> */}
                    <h2 className="modal-title">Create New Task</h2>
                    <button onClick={onClose}><X size={24} /></button>
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
                            placeholder="Enter title"
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
                            placeholder="Enter task description"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="assignedToId" className="form-label">
                            Task  Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>

                        </select>

                    </div>



                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Send size={16} /> {task?._id ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
