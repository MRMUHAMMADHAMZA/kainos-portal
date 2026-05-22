import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import '../styles/job-roles.css';

const JobRoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/job-roles/${id}`);
        setRole(data.jobRole);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job role');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/job-roles/${id}`);
      navigate('/job-roles', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <div className="container page"><div className="page-loading">Loading…</div></div>;
  if (error) return (
    <div className="container page">
      <div className="alert alert-error" role="alert">{error}</div>
      <Link to="/job-roles" className="btn btn-outline">← Back to job roles</Link>
    </div>
  );
  if (!role) return null;

  return (
    <div className="container page">
      <Link to="/job-roles" className="back-link">← Back to job roles</Link>

      <div className="detail-card">
        <div className="detail-top">
          <span className="badge badge-level">{role.level}</span>
          <span className="badge badge-capability">{role.capability}</span>
        </div>
        <h1>{role.name}</h1>

        <h3>Description</h3>
        <p className="detail-description">{role.description}</p>

        <div className="detail-meta">
          <span>Last updated: {new Date(role.updatedAt).toLocaleDateString()}</span>
        </div>

        {isAdmin && (
          <div className="detail-actions">
            <Link to={`/job-roles/${role._id}/edit`} className="btn btn-primary">Edit</Link>
            <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="modal-card">
            <h2 id="confirm-title">Delete this job role?</h2>
            <p>
              This will permanently delete <strong>{role.name}</strong>. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRoleDetail;