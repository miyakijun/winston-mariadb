const Transport = require('winston-transport');
const mariadb = require('mariadb');

module.exports = class CustomTransport extends Transport {
    constructor(opts) {
        super(opts);

        this.opts = opts || {};
        const { host, user, password, database, tableName, ssl = false, connectionLimit = 5 } = this.opts;
        if (!host || !user || !password || !database || !tableName) {
            throw new Error('host, user, password, database, tableName are required');
        }
        this.pool = mariadb.createPool({
            host: host,
            user: user,
            password: password,
            database: database,
            ssl: ssl,
            connectionLimit: connectionLimit,
        });
    }

    log(info, callback) {
        const { level, message, ...winstonMeta } = info;
        const log = {};
        log.meta = winstonMeta;
        log.level = level.replace(/\u001b\[[0-9]{1,2}m/g, '');
        log.message = message;
        log.timestamp = new Date();


        const sql = `INSERT INTO ${this.opts.tableName} (level, message, timestamp, meta) VALUES (?, ?, ?, ?)`;
        const values = [log.level, log.message, log.timestamp, log.meta];
        setImmediate(() => {

            if ((this.opts.tagFilter === undefined)||this.opts.tagFilter && this.opts.tagFilter.includes(log.meta.tag)) {
                this.pool.getConnection().then((conn) => {
                    conn.query(sql, values, function (err, result) {
                        if (err) throw err;
                        console.log("Number of records inserted: " + result.affectedRows);
                        this.emit('error', err);
                    });
                    conn.release();

                })
            } 
            this.emit('logged', log);

        });

        callback();
    }
};