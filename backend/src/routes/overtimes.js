import express from 'express';
import db from '../../modules/db.js';

const route = express.Router();

route.get(['/getovertimes/', '/getovertimes/:limitparam'], (req, res) => {
    const { limitparam } = req.params();
    let limit;
    if (limit = Number(limitparam)) {
        res.status(200).send(limit);
    }
});


export default route;
