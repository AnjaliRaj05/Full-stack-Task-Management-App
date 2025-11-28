import { useState } from 'react';
import { CheckCircle, Edit2, Trash, Calendar, AlertCircle } from 'lucide-react';
import { tasksAPI } from '../services/api';
import '../styles/TaskCard.css';

const TaskCard = ({ task, currentUser, onUpdate, onEdit, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isAdmin = currentUser.role === 'admin';
    const isOwner =
    currentUser.id === task.createdBy?._id ||
    currentUser.id === task.createdBy;

    const handleToggleStatus = async () => {
        setLoading(true);
        setError('');
        try {
            await tasksAPI.updateTask(task._id, {
                status: task.status.toLowerCase() === 'pending' ? 'completed' : 'pending'
            });
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update task');
        } finally {
            setLoading(false);
        }
    };

   
    return (
        <div className="task-card card">
            <div
                className="task-header"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
                <h3>{task.title}</h3>

                <span
                    className={`badge ${task.status.toLowerCase() === "pending" ? "badge-pending" : "badge-completed"
                        }`}
                    style={{ marginLeft: "auto" }}
                >
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
            </div>


            <p>{task.description}</p>

            <div className="task-meta">
                <Calendar size={16} />
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className="task-actions">
                <button
                    onClick={handleToggleStatus}
                    className="btn btn-sm btn-primary"
                    disabled={loading}  style={{ marginRight: '8px' }}
                >
                    <CheckCircle size={16} />{' '}
                    {task.status.toLowerCase() === 'pending' ? 'Mark Completed' : 'Mark Pending'}
                </button>

                {isAdmin && (
                    <button
                         onClick={() => onDelete(task)}
                        className="btn btn-sm btn-danger"
                        disabled={loading} style={{ marginRight: '8px' }}
                    >
                        <Trash size={16} /> 
                    </button>
                )}

                {( isOwner) && onEdit && (
                    <button
                        onClick={() => onEdit(task)}
                        className="btn btn-sm btn-secondary"
                    >
                        <Edit2 size={16} /> 
                    </button>
                )}

            </div>
        </div>
    );
};

export default TaskCard;
