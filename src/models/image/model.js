'use strict';
const
    modelName = 'Image',
    ImageTypes = {
        LOGO: 'LOGO'
    };

module.exports = (sequelize, DataTypes)=> {
    /**@typedef {{}} Image*/
    return sequelize.define(modelName, {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        type: {
            type: DataTypes.ENUM(Object.keys(ImageTypes).map(typeName=>ImageTypes[typeName])),
            allowNull: false
        },
        path: {
            type: DataTypes.STRING(1024),
            allowNull: false
        },
        alt: DataTypes.STRING(1024),
        name: {
            type: DataTypes.STRING(256),
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        mimeType: {
            field: 'mime_type',
            type: DataTypes.STRING(40)
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
        tableName: 'images',
        classMethods: {
            associate: function (models) {
                this.hasOne(models['Client'], {foreignKey: 'logo_id', required: false});
                this.hasOne(models['Bank'], {foreignKey: 'logo_id', required: false});
            },
            types:ImageTypes
        }
    })
};