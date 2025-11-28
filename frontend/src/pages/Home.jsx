import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle, Users, Shield, Zap } from 'lucide-react';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: <Users size={24} />,
            title: 'Team Collaboration',
            description: 'Create and assign requests to team members seamlessly',
        },
        {
            icon: <Shield size={24} />,
            title: 'Role-Based Access',
            description: 'Manager approval workflows with proper authorization',
        },
        {
            icon: <Zap size={24} />,
            title: 'Real-Time Tracking',
            description: 'Track request status from creation to completion',
        },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge badge-in-progress">
                                <CheckCircle size={14} />
                                Production Ready
                            </span>
                        </div>

                        <h1 className="hero-title">
                            Streamline Your
                            <span className="gradient-text"> Request Management</span>
                        </h1>

                        <p className="hero-description">
                            A powerful, full-stack request management system with role-based
                            workflows, manager approvals, and real-time tracking. Built with
                            modern technologies for maximum efficiency.
                        </p>

                        <div className="hero-actions">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="btn btn-primary btn-lg">
                                    Go to Dashboard
                                    <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started
                                        <ArrowRight size={20} />
                                    </Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="visual-card card">
                            <div className="visual-header">
                                <div className="visual-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className="visual-title">Request Flow</div>
                            </div>
                            <div className="visual-body">
                                <div className="flow-step">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <div className="step-title">Create Request</div>
                                        <div className="step-desc">Employee A assigns to Employee B</div>
                                    </div>
                                </div>
                                <div className="flow-arrow">↓</div>
                                <div className="flow-step">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <div className="step-title">Manager Approval</div>
                                        <div className="step-desc">Manager approves the request</div>
                                    </div>
                                </div>
                                <div className="flow-arrow">↓</div>
                                <div className="flow-step">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <div className="step-title">Start Working</div>
                                        <div className="step-desc">Employee B actions the request</div>
                                    </div>
                                </div>
                                <div className="flow-arrow">↓</div>
                                <div className="flow-step">
                                    <div className="step-number">4</div>
                                    <div className="step-content">
                                        <div className="step-title">Close Request</div>
                                        <div className="step-desc">Employee B completes the task</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Powerful Features</h2>
                        <p className="section-description">
                            Everything you need to manage requests efficiently
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="cta-section">
                    <div className="container">
                        <div className="cta-card card">
                            <h2 className="cta-title">Ready to get started?</h2>
                            <p className="cta-description">
                                Create your account and start managing requests today
                            </p>
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Create Account
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
