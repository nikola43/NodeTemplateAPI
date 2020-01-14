import {Request, Response, Router} from "express";
import AuthController from "../auth/AuthController";

export class IndexRoutes {
    router: Router;

    constructor() {
        this.router = Router();
    }

    init() {
        /* GET home page. */
        this.router.get('/', function (req: Request, res: Response, next: any) {
            res.render('index', {title: 'Express'});
        });

        /* GET home page. */
        this.router.post('/login', AuthController.login);

        /* GET home page. */
        this.router.get('/signup', function (req: Request, res: Response, next: any) {
            res.status(200).send("login");
        });
    }
}

let indexRoutes = new IndexRoutes();
indexRoutes.init();
export default indexRoutes.router;