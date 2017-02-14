'use strict';
const
    models = require('./../../models'),
    {sequelize} = models;

const AdminService = {
    getStats: period => {
        return sequelize.query(
            //language=PostgreSQL
            `SELECT 
(SELECT count(1) FROM users U WHERE U.created_at > (now() - interval :period)) AS "userCount", 
(SELECT count(1) FROM clients D   WHERE D.created_at > (now() - INTERVAL :period)) AS "clientCount",
(SELECT count(1) FROM banks L   WHERE L.created_at > (now() - INTERVAL :period)) AS "banksCount",

"tx".count as "tx.count",
"tx".collected AS "tx.collected",
"tx".transferred AS "tx.transferred"
FROM 
(SELECT count(1) AS "count",sum(T1.amount) AS "transferred",((sum(T1.amount)/10)::NUMERIC(10,2)) AS "collected" FROM transactions T1 WHERE T1.created_at > (now() - INTERVAL :period)) AS "tx"`,

            {replacements: {period}, type: sequelize.QueryTypes.SELECT}
        )
            .then(results => results[0]);
    }
};

module.exports = AdminService;