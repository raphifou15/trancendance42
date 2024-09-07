"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
    }));
    app.enableCors({
        credentials: true,
        origin: [
            'http://' + process.env.HOST + ':9999',
            'http://' + process.env.HOST + ':3000',
        ],
    });
    app.use((0, cookie_parser_1.default)());
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://' + process.env.HOST + ':9999');
        next();
    });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map