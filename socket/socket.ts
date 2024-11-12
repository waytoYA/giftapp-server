import { Server, Socket } from 'socket.io';
import Purchases from '../models/Purchases';
import socketAuthMiddleware from '../middlewares/socketAuthMiddleware';
import Account from '../apps/Account';
import Delivery from '../models/Delivery';

interface AuthenticatedSocket extends Socket {
    user?: {
        _id: string
    };
}

// \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\
// As someone once said: you don't have to be Sherlock to find something not obvious 😏 
// https://www.youtube.com/watch?v=dQw4w9WgXcQ
// \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\

export default (io: Server) => {
    io.use(socketAuthMiddleware);

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log('[socket connect]', socket.id);

        Purchases
            .watch()
            .on('change', async (change) => {
                if (
                    change.operationType == 'insert' && 
                    socket.user &&
                    change.fullDocument.user.toString() == socket.user._id.toString()
                ) {
                    const history = await Account.getHistory(socket.user._id)
                    socket.emit('getHistory', history);
                }
            })

        Delivery
            .watch()
            .on('change', async (change) => {
                if (
                    change.operationType == 'insert' && 
                    socket.user &&
                    (
                        change.fullDocument.to?.toString() == socket.user._id.toString() ||
                        change.fullDocument.from?.toString() == socket.user._id.toString()
                    )
                ) {
                    const history = await Account.getHistory(socket.user._id)
                    socket.emit('getHistory', history);
                }
            })

        socket.on('getHistory', async (data: any) => {
            try {
                if (!socket.user) return []
                const history = await Account.getHistory(socket.user._id)
                socket.emit('getHistory', history);
            } catch (error) {
                console.error('Ошибка:', error);
            }
        });
        
        socket.on('disconnect', () => {
            console.log('[socket disconnect]', socket.id);
        });

    });
}