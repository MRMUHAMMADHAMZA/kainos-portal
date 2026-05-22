const db = require('../utils/jsonDb');

const LEVELS = [
  'Apprentice', 'Trainee', 'Associate', 'Senior Associate', 'Consultant',
  'Senior Consultant', 'Manager', 'Senior Manager', 'Principal', 'Director',
];

const CAPABILITIES = [
  'Engineering', 'Data', 'Cyber Security', 'Workday', 'Artificial Intelligence',
  'Experience Design', 'Delivery', 'People', 'Sales', 'Operations',
];

// GET /api/job-roles/meta
exports.getMeta = (req, res) => {
  res.json({ success: true, levels: LEVELS, capabilities: CAPABILITIES });
};

// GET /api/job-roles
exports.getJobRoles = (req, res) => {
  try {
    const { search, level, capability } = req.query;
    let roles = db.findAll('jobRoles');

    if (level)      roles = roles.filter((r) => r.level === level);
    if (capability) roles = roles.filter((r) => r.capability === capability);
    if (search) {
      const s = search.toLowerCase();
      roles = roles.filter((r) =>
        r.name.toLowerCase().includes(s) || r.description.toLowerCase().includes(s)
      );
    }

    roles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: roles.length, jobRoles: roles });
  } catch (err) {
    console.error('Get job roles error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch job roles' });
  }
};

// GET /api/job-roles/:id
exports.getJobRoleById = (req, res) => {
  try {
    const role = db.findById('jobRoles', req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Job role not found' });
    res.json({ success: true, jobRole: role });
  } catch (err) {
    console.error('Get job role error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch job role' });
  }
};

// POST /api/job-roles
exports.createJobRole = (req, res) => {
  try {
    const { name, level, capability, description } = req.body;
    const duplicate = db.findOne('jobRoles', (r) =>
      r.name.toLowerCase() === name.trim().toLowerCase() &&
      r.level === level &&
      r.capability === capability
    );
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A job role with this name, level and capability already exists',
        errors: { name: 'Duplicate job role' },
      });
    }
    const role = db.create('jobRoles', { name: name.trim(), level, capability, description: description.trim() });
    res.status(201).json({ success: true, message: 'Job role created successfully', jobRole: role });
  } catch (err) {
    console.error('Create job role error:', err);
    res.status(500).json({ success: false, message: 'Failed to create job role' });
  }
};

// PUT /api/job-roles/:id
exports.updateJobRole = (req, res) => {
  try {
    const { name, level, capability, description } = req.body;
    const existing = db.findById('jobRoles', req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Job role not found' });

    const duplicate = db.findOne('jobRoles', (r) =>
      r._id !== req.params.id &&
      r.name.toLowerCase() === name.trim().toLowerCase() &&
      r.level === level &&
      r.capability === capability
    );
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Another job role with this name, level and capability already exists',
      });
    }

    const role = db.updateById('jobRoles', req.params.id, {
      name: name.trim(), level, capability, description: description.trim(),
    });
    res.json({ success: true, message: 'Job role updated successfully', jobRole: role });
  } catch (err) {
    console.error('Update job role error:', err);
    res.status(500).json({ success: false, message: 'Failed to update job role' });
  }
};

// DELETE /api/job-roles/:id
exports.deleteJobRole = (req, res) => {
  try {
    const role = db.deleteById('jobRoles', req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Job role not found' });
    res.json({ success: true, message: 'Job role deleted successfully' });
  } catch (err) {
    console.error('Delete job role error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete job role' });
  }
};
