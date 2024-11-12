import Gift from "../models/Gift"
import User from "../models/User"

const gifts = [
    {
        name: 'Delicious Cake',
        amount: 10,
        currency: 'USDT',
        purchased: 3,
        quantity: 500,
    },
    {
        name: 'Green Star',
        amount: 5,
        currency: 'TON',
        purchased: 802,
        quantity: 3000,
    },
    {
        name: 'Blue Star',
        amount: 0.01,
        currency: 'ETH',
        purchased: 458,
        quantity: 5000,
    },
    {
        name: 'Red Star',
        amount: 7,
        currency: 'USDT',
        purchased: 10000,
        quantity: 10000,
    }
]

const users = [
    {
        tgId: '18544135493549545321',
        name: 'Clara',
        image: 'https://images.wallpaperscraft.ru/image/single/galstuk_pidzhak_art_123005_2560x1600.jpg'
    },
    {
        tgId: '1854413549354921173',
        name: 'Bob',
        image: 'https://avatars.mds.yandex.net/i?id=d486510b1f897acdf11ca6cc4c1ec8777caca8c3-9845553-images-thumbs&n=13'
    },
    {
        tgId: '2854413549354999987',
        name: 'Elon Musk',
        image: 'https://yt3.googleusercontent.com/ytc/AGIKgqP4nBW6ZJEZu789dHYtzddAl6gBYPYOChnvmsKf=s900-c-k-c0x00ffffff-no-rj'
    },
    {
        tgId: '285441354935412345',
        name: 'Alicia',
        image: 'https://i.pinimg.com/564x/5f/37/55/5f3755bf6a5e357ccac117098ce1427c.jpg'
    },
    {
        tgId: '285441354935234576',
        name: 'Jonnie',
        image: 'https://i.pinimg.com/474x/5e/3b/88/5e3b88f41fe6eab16e323cc29eedd102.jpg'
    },
    {
        tgId: '2854413549354943333',
        name: 'Tom Shelby',
        image: 'https://i.pinimg.com/236x/c0/56/2b/c0562b0ba13c17a58396156c5c5ffc97.jpg'
    },
    {
        tgId: '285441354935494444444',
        name: 'Barbi',
        image: 'https://i.pinimg.com/236x/44/c9/1e/44c91eb3020af65d318e89c79cbd7c77.jpg'
    },
    {
        tgId: '28544135493549455555',
        name: 'Artem UI',
        image: 'https://i.pinimg.com/736x/fe/62/9e/fe629e8e9cba7e9f885cf1068ff3c1e4.jpg'
    },
    {
        tgId: '28544135493549777777',
        name: 'Maria',
        image: 'https://i.pinimg.com/236x/7b/2a/eb/7b2aeb65798db7472bf23dd47834e6aa.jpg'
    },
    {
        tgId: '2854413549354988888',
        name: 'Claid',
        image: 'https://i.pinimg.com/236x/0f/00/b5/0f00b5639744953a74b52c15f350f2b2.jpg'
    },
]

export const load = async () => {
    for (let gift of gifts) {
        const already_create = await Gift.findOne({name: gift.name})
        
        if (already_create) continue
        
        await Gift.create({
            ...gift
        })
    }
    for (let user of users) {
        const already_create = await User.findOne({tgId: user.tgId})
        
        if (already_create) continue
        
        await User.create({
            ...user
        })
    }
}