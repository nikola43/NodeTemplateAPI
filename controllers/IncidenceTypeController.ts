import { Request, Response } from "express";
import { IncidenceType } from "../db/models/IncidenceType";
const Sequelize = require('sequelize');
const Op = Sequelize.Op


export default class IncidencesTypesController {
    static getAll = async (req: Request, res: Response, next: any) => {
        let incidencesTypess = null;
        try {
            incidencesTypess = await IncidenceType.findAll()
            if (incidencesTypess) {
                res.status(200).send(incidencesTypess);
            } else {
                res.status(200).send([]);
            }
        } catch (e) {
            res.status(500).send({ error: "Error en la petición" });
        }
    };

    static getIncidenceTypeById = async (req: Request, res: Response, next: any) => {
        let incidencesTypes = null;
        try {
            const incidencesTypes = await IncidenceType.findByPk(req.query.id)
            if (incidencesTypes) {
                res.status(200).send(incidencesTypes);
            } else {
                res.status(200).send({ error: "incidencesTypes not found" });
            }
        } catch (e) {
            res.status(500).send({ error: "Error en la petición" });
        }
    };

    static insertIncidenceType = async (req: Request, res: Response, next: any) => {
        let newIncidenceTypes = null;
        try {
            const newIncidenceTypes = await IncidenceType.create({
                type: req.body.type
            });
            res.status(200).send(newIncidenceTypes);
        } catch (e) {
            res.status(500).send({ error: "Error insertando" });
        }
    };

    static updateIncidenceType = async (req: Request, res: Response, next: any) => {
        let incidencesTypes: IncidenceType = req.body;
        incidencesTypes.id = req.query.id;
        incidencesTypes.updated_at = new Date();
        try {
            incidencesTypes.update(incidencesTypes,
                {
                    where: {
                        id: {
                            [Op.eq]: incidencesTypes.id
                        },
                        deleted_at: {
                            [Op.is]: null
                        }
                    }
                });
            res.status(200).send(incidencesTypes);
        } catch (e) {
            res.status(500).send({ error: "Error actualizando" });
        }
    };

    static deleteIncidenceType = async (req: Request, res: Response, next: any) => {
        let incidencesTypes: IncidenceType = req.body;
        incidencesTypes.id = req.query.id;
        try {
            incidencesTypes.update({
                deleted_at: new Date()
            },
                {
                    where: {
                        id: {
                            [Op.eq]: incidencesTypes.id
                        },
                        deleted_at: {
                            [Op.is]: null
                        }
                    }
                });
            res.status(200).send({ success: "Tipo de incidencia eliminada" });
        } catch (e) {
            res.status(500).send({ error: "Error eliminando" });
        }
    };
}