import { Request, Response } from "express";
import { IncidenceModel } from "../db/models/IncidenceModel";
import {LOGUtil} from "../utils/LOGUtil";
import BaseController from "./BaseController";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class IncidencesController extends BaseController{
     getAll = async (req: Request, res: Response, next: any) => {
        let incidences = null;
        try {
            incidences = await IncidenceModel.findAll();
            if (incidences) {
                res.status(200).send(incidences);
            } else {
                res.status(200).send([]);
            }
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("get all incidence- " + e.toString());
            res.status(500).send({ error: "Error en la petición" });
        }
    };

     getById = async (req: Request, res: Response, next: any) => {
        let incidences = null;
        try {
            const incidences = await IncidenceModel.findByPk(req.params.id);
            if (incidences) {
                res.status(200).send(incidences);
            } else {
                res.status(200).send({ error: "incidences not found" });
            }
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("get incidence by ID - " + e.toString());
            res.status(500).send({ error: "Error en la petición" });
        }
    };

     insert = async (req: Request, res: Response, next: any) => {
        //
        let incidence: IncidenceModel = req.body;
        try {
            const newIncidence = await IncidenceModel.create(incidence);
            res.status(200).send(newIncidence);
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("insert incidence - " + e.toString());
            res.status(500).send({ error: "Error insertando" });
        }
    };

     update = async (req: Request, res: Response, next: any) => {
        let incidences: IncidenceModel = req.body;
        incidences.id = req.query.id;
        incidences.updatedAt = new Date();
        try {
            incidences.update(incidences,
                {
                    where: {
                        id: {
                            [Op.eq]: incidences.id
                        },
                        deletedAt: {
                            [Op.is]: null
                        }
                    }
                });
            res.status(200).send(incidences);
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("update incidence - " + e.toString());
            res.status(500).send({ error: "Error actualizando" });
        }
    };

     delete = async (req: Request, res: Response, next: any) => {
        let incidences: IncidenceModel = req.body;
        incidences.id = req.query.id;
        try {
            incidences.update({
                deletedAt: new Date()
            },
                {
                    where: {
                        id: {
                            [Op.eq]: incidences.id
                        },
                        deletedAt: {
                            [Op.is]: null
                        }
                    }
                });
            res.status(200).send({ success: "Incidence eliminado" });
        } catch (e) {
            console.log(e);
            LOGUtil.saveLog("delete incidence - " + e.toString());
            res.status(500).send({ error: "Error eliminando" });
        }
    };
}

const incidencesController = new IncidencesController();
export default incidencesController;