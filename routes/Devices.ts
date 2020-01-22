import {Router} from "express";
import DeviceController from "../controllers/DeviceController";
import {checkJwt} from "../middlewares/CheckJwt";

export class DeviceRoutes {
    router: Router;

    constructor() {
        this.router = Router();
    }

    init() {
        /* GET ALL DEVICES */
        this.router.get("/", [checkJwt], DeviceController.getAll);

        /* GET DEVICE BY ID */
        this.router.get("/:id", [checkJwt], DeviceController.getDeviceById);

        /* INSERT DEVICE*/
        this.router.post("/", [checkJwt], DeviceController.insertDevice);

        /* UPDATE DEVICE BY ID*/
        this.router.patch("/:id", [checkJwt], DeviceController.updateDevice);

        /* DELETE DEVICE BY ID*/
        this.router.delete("/:id", [checkJwt], DeviceController.deleteDevice);
    }
}

let deviceRoutes = new DeviceRoutes();
deviceRoutes.init();
export default deviceRoutes.router;