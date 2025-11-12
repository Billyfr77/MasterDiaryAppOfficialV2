 'use strict';

        /** @type {import('sequelize-cli').Migration} */
        module.exports = {
          async up(queryInterface, Sequelize) {
            await queryInterface.createTable('Nodes', {
              id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false
              },
              name: {
                type: Sequelize.STRING,
                allowNull: false
              },
              category: {
                type: Sequelize.STRING,
                allowNull: false
              },
              unit: {
                type: Sequelize.STRING,
                allowNull: false
              },
              pricePerUnit: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
              },
              userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                  model: 'Users',
                  key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
              },
              createdAt: {
                allowNull: false,
                type: Sequelize.DATE
              },
              updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
              }
            });
          },

          async down(queryInterface, Sequelize) {
            await queryInterface.dropTable('Nodes');
          }
        };

