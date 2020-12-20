require('dotenv').config();
const nodemailer = require('nodemailer');


const wrapAsync = (fn) => {
    return function (req, res, next) {
        // Make sure to `.catch()` any errors and pass them along to the `next()`
        // middleware in the chain, in this case the error handler.
        fn(req, res, next).catch(next);
    };
};

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PWD,
    },
});

const money = new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: 0
})

module.exports = {
    wrapAsync,
    transporter,
    money
}