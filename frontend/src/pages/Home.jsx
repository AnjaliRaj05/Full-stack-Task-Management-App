import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';
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
                </div>

                {/* Right side floating images */}
                <div className="floating-images-right">
                    <img src={webbImage} alt="Collaboration" className="float-img float-img-4" />
                    <img src={webbImage} alt="Meeting" className="float-img float-img-5" />
                    <img src={webbImage} alt="Innovation" className="float-img float-img-6" />
                </div>
            </section>
        </div>
    );
};

export default Home;