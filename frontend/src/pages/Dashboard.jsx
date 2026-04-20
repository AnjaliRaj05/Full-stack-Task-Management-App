import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import DeleteTaskModal from '../components/DeleteTaskModal';
import EmptyState from '../components/EmptyState';
import { Plus, CheckCircle, Clock, Loader, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalInProgress, setTotalInProgress] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const searchRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
  }, [page, filter, search]);

  // ⌘K / Ctrl+K focuses the search input
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks(page, limit, filter, search);
      const data = response.data;
      setTasks(data.tasks || []);
      setTotalPages(data.totalPages);
      setTotalPending(data.totalPending || 0);
      setTotalInProgress(data.totalInProgress || 0);
      setTotalCompleted(data.totalCompleted || 0);
      setTotalTasks(
        (data.totalPending || 0) + (data.totalInProgress || 0) + (data.totalCompleted || 0)
      );
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTaskCreated = () => {
    setShowCreateModal(false);
    toast.success('Task created!');
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    toast.success('Task updated');
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
      toast.success('Task deleted');
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

  const handleViewTask = (task) => {
    navigate(`/tasks/${task._id}`);
  };

  const statCards = [
    {
      label: 'Total',
      value: totalTasks,
      icon: <Plus size={20} />,
      color: 'primary',
      filter: 'ALL',
    },
    {
      label: 'Pending',
      value: totalPending,
      icon: <Clock size={20} />,
      color: 'pending',
      filter: 'pending',
    },
    {
      label: 'In Progress',
      value: totalInProgress,
      icon: <Loader size={20} />,
      color: 'in-progress',
      filter: 'in-progress',
    },
    {
      label: 'Completed',
      value: totalCompleted,
      icon: <CheckCircle size={20} />,
      color: 'completed',
      filter: 'completed',
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, {user?.fullname}!</h1>
            <p className="dashboard-subtitle">
              {isAdmin ? 'Manage tasks created by users' : 'Create and track your tasks'}
            </p>
          </div>
          <div className="dashboard-actions">
            <button onClick={() => navigate('/kanban')} className="btn btn-secondary">
              Kanban Board
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              <Plus size={20} /> Create Task
            </button>
          </div>
        </div>

        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`stat-card card ${filter === stat.filter ? 'active' : ''}`}
              onClick={() => handleFilterChange(stat.filter)}
            >
              <div className={`stat-icon stat-icon-${stat.color}`}>{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="search-bar">
          <Search size={18} />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={handleSearchChange}
            className="search-input"
            placeholder="Search tasks by title..."
          />
          <kbd className="search-kbd" aria-hidden="true">
            <span>⌘</span>K
          </kbd>
        </div>

        {/* Tasks list */}
        <div className="tasks-section">
          {loading ? (
            <div className="dashboard-loading">
              <div className="spinner" style={{ width: '30px', height: '30px' }}></div>
            </div>
          ) : tasks.length === 0 ? (
            filter === 'ALL' ? (
              <EmptyState
                icon={<Sparkles size={28} />}
                title="Let's get your first task in"
                description="Tasks help you organize work, track progress, and collaborate with your team."
                checklist={[
                  { label: 'Create your first task', done: false },
                  { label: 'Try the Kanban board view', done: false },
                  { label: 'Invite a teammate to your workspace', done: false },
                ]}
                action={
                  <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                    <Plus size={18} /> Create task
                  </button>
                }
              />
            ) : (
              <EmptyState
                icon={<Search size={26} />}
                title={`No ${filter.replace('-', ' ')} tasks`}
                description="Try clearing the filter or creating a new task."
                action={
                  <button onClick={() => setFilter('ALL')} className="btn btn-secondary btn-sm">
                    View all tasks
                  </button>
                }
              />
            )
          ) : (
            <div className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  currentUser={user}
                  onUpdate={handleTaskUpdated}
                  onEdit={(task) => setEditingTask(task)}
                  onDelete={handleDeleteClick}
                  onView={handleViewTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} onSuccess={handleTaskCreated} />
      )}

      {editingTask && (
        <CreateTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            toast.success('Task updated');
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
