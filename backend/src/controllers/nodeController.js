const { Node } = require('../models');
        const Joi = require('joi');

        const nodeSchema = Joi.object({
          name: Joi.string().min(1).required(),
          category: Joi.string().min(1).required(),
          unit: Joi.string().min(1).required(),
          pricePerUnit: Joi.number().positive().required()
        });

        const getAllNodes = async (req, res) => {
          try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const { count, rows } = await Node.findAndCountAll({
              where: { userId: req.user.id },
              limit,
              offset
            });

            res.json({
              data: rows,
              total: count,
              page,
              limit,
              totalPages: Math.ceil(count / limit)
            });
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        };

        const getNodeById = async (req, res) => {
          try {
            const node = await Node.findOne({
              where: { id: req.params.id, userId: req.user.id }
            });
            if (node) {
              res.json(node);
            } else {
              res.status(404).json({ error: 'Node not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        };

        const createNode = async (req, res) => {
          try {
            const { error } = nodeSchema.validate(req.body);
            if (error) {
              return res.status(400).json({ error: error.details[0].message });
            }
            const node = await Node.create({
              ...req.body,
              userId: req.user.id
            });
            res.status(201).json(node);
          } catch (error) {
            res.status(400).json({ error: error.message });
          }
        };

        const updateNode = async (req, res) => {
          try {
            const { error } = nodeSchema.validate(req.body);
            if (error) {
              return res.status(400).json({ error: error.details[0].message });
            }
            const [updated] = await Node.update(req.body, {
              where: { id: req.params.id, userId: req.user.id }
            });
            if (updated) {
              const updatedNode = await Node.findByPk(req.params.id);
              res.json(updatedNode);
            } else {
              res.status(404).json({ error: 'Node not found' });
            }
          } catch (error) {
            res.status(400).json({ error: error.message });
          }
        };

        const deleteNode = async (req, res) => {
          try {
            const deleted = await Node.destroy({
              where: { id: req.params.id, userId: req.user.id }
            });
            if (deleted) {
              res.json({ message: 'Node deleted' });
            } else {
              res.status(404).json({ error: 'Node not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        };

        module.exports = {
          getAllNodes,
          getNodeById,
          createNode,
          updateNode,
          deleteNode
        };