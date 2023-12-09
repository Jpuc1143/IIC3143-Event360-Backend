"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "email", Sequelize.STRING);
    await queryInterface.addColumn("Users", "name", Sequelize.STRING);
    await queryInterface.addColumn("Users", "picture", Sequelize.STRING);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "email");
    await queryInterface.removeColumn("Users", "name");
    await queryInterface.removeColumn("Users", "picture");
  },
};
