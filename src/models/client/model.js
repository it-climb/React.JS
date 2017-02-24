'use strict';

const
    modelName = 'Client';

module.exports = (/**Sequelize*/sequelize, DataTypes)=> {
    /**@typedef {{}} Client*/
    return sequelize.define(modelName, {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            field: 'user_id',
            type: DataTypes.UUID,
            allowNull: false,
            unique: true
        },
        businessName: {
            field: 'business_name',
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: ''
        },
        firstName: {
            field: 'first_name',
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: ''
        },
        lastName: {
            field: 'last_name',
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: ''
        },
        phone: DataTypes.STRING(20),
        mobilePhone: {
            field: 'mobile_phone',
            type: DataTypes.STRING(20)
        },
        billingData: {
            field: 'billing_data',
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        hasBilling:{
            field:'has_billing',
            type:DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        location: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        logoId: {
            field: 'logo_id',
            type: DataTypes.UUID
        },
        settings: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
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
        tableName: 'clients',
        classMethods: {
            associate: function (models) {
                this.belongsTo(models['User'].scope('plain'), {as: 'User', foreignKey: 'userId'});
                this.belongsTo(models['Image'], {foreignKey: 'logo_id', as: 'Logo', required: false});
            }
        },
        defaultScope: [
            {attributes: {exclude: ['billingData']}}
        ],
        scopes: {
            general : {
                attributes: {
                    exclude: ['billingData']
                }
            }
        },
        scopedIncludes: {
            general: [
                {model: 'Image', as: 'Logo', required: false},
            ],
            withUser: [
                {model: 'Image', as: 'Logo', required: false},
                {model: 'User', as: 'User', required: true},
            ]
        }
    })
};