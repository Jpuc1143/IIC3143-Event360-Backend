"use strict";
const { v4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Tickets", "secret", {
      type: Sequelize.UUIDV4,
      allowNull: false,
      defaultValue: v4,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Tickets", "secret");
  },
};
