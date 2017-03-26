'use strict';

const
    modelName = 'User';

module.exports = (/**Sequelize*/sequelize, DataTypes)=> {
    /**@typedef {{}} User*/
    return sequelize.define(modelName, {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'role_id'
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            field: 'email_verified',
            allowNull: false,
            defaultValue: false
        },
        password: DataTypes.STRING(100),
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
        tableName: 'users',
        classMethods: {
            associate: function (models) {
                this.belongsTo(models['Role'], {foreignKey: 'role_id'});
                this.hasOne(models['Client'].scope('general'), {foreignKey: 'user_id'});
                this.hasOne(models['Bank'].scope('general'), {foreignKey: 'user_id'});
            }
        },
        defaultScope: [
            {attributes: {exclude: ['password', 'roleId', 'billingData']}}
        ],
        scopes: {
            auth: {
                attributes: {
                    include: [

                    ]
                }
            },
            general : {
                attributes: {
                    exclude: ['password']
                }
            },
            plain: {
                attributes: {
                    exclude: ['password']
                }
            }
        },
        scopedIncludes: {
            general: [
                {model: 'Role', as: 'Role', required: false},
                {model: 'Client', as: 'Client', required: false},
                {model: 'Bank', as: 'Bank', required: false},
            ],
            auth: [
                {model: 'Role', as: 'Role', required: false},
            ],
            plain: [
            ]
        }
    })
};