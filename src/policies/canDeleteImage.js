'use strict';
const
    _ = require('lodash'),
    models = require('./../models');

const canDeleteImage = (request, reply, next)=> {
    return next(null, false, 'Insufficient privileges');
    /*let {sequelize} = models;


    return sequelize.query(
        //language=PostgreSQL
        `SELECT (SELECT count(1) FROM dentists D WHERE D.id=:dIds AND D.logo_id=:logoId)+(SELECT count(1)FROM labs L WHERE L.id=:lIds AND L.logo_id=:logoId) AS result;`,
        {
            replacements: {logoId: targetImageId, dIds: ownedDentists, lIds: ownedLabIds},
            type: sequelize.QueryTypes.SELECT
        })
        .then(results=>next(null, (~~(results[0].result) > 0), 'Insufficient privileges'))
        .catch(err=>next(null, false, 'Insufficient privileges'));*/
};
module.exports = canDeleteImage;