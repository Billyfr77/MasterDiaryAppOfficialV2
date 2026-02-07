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
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.route('/search').get(searchClients);

router.route('/')
  .get(getClients)
  .post(createClient);

router.route('/:id')
  .get(getClientById)
  .put(updateClient)
  .delete(deleteClient);

module.exports = router;
