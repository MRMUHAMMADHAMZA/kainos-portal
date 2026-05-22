import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import '../styles/home.css';

const Home = () => {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <h1>Welcome to the Kainos Portal</h1>
        <p>
          Your single source of truth for job roles, employees, and recruitment.
          Discover open positions, manage roles, and keep information up to date.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-outline">Login</Link>
            </>
          )}
        </div>
      </section>

      <section className="features">
        <h2>What you can do</h2>
        <p className="features-subtitle">Everything you need to manage roles, employees, and recruitment in one place.</p>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Browse job roles</h3>
            <p>Search and view every role at Kainos with capability, banding, and full descriptions.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3>Apply with one click</h3>
            <p>Register, log in and apply for roles directly through the portal.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3>Admin tools</h3>
            <p>Recruitment admins can add, edit and remove roles and employees in one place.</p>
          </article>
        </div>
      </section>
    </>
  );
};

export default Home;
