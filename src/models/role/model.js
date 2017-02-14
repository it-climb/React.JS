'use strict';
const
    modelName = "Role",
    _ = require('lodash');
/**@typedef {{}} Role*/
module.exports = (sequelize, DataTypes)=> {
    return sequelize.define(modelName,
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            title: DataTypes.STRING(100),
            description: DataTypes.TEXT,
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            }
        },
        {
            tableName: 'roles',
            classMethods: {
                associate: function (models) {
                    this.hasMany(models['User'], {foreignKey: 'role_id'});
                }
            }
        });
};