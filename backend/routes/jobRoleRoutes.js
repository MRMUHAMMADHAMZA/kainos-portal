const express = require('express');
const {
  getJobRoles, getJobRoleById, createJobRole,
  updateJobRole, deleteJobRole, getMeta,
} = require('../controllers/jobRoleController');
const { protect, adminOnly } = require('../middleware/auth');
const { jobRoleValidator } = require('../middleware/validate');

const router = express.Router();

router.get('/meta', protect, getMeta);
router.get('/', protect, getJobRoles);
router.get('/:id', protect, getJobRoleById);
router.post('/', protect, adminOnly, jobRoleValidator, createJobRole);
router.put('/:id', protect, adminOnly, jobRoleValidator, updateJobRole);
router.delete('/:id', protect, adminOnly, deleteJobRole);

module.exports = router;