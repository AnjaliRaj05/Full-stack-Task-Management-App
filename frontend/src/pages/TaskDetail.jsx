import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, commentsAPI } from '../services/api';
import {
  ArrowLeft,
  Send,
  Clock,
  Calendar,
  Flag,
  Tag,
  User,
  MessageSquare,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('comments');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, commentsRes, activityRes] = await Promise.all([
        tasksAPI.getTaskById(id),
        commentsAPI.getComments(id),
        commentsAPI.getActivity(id),
      ]);
      setTask(taskRes.data.task);
      setComments(commentsRes.data.comments);
      setActivity(activityRes.data.activity);
    } catch (err) {
      toast.error('Failed to load task');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await commentsAPI.addComment(id, newComment);
      setNewComment('');
      toast.success('Comment added');
      fetchData();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p>Loading task...</p>
      </div>
    );
  }

  if (!task) return null;

  const isOverdue =
    task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div className="task-detail-page">
      <div className="container">
        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm back-btn">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="task-detail-grid">
          {/* Main content */}
          <div className="task-detail-main card">
            <div className="task-detail-header">
              <h1>{task.title}</h1>
              <div className="task-detail-badges">
                <span className={`badge badge-${task.status}`}>
                  {task.status === 'in-progress' ? 'In Progress' : task.status}
                </span>
                <span className={`badge badge-priority-${task.priority}`}>
                  <Flag size={12} /> {task.priority}
                </span>
              </div>
            </div>

            {task.description && (
              <div className="task-detail-description">
                <p>{task.description}</p>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks?.length > 0 && (
              <div className="task-detail-subtasks">
                <h3>
                  Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                  )
                </h3>
                <ul>
                  {task.subtasks.map((st, i) => (
                    <li key={i} className={st.completed ? 'subtask-completed' : ''}>
                      <input type="checkbox" checked={st.completed} readOnly />
                      <span>{st.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs: Comments / Activity */}
            <div className="task-detail-tabs">
              <button
                className={`tab-btn ${tab === 'comments' ? 'active' : ''}`}
                onClick={() => setTab('comments')}
              >
                <MessageSquare size={16} /> Comments ({comments.length})
              </button>
              <button
                className={`tab-btn ${tab === 'activity' ? 'active' : ''}`}
                onClick={() => setTab('activity')}
              >
                <Activity size={16} /> Activity ({activity.length})
              </button>
            </div>

            {tab === 'comments' && (
              <div className="task-detail-comments">
                <form onSubmit={handleAddComment} className="comment-form">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="form-input"
                    placeholder="Write a comment..."
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={16} />
                  </button>
                </form>
                {comments.length === 0 ? (
                  <p className="no-items">No comments yet</p>
                ) : (
                  <div className="comments-list">
                    {comments.map((c) => (
                      <div key={c._id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">
                            <User size={14} /> {c.userId?.fullname || 'Unknown'}
                          </span>
                          <span className="comment-date">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="comment-content">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'activity' && (
              <div className="task-detail-activity">
                {activity.length === 0 ? (
                  <p className="no-items">No activity yet</p>
                ) : (
                  <div className="activity-list">
                    {activity.map((a) => (
                      <div key={a._id} className="activity-item">
                        <div className="activity-dot" />
                        <div className="activity-content">
                          <span className="activity-user">{a.userId?.fullname || 'Unknown'}</span>
                          <span className="activity-action">{a.details || a.action}</span>
                          <span className="activity-date">
                            {new Date(a.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="task-detail-sidebar">
            <div className="card sidebar-card">
              <h3>Details</h3>
              <div className="sidebar-field">
                <Calendar size={16} />
                <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              {task.dueDate && (
                <div className={`sidebar-field ${isOverdue ? 'text-overdue' : ''}`}>
                  <Clock size={16} />
                  <span>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue ? ' (Overdue!)' : ''}
                  </span>
                </div>
              )}
              <div className="sidebar-field">
                <User size={16} />
                <span>Created by: {task.createdBy?.fullname || 'Unknown'}</span>
              </div>
              {task.assignedTo && (
                <div className="sidebar-field">
                  <User size={16} />
                  <span>Assigned to: {task.assignedTo?.fullname}</span>
                </div>
              )}
              {task.labels?.length > 0 && (
                <div className="sidebar-labels">
                  <Tag size={16} />
                  <div className="label-tags">
                    {task.labels.map((l, i) => (
                      <span key={i} className="task-label">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
