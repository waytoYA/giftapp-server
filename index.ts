import express from 'express';
import { config } from 'dotenv'
import mongoose from 'mongoose'
import { bot_start } from './bot';
// @ts-ignore
import cors from 'cors'
import router from './routes';
import { load } from './utils/mockData';
import Payment from './apps/Payment';
import Cron from './apps/Cron';
import http from 'http';
import { Server} from 'socket.io'
import socketHandler from './socket/socket'
import path from 'path';

config()

const PORT = process.env.PORT
const CLIENT_URL = process.env.CLIENT_URL

mongoose
    .connect(
        'mongodb://gen_user:29nKYL%7Cl%5C%24Ppio@94.228.117.179:27017/default_db?authSource=admin&directConnection=true'
    )
    .then(() => console.log('DB connect'))
    .catch((err) => console.log('DB error', err))

const app = express();
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(cors({ credentials: true, origin: CLIENT_URL }));
app.use('/', router)
const server = http.createServer(app);

export const io = new Server(server, {
    cors: { origin: '*' }
});
socketHandler(io)

const start = async () => {
    try{

        bot_start()

        load()
        Cron.start()

        server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`))
    } catch(e){
        console.log('Ошибка запуска ', e)
    }
}

start()