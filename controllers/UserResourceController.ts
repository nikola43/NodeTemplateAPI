import {Request, Response} from "express";
import UserResourceErrors from "../errors/UserErrors";
import {UserResource} from "../db/models/UserResource";
import ServerErrors from "../errors/ServerErrors";
import Messages from "../messages/Messages";



const Sequelize = require('sequelize');
const Op = Sequelize.Op;

export default class UserResourceController {
    static getAll = async (req: Request, res: Response, next: any) => {
        try {
            const userResource = await UserResource.findAll();
            res.status(200).send(userResource);
        } catch (e) {
            console.log(e);
            res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
        }
    };

    static getUserResourceById = async (req: Request, res: Response, next: any) => {
        try {
            const userResource = await UserResource.findByPk(req.params.id);
            console.log(req.params.id);

            if (userResource) {
                res.status(200).send(userResource);
            } else {
                res.status(404).send(UserResourceErrors.USER_RESOURCE_NOT_FOUND_ERROR);
            }
        } catch (e) {
            console.log(e);
            res.status(500).send({error: "internal error"});
        }
    };

    static insertResource = async (req: Request, res: Response, next: any) => {

        // get userResource data from request
        const userId = req.body.user_id;
        const resourceId = req.body.resource_id;

        // check if centerID are set
        // if not are set, break execution
        if (!userId) {
            res.status(400).send(UserResourceErrors.USER_ID_EMPTY_ERROR);
            return;
        }

        if (!resourceId) {
            res.status(400).send(UserResourceErrors.RESOURCE_ID_EMPTY_ERROR);
            return;
        }

        // find userResource in db for check if already exists
        try {
            const tempResource = await UserResource.findOne({
                attributes: [
                    'resource_id',
                ], where: {
                    resource_id: {
                        [Op.eq]: resourceId
                    },
                    deletedAt: {
                        [Op.is]: null
                    }
                }
            });

            // check if userResource already have center
            // break execution
            if (tempResource) {
                res.status(400).send(UserResourceErrors.USER_RESOURCE_ALREADY_EXIST_ERROR);
                return;
            } else {

                const newUserResourceData: UserResource = req.body;

                try {
                    // Create userResource from request data
                    const newUserResource = await UserResource.create(newUserResourceData);

                    res.status(200).send(newUserResource);
                } catch (e) {
                    console.log(e);
                    res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
                }
            }
        } catch (e) {
            console.log(e);
            res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
        }
    };

    static updateResource = async (req: Request, res: Response, next: any) => {
        // get userResourceID from request
        const userResourceId = req.params.id;

        // check if resourceId are set
        // if not are set, break execution
        if (!userResourceId) {
            res.status(400).send(UserResourceErrors.USER_RESOURCE_ID_EMPTY_ERROR);
            return;
        }

        try {
            // create userResource from request data
            let userResource: UserResource = req.body;
            userResource.updated_at = new Date();

            const updatedUserResource = await UserResource.update(userResource,
                {
                    where: {
                        id: {
                            [Op.eq]: userResourceId
                        },
                        deletedAt: {
                            [Op.is]: null
                        }
                    }
                });

            // check if userResource are updated
            if (updatedUserResource[0] === 1) {
               res.status(200).send(Messages.SUCCESS_REQUEST_MESSAGE);
               //res.status(200).send(updatedUserResource);

            } else {
                res.status(404).send(UserResourceErrors.USER_RESOURCE_NOT_FOUND_ERROR);
            }
        } catch (e) {
            console.log(e);
            res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
        }
    };

    static deleteResource = async (req: Request, res: Response, next: any) => {
        // get userResourceID from request
        const userResourceId = req.params.id;

        // check if resourceId are set
        // if not are set, break execution
        if (!userResourceId) {
            res.status(400).send(UserResourceErrors.USER_RESOURCE_ID_EMPTY_ERROR);
            return;
        }

        try {
            const userResource = await UserResource.update({deletedAt: new Date()},
                {
                    where: {
                        id: {
                            [Op.eq]: userResourceId
                        },
                        deletedAt: {
                            [Op.eq]: null
                        }
                    }
                });

            // check if userResource are deleted
            if (userResource[0] === 1) {
                res.status(200).send(Messages.SUCCESS_REQUEST_MESSAGE);
            } else {
                res.status(404).send(UserResourceErrors.USER_RESOURCE_NOT_FOUND_ERROR);
            }
        } catch (e) {
            console.log(e);
            res.status(500).send(ServerErrors.INTERNAL_SERVER_ERROR);
        }
    };
}
