import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Kanban,
  Users,
  Zap,
  Layers,
  Command,
  Activity as ActivityIcon,
  Briefcase,
  Plus,
  TrendingUp,
  Check,
} from 'lucide-react';
import HeroMockup from '../components/HeroMockup';
import useReveal from '../hooks/useReveal';
import '../styles/Home.css';

const Reveal = ({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) => {
  const { ref, revealed } = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-revealed={revealed ? 'true' : undefined}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const features = [
  {
    icon: <Kanban size={22} />,
    accent: 'violet',
    title: 'Three views of the same work',
    description:
      'Dashboard for a quick scan, Kanban for drag-and-drop flow, detail view for subtasks, comments, and the full activity log.',
  },
  {
    icon: <Users size={22} />,
    accent: 'cyan',
    title: 'Workspaces for every team',
    description:
      'Spin up a workspace per team or project. Tasks stay fully isolated, roles control who can edit, and personal space is always free.',
  },
  {
    icon: <Zap size={22} />,
    accent: 'amber',
    title: 'Built for keyboard-first flow',
    description: (
      <>
        <kbd className="inline-kbd">⌘K</kbd> to search. Status badges, priority, due dates, labels,
        and an activity log on every task — less clicking, more shipping.
      </>
    ),
  },
];

const highlights = [
  { icon: <Layers size={16} />, label: 'Unlimited tasks' },
  { icon: <Users size={16} />, label: 'Unlimited workspaces' },
  { icon: <ActivityIcon size={16} />, label: 'Full activity log' },
  { icon: <Command size={16} />, label: '⌘K quick search' },
];

const steps = [
  {
    n: 1,
    icon: <Briefcase size={20} />,
    title: 'Create a workspace',
    description: 'One workspace for personal work, another for your team. No mixing.',
  },
  {
    n: 2,
    icon: <Plus size={20} />,
    title: 'Capture your work',
    description: 'Add tasks with priority, labels, subtasks, and a real due date.',
  },
  {
    n: 3,
    icon: <TrendingUp size={20} />,
    title: 'Ship and track',
    description: 'Drag between columns on the Kanban board. Watch progress land.',
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-backdrop" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>

        <div className="container hero-grid-layout">
          <div className="hero-content">
            <Reveal as="span" className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Taskora — task management, without the noise
            </Reveal>

            <Reveal as="h1" className="hero-title" delay={80}>
              Organize work. <br />
              <span className="gradient-text">Track progress. Ship faster.</span>
            </Reveal>

            <Reveal as="p" className="hero-description" delay={160}>
              A focused task manager with workspaces, Kanban, subtasks, and an activity log on every
              task. Keyboard-friendly, zero clutter, free to start.
            </Reveal>

            <Reveal className="hero-actions" delay={240}>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Start free
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Sign in
                  </Link>
                </>
              )}
            </Reveal>

            <Reveal className="hero-highlights" delay={320}>
              {highlights.map((h) => (
                <span key={h.label} className="hero-highlight">
                  {h.icon}
                  {h.label}
                </span>
              ))}
            </Reveal>
          </div>

          <Reveal className="hero-mockup-wrap" delay={200}>
            <HeroMockup />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <Reveal className="section-header">
            <h2 className="section-title">Everything you need. Nothing you don't.</h2>
            <p className="section-description">
              Built from the features real teams actually use — no bloat, no learning curve.
            </p>
          </Reveal>

          <div className="features-grid">
            {features.map((f, i) => (
              <Reveal key={f.title} className="feature-card" delay={i * 100}>
                <div className={`feature-icon feature-icon--${f.accent}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section">
        <div className="container">
          <Reveal className="section-header">
            <h2 className="section-title">From zero to shipping in three steps</h2>
            <p className="section-description">No onboarding video. No setup wizard.</p>
          </Reveal>

          <div className="steps-grid">
            {steps.map((s, i) => (
              <Reveal key={s.n} className="step-card" delay={i * 120}>
                <div className="step-number">0{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-description">{s.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="cta-section">
        <div className="container">
          <Reveal className="cta-card">
            <h2 className="cta-title">Start free. Upgrade when your team grows.</h2>
            <p className="cta-description">
              Personal workspace is free forever. No credit card. No seat limits for solo work.
            </p>

            <div className="cta-points">
              <span className="cta-point">
                <Check size={14} /> Free forever for personal use
              </span>
              <span className="cta-point">
                <Check size={14} /> No credit card required
              </span>
              <span className="cta-point">
                <Check size={14} /> Cancel team plan anytime
              </span>
            </div>

            <div className="cta-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-light btn-lg">
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-light btn-lg">
                    Create your workspace
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
