"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "admin", Sequelize.BOOLEAN);
    await queryInterface.addColumn("Users", "organizer", Sequelize.STRING);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "admin");
    await queryInterface.removeColumn("Users", "organizer");
  },
};
