'use strict';
const
    modelName = 'Attachment';

module.exports = (sequelize, DataTypes)=> {
    /**@typedef {{}} Attachment*/
    return sequelize.define(modelName, {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        path: {
            type: DataTypes.STRING(1024),
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        mimeType: {
            field: 'mime_type',
            type: DataTypes.STRING(40),
        },
        name: {
            type: DataTypes.STRING(256),
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at'
        }
    }, {
        underscored: true,
        tableName: 'attachments',
        classMethods: {
            associate: function (models) {
            }
        }
    });
};