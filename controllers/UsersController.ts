import {Request, Response} from "express";
import {UserModel} from "../db/models/UserModel";
import BaseController from "./BaseController";
import {ErrorUtil} from "../utils/ErrorUtil";
import Messages from "../constants/messages/Messages";
import UserErrors from "../constants/errors/UserErrors";
import server from "../server";
import GenericErrors from "../constants/errors/GenericErrors";
import DBActions from "../constants/DBActions";
import bcrypt from "bcrypt";
import {DocumentModel} from "../db/models/DocumentModel";
import {MultimediaContentModel} from "../db/models/MultimediaContentModel";
import {UserDeviceModel} from "../db/models/UserDeviceModel";
import {UserResourceModel} from "../db/models/UserResourceModel";
import {UserIncidenceModel} from "../db/models/UserIncidenceModel";
import MailUtil from "../utils/MailUtil";
import {CenterModel} from "../db/models/CenterModel";
import ServerErrors from "../constants/errors/ServerErrors";
import socketManager from "../managers/SocketManager";
import {CenterTypeModel} from "../db/models/typesModels/CenterTypeModel";
import {LocationModel} from "../db/models/LocationModel";
import {PositionModel} from "../db/models/PositionModel";
import {IncidenceModel} from "../db/models/IncidenceModel";
import {ResourceModel} from "../db/models/ResourceModel";

const crypto = require('crypto');
const HttpStatus = require('http-status-codes');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
import * as EmailValidator from 'email-validator';

class UsersController extends BaseController {
    // functions
    // GET ALL
    getAll = async (req: Request, res: Response, next: Function) => {

        // create variable for store query result
        let queryResult: any;

        // find all records
        try {
            queryResult = await UserModel.findAll({
                attributes: [
                    'id',
                    'name',
                    'lastname',
                    'status',
                    'rank',
                    'role',
                    'availability',
                ], where: {
                    deletedAt: {
                        [Op.is]: null
                    }
                },
            });

            // if has results, then send result data
            // if not has result, send empty array
            queryResult
                ? res.status(HttpStatus.OK).send(queryResult)
                : res.status(HttpStatus.OK).send([]);
        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.GET_ALL)
        }
    };

    // GET BY ID
    getById = async (req: Request, res: Response, next: Function) => {

        // create variable for store query result
        let queryResult: any;

        // find record by pk
        try {
            queryResult = await UserModel.findByPk(req.params.id, {
                attributes: [
                    'id',
                    'email',
                    'name',
                    'lastname',
                    'status',
                    'rank',
                    'role',
                    'phone',
                    'availability',
                ],
                include: [
                    {
                        model: CenterModel, as: 'center',
                        attributes: [ //Campos que se muestran en la relación
                            'name'
                        ]
                    },
                ],
                rejectOnEmpty: true,
            });

            // if has results, then send result data
            // if not has result, send not found error
            queryResult && !queryResult.deletedAt
                ? res.status(HttpStatus.OK).send(queryResult)
                : res.status(HttpStatus.NOT_FOUND).send({error: UserModel.name + " " + GenericErrors.NOT_FOUND_ERROR});
        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.GET_BY_ID)
        }
    };

    // INSERT
    insert = async (req: Request, res: Response, next: Function) => {

        // create model from request body data
        const data: UserModel = req.body;
        let tempData: any;

        // check if field callet 'password' are set
        // if field not are set, then send empty required field error
        if (!data.password) {
            res.status(HttpStatus.BAD_REQUEST).send({error: UserModel.name + " " + UserErrors.EMPTY_PASSWORD_ERROR});
            return;
        }


        // check if field callet 'email' are set
        // if field not are set, then send empty required field error
        if (!data.email) {
            res.status(HttpStatus.BAD_REQUEST).send({error: UserModel.name + " " + UserErrors.EMAIL_EMPTY_ERROR});
            return;
        }


        // check if field callet 'email' are set
        // if field not are set, then send empty required field error
        if (!EmailValidator.validate(data.email) ) {
            res.status(HttpStatus.BAD_REQUEST).send({error: UserModel.name + " " + UserErrors.INVALID_EMAIL_ERROR});
            return;
        }

        // find if exists any record with same request value in type field
        try {
            tempData = await UserModel.findOne({
                attributes: [
                    'email',
                ], where: {
                    email: {
                        [Op.eq]: data.email
                    },
                    deletedAt: {
                        [Op.is]: null
                    }
                }
            });

            // if already exist
            // send conflict error
            if (tempData) {
                res.status(HttpStatus.CONFLICT).send({error: UserModel.name + " " + GenericErrors.ALREADY_EXIST_ERROR});
                return;
            } else {
                //Generate new password
                let passwordCopy = data.password;
                data.password = await bcrypt.hashSync(data.password, 10);

                // create new record from request body data
                const newData = await UserModel.create(data);

                // emit new data


                // clear password before send
                newData.password = "";

                // respond request
                res.status(HttpStatus.CREATED).send(newData)
            }
        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.INSERT);
        }
    };

    // UPDATE
    update = async (req: Request, res: Response, next: Function) => {
        // create model from request body data
        const data: UserModel = req.body;

        // get record id(pk) from request params
        data.id = Number(req.params.id);

        // set updated date
        data.updatedAt = new Date();

        // update
        try {
            const updateResult = await UserModel.update(data,
                {
                    where: {
                        id: {
                            [Op.eq]: data.id
                        },
                        deletedAt: {
                            [Op.is]: null
                        }
                    }
                });

            // if it has affected one row
            if (updateResult[0] === 1) {

                // find updated data
                const updatedData = await UserModel.findByPk(data.id);

                // emit updated data


                // respond request
                res.status(HttpStatus.OK).send(updatedData);

            } else {
                res.status(HttpStatus.NOT_FOUND).send({error: UserModel.name + " " + GenericErrors.NOT_FOUND_ERROR});
            }

        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.UPDATE);
        }
    };

    // DELETE
    delete = async (req: Request, res: Response, next: Function) => {

        // create model from request body data
        const data: UserModel = req.body;

        // get record id(pk) from request params
        data.id = Number(req.params.id);

        // set deleted date
        data.deletedAt = new Date();

        // delete
        try {
            const deleteResult = await UserModel.update(data,
                {
                    where: {
                        id: {
                            [Op.eq]: data.id
                        },
                        deletedAt: {
                            [Op.is]: null
                        }
                    }
                });

            // if it has affected one row
            if (deleteResult[0] === 1) {
                // emit updated data
                socketManager.emitSocketEvent(CenterModel.name, DBActions.DELETE, deleteResult);
                // respond request
                res.status(HttpStatus.OK).send(Messages.SUCCESS_REQUEST_MESSAGE);
            } else {
                res.status(HttpStatus.NOT_FOUND).send({error: UserModel.name + " " + GenericErrors.NOT_FOUND_ERROR});
            }

        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.DELETE)
        }
    };

    // RECOVERY PASSWORD
    recoveryPassword = async (req: Request, res: Response, next: Function) => {

        // create model from request body data
        const data: UserModel = req.body;

        // check if field callet 'email' are set
        // if field not are set, then send empty required field error
        if (!data.email) {
            res.status(HttpStatus.BAD_REQUEST).send({error: UserModel.name + " " + UserErrors.EMAIL_EMPTY_ERROR});
            return;
        }

        try {
            const tempData = await UserModel.findOne({
                attributes: [
                    'email',
                ], where: {
                    email: {
                        [Op.eq]: data.email
                    },
                    deletedAt: {
                        [Op.is]: null
                    }
                }
            });

            // if already exist
            // send recovery email
            if (tempData) {
                let passwordRecoveryToken = crypto.randomBytes(20).toString('hex');

                MailUtil.to = data.email;
                MailUtil.subject = 'Cambio de contraseña';
                MailUtil.message = `<h1 style="color: red">Puede cambiar la contraseña pulsando el siguiente enlace http://localhost:3000/recovery?token=${passwordRecoveryToken}</h1>`;
                let result = MailUtil.sendMail();
                console.log(result);
                return;
            } else {
                res.status(HttpStatus.CONFLICT).send({error: UserModel.name + " " + GenericErrors.NOT_FOUND_ERROR});
            }


        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.DELETE)
        }
        res.status(HttpStatus.OK).send(Messages.SUCCESS_REQUEST_MESSAGE);
    };

    changePassword = async (req: Request, res: Response) => {
        // get email and password from request body
        const email = req.body.recoveryPasswordToken;
        const password = req.body.password;
        let newPassword;

        // check if email are set
        if (!email) {
            res.status(HttpStatus.BAD_REQUEST).send(UserErrors.EMPTY_PASSWORD_ERROR);
            return;
        }

        // check if field callet 'email' are set
        // if field not are set, then send empty required field error
        if (!EmailValidator.validate(email) ) {
            res.status(HttpStatus.BAD_REQUEST).send({error: UserModel.name + " " + UserErrors.INVALID_EMAIL_ERROR});
            return;
        }

        // check if password are set
        if (!password) {
            res.status(HttpStatus.BAD_REQUEST).send(UserErrors.EMPTY_PASSWORD_ERROR);
            return;
        }

        // find if exist any user with recived email
        // if user exists, generate new password
        try {
            const user = await UserModel.findOne({where: {email: email}});

            if (user) {
                newPassword = await bcrypt.hashSync(req.body.password, 10);
            } else {
                res.status(HttpStatus.NOT_FOUND).send({error: UserModel.name + " " + GenericErrors.NOT_FOUND_ERROR});
            }
        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.GET_BY_EMAIL)
        }

        // update user password on db
        try {
            await UserModel.update({password: newPassword}, {where: {email: email}});
            res.status(HttpStatus.OK).send(Messages.SUCCESS_REQUEST_MESSAGE);
        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.UPDATE)
        }
    };

    getLastPosition = async (req: Request, res: Response, next: Function) => {

        const user_id = req.params.id;


        // check if user_id are set
        if (!user_id) {
            res.status(HttpStatus.BAD_REQUEST).send(GenericErrors.USER_ID_EMPTY_ERROR);
            return;
        }
        try {
            const user = await LocationModel.findOne({
                attributes: [ //Campos que se muestran en la relación
                    'id',
                ],
                include: [
                    {
                        model: PositionModel, as: 'position',
                        attributes: [ //Campos que se muestran en la relación
                            'Id',
                            'Latitude',
                            'Longitude'
                        ]
                    },
                ],
                where: {
                    user_id: {
                        [Op.eq]: user_id
                    }
                }
            });
            res.status(200).send(user);
        } catch (e) {
            ErrorUtil.handleError(res, e, UsersController.name + ' - ' + DBActions.GET_BY_EMAIL)
        }

    };


    newPosition = async (req: Request, res: Response) => {
        // get email and password from request body
        const Latitude = req.body.Latitude;
        const Longitude = req.body.Longitude;

        // check if email are set
        if (!Latitude) {
            res.status(HttpStatus.BAD_REQUEST).send(UserErrors.EMPTY_PASSWORD_ERROR);
            return;
        }

        // check if email are set
        if (!Longitude) {
            res.status(HttpStatus.BAD_REQUEST).send(UserErrors.EMPTY_PASSWORD_ERROR);
            return;
        }

        res.status(200).send('sd');
    };

    validateInsert = (data: any, res: Response): boolean => {
        return true;
    };
}

const usersController = new UsersController();
export default usersController;
