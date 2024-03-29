import {DataTypes} from 'sequelize';
import dbConnection from "../../managers/DBManager";
import {BaseModel} from "./baseModels/BaseModel";
import {CenterTypeModel} from "./typesModels/CenterTypeModel"
import { LocationModel } from './LocationModel';
import { UserModel } from './UserModel';
import { ResourceModel } from './ResourceModel';

export class CenterModel extends BaseModel {
    public location_id!: number;
    public type_id!: number;
    public name!: string;
    public description!: string | null;
    public phone!: string | null;
    public email!: string | null;
    public leader!: string | null;
    public schedule!: string | null;
    public endAt!: Date | null;
}

CenterModel.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    location_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    type_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    name: {
        type: new DataTypes.STRING(64),
        allowNull: false,
    },
    description: {
        type: new DataTypes.STRING(150),
        allowNull: true
    },
    phone: {
        type: new DataTypes.STRING(15),
        allowNull: true
    },
    email: {
        type: new DataTypes.STRING(100),
        allowNull: true
    },
    leader: {
        type: new DataTypes.STRING(15),
        allowNull: true
    },
    schedule: {
        type: new DataTypes.STRING(32),
        allowNull: true
    },
    endAt: {
        type: new DataTypes.DATE,
        allowNull: true
    },
    deletedAt: {
        type: new DataTypes.DATE,
        allowNull: true
    },
}, {
    tableName: 'centers',
    sequelize: dbConnection.getSequelize, // this bit is important
});

CenterModel.hasOne(CenterTypeModel, {sourceKey: 'type_id', foreignKey: 'id', as: 'type'});
CenterModel.hasOne(LocationModel, {sourceKey: 'location_id', foreignKey: 'id', as: 'location'});
CenterModel.hasMany(ResourceModel, {sourceKey: 'id', foreignKey: 'center_id', as: 'resources'});
CenterModel.hasMany(UserModel, {sourceKey: 'id', foreignKey: 'center_id', as: 'users'});
UserModel.belongsTo(CenterModel, {targetKey: 'id', foreignKey: 'center_id', as: 'center'});

CenterModel.sync({ force: false })
    .then(() => console.log("Tabla de centros creada o ya existe."));

CenterTypeModel.sync({ force: false })
    .then(() => console.log("Tabla de tipos centros creada o ya existe."));
