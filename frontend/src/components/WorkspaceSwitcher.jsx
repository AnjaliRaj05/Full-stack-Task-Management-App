import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronDown, Plus, Check } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import '../styles/WorkspaceSwitcher.css';

const WorkspaceSwitcher = () => {
  const { workspaces, currentWorkspace, currentWorkspaceId, switchWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!currentWorkspace && workspaces.length === 0) return null;

  return (
    <div className="workspace-switcher" ref={menuRef}>
      <button
        type="button"
        className="workspace-switcher-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Briefcase size={16} />
        <span className="workspace-switcher-name">
          {currentWorkspace?.name || 'Select workspace'}
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="workspace-switcher-menu" role="menu">
          <div className="workspace-switcher-section-title">Your workspaces</div>
          <ul>
            {workspaces.map((ws) => {
              const active = ws._id === currentWorkspaceId;
              return (
                <li key={ws._id}>
                  <button
                    type="button"
                    className={`workspace-switcher-item ${active ? 'active' : ''}`}
                    onClick={() => {
                      switchWorkspace(ws._id);
                      setOpen(false);
                    }}
                  >
                    <span className="workspace-switcher-item-name">{ws.name}</span>
                    {active && <Check size={14} />}
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            to="/workspaces"
            className="workspace-switcher-manage"
            onClick={() => setOpen(false)}
          >
            <Plus size={14} />
            Manage workspaces
          </Link>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
