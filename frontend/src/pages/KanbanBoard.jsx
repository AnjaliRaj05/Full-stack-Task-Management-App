import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Flag, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateTaskModal from '../components/CreateTaskModal';
import '../styles/Kanban.css';

const priorityColors = {
  low: '#10b981',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

const columns = [
  { id: 'pending', title: 'Pending', color: '#f59e0b' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'completed', title: 'Completed', color: '#10b981' },
];

const KanbanCard = ({ task, onView }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue =
    task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isOverdue ? 'kanban-overdue' : ''}`}
      onClick={() => onView(task)}
    >
      <div className="kanban-card-drag" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <div className="kanban-card-content">
        <h4>{task.title}</h4>
        <div className="kanban-card-meta">
          <span className="kanban-priority" style={{ color: priorityColors[task.priority] }}>
            <Flag size={10} /> {task.priority}
          </span>
          {task.dueDate && (
            <span className={`kanban-due ${isOverdue ? 'text-overdue' : ''}`}>
              <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {task.labels?.length > 0 && (
          <div className="kanban-labels">
            {task.labels.slice(0, 3).map((l, i) => (
              <span key={i} className="kanban-label">
                {l}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await tasksAPI.getTasks(1, 100, 'ALL');
      setTasks(res.data.tasks || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    // Determine target column: if dropped on a column droppable, use that id;
    // if dropped on another card, use that card's status
    let targetStatus = over.id;
    if (!columns.find((c) => c.id === targetStatus)) {
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) targetStatus = overTask.status;
      else return;
    }

    if (task.status === targetStatus) return;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t)));

    try {
      await tasksAPI.updateTask(taskId, { status: targetStatus });
      toast.success(`Moved to ${targetStatus}`);
    } catch (err) {
      toast.error('Failed to move task');
      fetchTasks(); // revert
    }
  };

  const handleViewTask = (task) => {
    navigate(`/tasks/${task._id}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p>Loading board...</p>
      </div>
    );
  }

  return (
    <div className="kanban-page">
      <div className="kanban-header">
        <div>
          <h1 className="dashboard-title">Kanban Board</h1>
          <p className="dashboard-subtitle">Drag tasks between columns to update status</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={20} /> New Task
        </button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-columns">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-column-header" style={{ borderTopColor: col.color }}>
                  <h3>{col.title}</h3>
                  <span className="kanban-count">{colTasks.length}</span>
                </div>
                <SortableContext
                  items={colTasks.map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                  id={col.id}
                >
                  <div className="kanban-column-body" id={col.id}>
                    {colTasks.map((task) => (
                      <KanbanCard key={task._id} task={task} onView={handleViewTask} />
                    ))}
                    {colTasks.length === 0 && <div className="kanban-empty">No tasks</div>}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="kanban-card kanban-card-dragging">
              <div className="kanban-card-content">
                <h4>{activeTask.title}</h4>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
