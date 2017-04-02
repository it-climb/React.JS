'use strict';

const
    modelName = 'Credit';

module.exports = (/**Sequelize*/sequelize, DataTypes)=> {

    return [

        /**@typedef {{}} Credit*/
        sequelize.define(modelName, {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            bankId: {
                field: 'bank_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            clientId: {
                field: 'client_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            sum: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            confirm: {
                type: DataTypes.BOOLEAN
            },
            requestDate: {
                field: 'request_date',
                type: DataTypes.DATE
            },

        }, {
            underscored: true,
            tableName: 'credits',
            classMethods: {
                associate: function (models) {
                    this.belongsTo(models['Bank'], {as: 'Bank', foreignKey: 'bankId'});
                    this.belongsTo(models['Client'], {foreignKey: 'clientId', as: 'Client'});
                }
            }

        })
    ]
};