module.exports = function (db) {
    const express = require('express');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const Message = require('../models/Message');
    const passport = require('passport');
    require('../config/passport');
    const router = express.Router();

    router.post('/register', async (req, res) => {
        const {email, password} = req.body;
        const user = new User({email, password});
        await user.save();
        res.json({message: 'User registered successfully'});
    });

    router.post('/login', async (req, res) => {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
        const token = jwt.sign({id: user.id, email: user.email}, 'your_jwt_secret', {expiresIn: '1h'});
        res.json({token});
    });

    router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res) => {
        res.json(req.user);
    });


    router.get('/users', passport.authenticate('jwt', {session: false}),async (req, res) => {
        try {
            const users = await User.find().select('email');
            res.send(users);
        } catch (err) {
            res.status(500).send({message: 'Error retrieving users'});
        }
    });

    return router;
};