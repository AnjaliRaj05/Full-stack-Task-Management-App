import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle, Zap, Users, BarChart } from 'lucide-react';
import '../styles/Home.css';
import webbImage from '../assets/webb.webp';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                {/* Left side floating images */}
                <div className="floating-images-left">
                    <img src={webbImage} alt="Team collaboration" className="float-img float-img-1" />
                    <img src={webbImage} alt="Leadership" className="float-img float-img-2" />
                    <img src={webbImage} alt="Teamwork" className="float-img float-img-3" />
                </div>

                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Organize Track
                            <span className="gradient-text"> Get Things Done!</span>
                        </h1>

                        <p className="hero-description">
                            Break down your workload, track progress in real-time, and stay focused on
                            what matters most. A beautifully crafted task management experience built
                            for everyday productivity.
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
                </div>

                {/* Right side floating images */}
                <div className="floating-images-right">
                    <img src={webbImage} alt="Collaboration" className="float-img float-img-4" />
                    <img src={webbImage} alt="Meeting" className="float-img float-img-5" />
                    <img src={webbImage} alt="Innovation" className="float-img float-img-6" />
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Everything You Need to Stay Productive</h2>
                        <p className="section-description">
                            Powerful features designed to help you manage tasks effortlessly
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <CheckCircle size={32} />
                            </div>
                            <h3>Task Management</h3>
                            <p>
                                Create, organize, and prioritize tasks with ease. Set due dates,
                                add descriptions, and track your progress in real-time.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap size={32} />
                            </div>
                            <h3>Lightning Fast</h3>
                            <p>
                                Experience blazing-fast performance with instant updates and
                                smooth interactions. No lag, no delays.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <BarChart size={32} />
                            </div>
                            <h3>Progress Tracking</h3>
                            <p>
                                Visualize your productivity with intuitive dashboards and
                                analytics. See what's done and what's next.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Boost Your Productivity?</h2>
                        <p className="cta-description">
                            Join thousands of teams already using TaskFlow to streamline their
                            workflow and achieve more every day.
                        </p>

                        <div className="cta-actions">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="btn btn-light btn-lg">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-light btn-lg">
                                        Start Free Trial
                                    </Link>
                                    <Link to="/login" className="btn btn-outline btn-lg">
                                        Schedule Demo
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;