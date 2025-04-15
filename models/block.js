module.exports = (sequelize, DataTypes) => {
    const Block = sequelize.define('Block', {
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      coordinates: DataTypes.JSONB, // PostgreSQL optimized JSON
      file_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }); 
  
    Block.associate = function(models) {
      Block.belongsTo(models.File, { foreignKey: 'file_id' });
    };
  
    return Block;
  };
  