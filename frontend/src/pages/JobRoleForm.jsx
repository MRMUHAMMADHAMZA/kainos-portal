import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { validateJobRoleName, validateDescription } from '../utils/validators';
import '../styles/job-roles.css';

const JobRoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', level: '', capability: '', description: '' });
  const [meta, setMeta] = useState({ levels: [], capabilities: [] });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/job-roles/meta');
        setMeta({ levels: data.levels || [], capabilities: data.capabilities || [] });
        if (isEdit) {
          const { data: roleData } = await api.get(`/job-roles/${id}`);
          setForm({
            name: roleData.jobRole.name,
            level: roleData.jobRole.level,
            capability: roleData.jobRole.capability,
            description: roleData.jobRole.description,
          });
        }
      } catch (err) {
        setSubmitError(err.response?.data?.message || 'Failed to load form');
      } finally {
        setInitializing(false);
      }
    })();
  }, [id, isEdit]);

  const validate = (f = form) => {
    const next = {};
    const name = validateJobRoleName(f.name);
    if (name) next.name = name;
    if (!f.level) next.level = 'Please select a level';
    if (!f.capability) next.capability = 'Please select a capability';
    const desc = validateDescription(f.description);
    if (desc) next.description = desc;
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const handleBlur = (e) => {
    const next = validate({ ...form, [e.target.name]: e.target.value });
    if (next[e.target.name]) {
      setErrors((errs) => ({ ...errs, [e.target.name]: next[e.target.name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const next = validate();
    if (Object.keys(next).length) { setErrors(next); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/job-roles/${id}`, form);
        navigate(`/job-roles/${id}`, { replace: true });
      } else {
        const { data } = await api.post('/job-roles', form);
        navigate(`/job-roles/${data.jobRole._id}`, { replace: true });
      }
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) setErrors(res.errors);
      else setSubmitError(res?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return <div className="container page"><div className="page-loading">Loading…</div></div>;

  return (
    <div className="container page">
      <Link to={isEdit ? `/job-roles/${id}` : '/job-roles'} className="back-link">← Back</Link>

      <div className="form-card">
        <h1>{isEdit ? 'Edit job role' : 'Add a new job role'}</h1>
        <p className="page-sub">All fields are required.</p>

        {submitError && <div className="alert alert-error" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Role name</label>
            <input
              id="name" name="name" type="text" maxLength={100}
              value={form.name} onChange={handleChange} onBlur={handleBlur}
              placeholder="e.g. Senior Software Engineer"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
            />
            <span className="error-text" id="name-error" role="alert">{errors.name || ''}</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level" name="level"
                value={form.level} onChange={handleChange} onBlur={handleBlur}
                className={`form-control ${errors.level ? 'is-invalid' : ''}`}
                aria-invalid={!!errors.level}
                aria-describedby="level-error"
              >
                <option value="">Select a level…</option>
                {meta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <span className="error-text" id="level-error" role="alert">{errors.level || ''}</span>
            </div>

            <div className="form-group">
              <label htmlFor="capability">Capability</label>
              <select
                id="capability" name="capability"
                value={form.capability} onChange={handleChange} onBlur={handleBlur}
                className={`form-control ${errors.capability ? 'is-invalid' : ''}`}
                aria-invalid={!!errors.capability}
                aria-describedby="capability-error"
              >
                <option value="">Select a capability…</option>
                {meta.capabilities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="error-text" id="capability-error" role="alert">{errors.capability || ''}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description" name="description" rows={6} maxLength={2000}
              value={form.description} onChange={handleChange} onBlur={handleBlur}
              placeholder="Responsibilities, expectations, key skills…"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              aria-invalid={!!errors.description}
              aria-describedby="description-error"
            />
            <div className="char-count">
              <span style={{ color: form.description.length > 1900 ? 'var(--error)' : undefined }}>
                {form.description.length}
              </span>
              {' / 2000'}
            </div>
            <span className="error-text" id="description-error" role="alert">{errors.description || ''}</span>
          </div>

          <div className="form-actions">
            <Link to={isEdit ? `/job-roles/${id}` : '/job-roles'} className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : (isEdit ? 'Save changes' : 'Create job role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobRoleForm;
