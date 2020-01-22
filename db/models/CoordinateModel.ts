import { Model, DataTypes } from 'sequelize';
import dbConnection from "../../utils/DBUtil";

export class CoordinateModel extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public lat!: number;
    public lon!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public updatedAt!: Date | null;
    public deletedAt!: Date | null;
}

CoordinateModel.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    lat: {
        type: new DataTypes.DOUBLE,
        allowNull: false,
    },
    lon: {
        type: new DataTypes.DOUBLE,
        allowNull: false,
    },
    deletedAt: {
        type: new DataTypes.DATE,
        allowNull: true
    },
}, {
    tableName: 'coordinates',
    sequelize: dbConnection.getSequelize, // this bit is important
});