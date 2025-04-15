// models/file.js
module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
      name: DataTypes.STRING,
      upload_date: DataTypes.DATE
    });
  
    File.associate = function(models) {
      File.hasMany(models.Block, { foreignKey: 'file_id' });
    };
    
    return File;  
  };
  