import { Router } from "express";
import IncidenceController from "../controllers/IncidencesController";
import {checkJwt} from "../middlewares/CheckJwt";
import CentersController from "../controllers/CentersController";

export class IncidenceRoutes {
    router: Router;

    constructor() {
        this.router = Router();
    }

    init() {
        /* GET ALL DOCUMENTSTYPES */
        this.router.get("/", IncidenceController.getAll);

        /* GET DOCUMENTTYPE BY ID */
        this.router.get("/:id", IncidenceController.getById);

        /* INSERT DOCUMENTTYPE */
        this.router.post("/", IncidenceController.insert);

        /* UPDATE DOCUMENTTYPE BY ID*/
        this.router.patch("/:id", IncidenceController.update);

        /* DELETE DOCUMENTTYPE BY ID*/
        this.router.delete("/:id", IncidenceController.delete);

        /* GET CENTER LAST POSITION*/
        this.router.get("/:id/last",[checkJwt], IncidenceController.getLastPosition);
    }
}

let incidencesTypesRoutes = new IncidenceRoutes();
incidencesTypesRoutes.init();
export default incidencesTypesRoutes.router;
