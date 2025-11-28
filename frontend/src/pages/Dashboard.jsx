import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import DeleteTaskModal from '../components/DeleteTaskModal';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const [totalTasks, setTotalTasks] = useState(0);
    const [totalPending, setTotalPending] = useState(0);
    const [totalCompleted, setTotalCompleted] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchTasks();
    }, [page]);


    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await tasksAPI.getTasks(page, limit);
            setTasks(response.data.tasks || []);
            setTotalPages(response.data.totalPages);
            setTotalTasks(response.data.total);
            setTotalPending(response.data.totalPending);
            setTotalCompleted(response.data.totalCompleted);
            setError('');
        } catch (err) {
            setError('Failed to load tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const handleTaskCreated = () => {
        setShowCreateModal(false);
        fetchTasks();
    };

    const handleTaskUpdated = () => {
        fetchTasks();
    };


    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;
        setDeleteLoading(true);
        setDeleteError('');

        try {
            await tasksAPI.deleteTask(taskToDelete._id);
            fetchTasks();
            setShowDeleteModal(false);
            setTaskToDelete(null);
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Failed to delete task');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setTaskToDelete(null);
        setDeleteError('');
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'ALL') return true;
        return task.status.toLowerCase() === filter.toLowerCase();
    });

    const stats = {
    total: totalTasks,
    pending: totalPending,
    completed: totalCompleted,
    };

    const statCards = [
        { label: 'Total Tasks', value: stats.total, icon: <Plus size={20} />, color: 'primary', filter: 'ALL' },
        { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: 'pending', filter: 'pending' },
        { label: 'Completed', value: stats.completed, icon: <CheckCircle size={20} />, color: 'completed', filter: 'completed' },
    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">
                            Welcome back, {user?.fullname}! 
                        </h1>
                        <p className="dashboard-subtitle">
                            {isAdmin ? 'Manage tasks created by users' : 'Create and track your tasks'}
                        </p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                        <Plus size={20} /> Create Task
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    {statCards.map((stat, index) => (
                        <div
                            key={index}
                            className={`stat-card card ${filter === stat.filter ? 'active' : ''}`}
                            onClick={() => setFilter(stat.filter)}
                        >
                            <div className={`stat-icon stat-icon-${stat.color}`}>{stat.icon}</div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} /> <span>{error}</span>
                    </div>
                )}

                {/* Task List */}
                <div className="tasks-section">


                    {filteredTasks.length === 0 ? (
                        <div className="empty-state card">
                            <div className="empty-icon"><Plus size={48} /></div>
                            <h3 className="empty-title">No tasks found</h3>
                            <p className="empty-description">
                                {filter === 'ALL' ? 'Create your first task to get started' : `No ${filter.toLowerCase()} tasks`}
                            </p>
                            {filter !== 'ALL' && (
                                <button onClick={() => setFilter('ALL')} className="btn btn-secondary btn-sm">
                                    View All Tasks
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="tasks-grid">
                            {filteredTasks.map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    currentUser={user}
                                    onUpdate={handleTaskUpdated}
                                    onEdit={(task) => setEditingTask(task)}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "25px",
                        marginBottom: "30px",
                        width: "100%"
                    }}
                >
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="btn btn-secondary"
                    >
                        Previous
                    </button>

                    <span>Page {page} of {totalPages}</span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="btn btn-secondary"
                    >
                        Next
                    </button>
                </div>

            </div>

            {showCreateModal && (
                <CreateTaskModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleTaskCreated}
                />
            )}

            {editingTask && (
                <CreateTaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSuccess={() => {
                        setEditingTask(null);
                        fetchTasks();
                    }}
                />
            )}

            {showDeleteModal && (
                <DeleteTaskModal
                    task={taskToDelete}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    loading={deleteLoading}
                    error={deleteError}
                />
            )}
        </div>
    );
};

export default Dashboard;
