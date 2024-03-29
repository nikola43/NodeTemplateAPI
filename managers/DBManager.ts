 const Sequelize = require('sequelize');

export class DBManager {
    private readonly sequelize: any;

    constructor() {
        this.sequelize = new Sequelize('signis', 'root', '', {
            host: 'localhost',
            dialect: 'mysql',
        });
        this.connect();
    }

    get getSequelize() {
        return this.sequelize;
    }

    connect() {
        this.sequelize
            .authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
            })
            .catch((err: Error) => {
                console.error('Unable to connect to the database:', err);
            });
    }
}

let dbConnection = new DBManager();
export default dbConnection;
