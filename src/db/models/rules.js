'use strict';
module.exports = (sequelize, DataTypes) => {
  var Rules = sequelize.define('Rules', {
    description: DataTypes.STRING,
   topicId: {
     type: DataTypes.INTEGER,
     onDelete: "CASCADE",
     references: {
       model: "Topics",
       key: "id",
       as: "topicId",
     }
   }
  }, {});
  Rules.associate = function(models) {
    Rules.belongsTo(models.Topic, {
        foreignKey: "topicId",
        onDelete: "CASCADE",
      });
  };
  return Rules;
};
