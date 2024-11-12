import axios from 'axios'
import { Request, Response, NextFunction } from 'express';
import Account from '../apps/Account';
import apiError from 'http-errors'
import User from '../models/User';
import { validate, parse } from '@telegram-apps/init-data-node';
import { InitData } from '@telegram-apps/types';
import Gift from '../models/Gift';
import Purchases from '../models/Purchases';
import { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
    user?: object;
}

export default async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try{
        const authData = socket.handshake.auth.token;

        validate(
            authData,
            process.env.BOT_TOKEN as string,
            { expiresIn: 36000 }
        );

        const userData = parse(authData) as InitData

        const tgId = String(userData?.user?.id)
        const userName = String(userData?.user?.firstName)
        const user = await User.findOne({ tgId: tgId }).lean()

        if (user) {
            socket.user = user
            next()
        } else {
            const newUser = await Account.createUser({ tgId, userName }) as any
            socket.user = newUser
            next()
        }

    } catch(e){
        return next(apiError(500, 'error'))
    }
}