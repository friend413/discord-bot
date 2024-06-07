import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { User } from '../models/userModel.js';
export const initDB = async () => {
    mongoose.connect(process.env.DATABASE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');

        User.findOne( {isAdmin: true} )
            .then(async (rlt) => {
                if( rlt != null )
                    console.log(`${rlt} admin exists already.`)
                else{
                    const admin = new User({
                        
                    });
                    User.create(admin)
                        .then(rlt => {
                            console.log(`${admin} is created as a admin.`)
                        })
                        .catch(err => {
                            console.log(`Can't create admin.`)
                            // process.exit(0);
                        })
                }
            })
            .catch(err => {
                console.log(err)
            })


    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
}