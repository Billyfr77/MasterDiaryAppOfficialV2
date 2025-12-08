const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients
} = require('../controllers/clientController');

// Basic auth middleware placeholder (similar to workflowRoutes)
const protect = (req, res, next) => {
    if (!req.user && process.env.NODE_ENV === 'production') {
        // Assume auth handled upstream or by token in real app
        // For dev/prototype speed, we allow
         req.user = { id: 'demo-user' };
    } else if (!req.user) {
        req.user = { id: 'dev-user' };
    }
    next();
};

router.route('/search').get(protect, searchClients);

router.route('/')
  .get(protect, getClients)
  .post(protect, createClient);

router.route('/:id')
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

module.exports = router;
