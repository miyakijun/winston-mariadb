const winston = require('winston')
const MariadbTransport = require('../lib/mariadb_transport');
const opts = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password:  process.env.DB_PWD,
    database:process.env.DB_NAME,
    connectionLimit:process.env.DB_POOL_SIZE,
    tableName: '',
    ssl:false,
};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new MariadbTransport(opts),
    ],
});

logger.info('Hello world', { tag: 'test' });