import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import './Modal.css';

const DeleteTaskModal = ({ task, onClose, onConfirm, loading, error }) => {
    if (!task) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Delete Task</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    <p>Are you sure you want to delete the task?</p>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={onConfirm} className="btn btn-danger" disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteTaskModal;
