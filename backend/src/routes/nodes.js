const express = require('express');
        const router = express.Router();
        const { authenticateToken } = require('../middleware/auth');
        const {
          getAllNodes,
          getNodeById,
          createNode,
          updateNode,
          deleteNode
        } = require('../controllers/nodeController');

        router.use(authenticateToken); // Require auth for all routes

        router.get('/', getAllNodes);
        router.get('/:id', getNodeById);
        router.post('/', createNode);
        router.put('/:id', updateNode);
        router.delete('/:id', deleteNode);

        module.exports = router;