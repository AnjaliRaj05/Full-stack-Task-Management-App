import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Check, Briefcase } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import '../styles/Workspaces.css';

const Workspaces = () => {
  const { workspaces, currentWorkspaceId, switchWorkspace, createWorkspace, loading } =
    useWorkspace();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await createWorkspace(name);
      setNewName('');
      toast.success(`Workspace "${name}" created`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="workspaces-page container">
      <header className="workspaces-header">
        <h1>Workspaces</h1>
        <p>Switch between workspaces or create a new one for a different team or project.</p>
      </header>

      <form className="workspaces-create" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New workspace name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={80}
          disabled={creating}
        />
        <button type="submit" className="btn btn-primary" disabled={creating || !newName.trim()}>
          <Plus size={16} />
          Create
        </button>
      </form>

      {loading ? (
        <p className="workspaces-empty">Loading workspaces…</p>
      ) : workspaces.length === 0 ? (
        <p className="workspaces-empty">No workspaces yet.</p>
      ) : (
        <ul className="workspaces-list">
          {workspaces.map((ws) => {
            const active = ws._id === currentWorkspaceId;
            return (
              <li key={ws._id} className={`workspace-item ${active ? 'active' : ''}`}>
                <div className="workspace-icon">
                  <Briefcase size={18} />
                </div>
                <div className="workspace-meta">
                  <div className="workspace-name">{ws.name}</div>
                  <div className="workspace-sub">
                    <span className="role-badge">{ws.role}</span>
                    <span className="plan-badge">{ws.plan}</span>
                  </div>
                </div>
                <div className="workspace-actions">
                  {active ? (
                    <span className="active-indicator">
                      <Check size={16} /> Active
                    </span>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => switchWorkspace(ws._id)}
                    >
                      Switch
                    </button>
                  )}
                  <Link to="/dashboard" className="btn btn-ghost btn-sm">
                    Open
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Workspaces;
