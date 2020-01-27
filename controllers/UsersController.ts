import {Request, Response} from "express";
import {UserModel} from "../db/models/UserModel";
import ServerErrors from "../errors/ServerErrors";
import Messages from "../messages/Messages";
import UserErrors from "../errors/UserErrors";
import {LOGUtil} from "../utils/LOGUtil";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class UsersController {
     getAll = async (req: Request, res: Response, next: any) => {
        try {
            const users = await UserModel.findAll();
            res.status(200).send(users);
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("get all user- " + e.toString());
            res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
        }
    };

     getById = async (req: Request, res: Response, next: any) => {
        try {
            const user = await UserModel.findByPk(req.params.id);
            if (user) {
                user.password = "";
                user.token = "";
                res.status(200).send(user);
            } else {
                res.status(404).send({error: "user not found"});
            }
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("get user by ID - " + e.toString());
            res.status(500).send({error: "internal error"});
        }
    };

     insert = async (req: Request, res: Response, next: any) => {
        // get user data from request
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        // check if username, email and password are set
        // if not are set, break execution
        if (!(username && password && email)) {
            res.status(400).send({error: "username, email or password are empty"});
            return;
        }

        // find user in db for check if already exists
        try {
            const tempUser = await UserModel.findOne({
                attributes: [
                    'email',
                ], where: {
                    email: {
                        [Op.eq]: email
                    },
                    deletedAt: {
                        [Op.is]: null
                    }
                }
            });

            // check if user already exists on db
            // if exists, break execution
            if (tempUser) {
                res.status(400).send(UserErrors.USER_ALREADY_EXISTS_ERROR);
                return;
            } else {
                try {
                    // Create user from request data
                    const newUser = await UserModel.create({
                        username: username,
                        password: password,
                        email: email,
                        available: 1,
                        status: 1,
                    });

                    res.status(200).send(newUser);
                } catch (e) {
                    console.log(e);
                    LOGUtil.saveLog("insert user - " + e.toString());
                    res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
                }
            }
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("insert user - " + e.toString());
            res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
        }
    };

     update = async (req: Request, res: Response, next: any) => {
        try {
            // create user from request data
            let user: UserModel = req.body;
            user.updatedAt = new Date();

            const updatedUser = await UserModel.update(user,
                {
                    where: {
                        id: {
                            [Op.eq]: req.params.id
                        },
                        deletedAt: {
                            [Op.is]: null
                        }
                    }
                });

            // check if user are updated
            if (updatedUser[0] === 1) {
                res.status(200).send(Messages.SUCCESS_REQUEST_MESSAGE);
            } else {
                res.status(404).send(UserErrors.USER_NOT_FOUND_ERROR);
            }
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("update user - " + e.toString());
            res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
        }
    };

     delete = async (req: Request, res: Response, next: any) => {
        try {
            const userID = req.params.id;
            const user = await UserModel.update({deletedAt: new Date()},
                {
                    where: {
                        id: {
                            [Op.eq]: userID
                        },
                        deletedAt: {
                            [Op.eq]: null
                        }
                    }
                });

            // check if user are deleted
            if (user[0] === 1) {
                res.status(200).send(Messages.SUCCESS_REQUEST_MESSAGE);
            } else {
                res.status(404).send(UserErrors.USER_NOT_FOUND_ERROR);
            }
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("delete user - " + e.toString());
            res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
        }
    };
}
const usersController = new UsersController();
export default usersController;