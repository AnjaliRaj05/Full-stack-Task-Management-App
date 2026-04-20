import { CheckSquare, Circle, Clock, Flag } from 'lucide-react';
import '../styles/HeroMockup.css';

/**
 * A CSS-only stylized preview of the product — shown in the hero.
 * No real data; every task here is static.
 */
const HeroMockup = () => {
  return (
    <div className="hero-mockup" aria-hidden="true">
      <div className="hero-mockup-glow" />

      <div className="hero-mockup-window">
        <div className="hero-mockup-topbar">
          <span className="hero-mockup-dot dot-red" />
          <span className="hero-mockup-dot dot-yellow" />
          <span className="hero-mockup-dot dot-green" />
          <div className="hero-mockup-url">taskora.app / dashboard</div>
        </div>

        <div className="hero-mockup-body">
          <aside className="hero-mockup-sidebar">
            <div className="hero-mockup-workspace">
              <div className="hero-mockup-workspace-icon">T</div>
              <div className="hero-mockup-workspace-name">Acme Workspace</div>
            </div>
            <div className="hero-mockup-nav">
              <div className="hero-mockup-nav-item active">
                <CheckSquare size={14} /> Dashboard
              </div>
              <div className="hero-mockup-nav-item">
                <Circle size={14} /> Kanban
              </div>
              <div className="hero-mockup-nav-item">
                <Clock size={14} /> Activity
              </div>
            </div>
          </aside>

          <main className="hero-mockup-main">
            <div className="hero-mockup-stats">
              <div className="hero-mockup-stat">
                <span className="hero-mockup-stat-value">24</span>
                <span className="hero-mockup-stat-label">Pending</span>
              </div>
              <div className="hero-mockup-stat hero-mockup-stat-progress">
                <span className="hero-mockup-stat-value">8</span>
                <span className="hero-mockup-stat-label">In Progress</span>
              </div>
              <div className="hero-mockup-stat hero-mockup-stat-done">
                <span className="hero-mockup-stat-value">42</span>
                <span className="hero-mockup-stat-label">Completed</span>
              </div>
            </div>

            <div className="hero-mockup-tasks">
              <div className="hero-mockup-task">
                <span className="hero-mockup-task-status status-doing" />
                <span className="hero-mockup-task-title">
                  Ship onboarding flow for new workspaces
                </span>
                <span className="hero-mockup-badge badge-high">
                  <Flag size={10} /> High
                </span>
              </div>
              <div className="hero-mockup-task">
                <span className="hero-mockup-task-status status-todo" />
                <span className="hero-mockup-task-title">Review Q2 roadmap with design team</span>
                <span className="hero-mockup-badge badge-med">Med</span>
              </div>
              <div className="hero-mockup-task">
                <span className="hero-mockup-task-status status-done" />
                <span className="hero-mockup-task-title hero-mockup-task-title--done">
                  Fix Kanban drag-drop on mobile
                </span>
                <span className="hero-mockup-badge badge-low">Low</span>
              </div>
              <div className="hero-mockup-task">
                <span className="hero-mockup-task-status status-doing" />
                <span className="hero-mockup-task-title">
                  Invite Sarah and Priya to Marketing workspace
                </span>
                <span className="hero-mockup-badge badge-med">Med</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HeroMockup;
