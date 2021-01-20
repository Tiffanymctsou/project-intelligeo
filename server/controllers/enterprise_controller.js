require("dotenv").config();
const salt = parseInt(process.env.BCRYPT_SALT);
const secret = process.env.JWT_SECRET;
const expire = process.env.TOKEN_EXPIRE;
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const inLineCss = require("nodemailer-juice");
const Util = require("../../util/util");
const Enterprise = require("../models/enterprise_model");

const registerEnterprise = async (req, res) => {
    const domain = req.get("host");
    const { company, fullname, email } = req.body;
    if (!company || !fullname || !email) {
        res.status(400).send({ error: "Request Error: missing info." });
        return;
    }

    if (!validator.isEmail(email)) {
        res.status(400).send({ error: "Request Error: Invalid email format." });
        return;
    }

    const enterprise = await Enterprise.registerEnterprise(
        company,
        fullname,
        email
    );
    if (enterprise.error) {
        res.status(403).send({ error: enterprise.error });
        return;
    }

    const mailOptions = {
        from: "intelligeo TW <no-reply@gmail.com>",
        to: `${enterprise.fullname} <${enterprise.email}>`,
        cc: "intelligeo.tw@gmail.com",
        subject: "完成您的密碼設置",
        html: await sendMailContent(
            enterprise.fullname,
            domain,
            enterprise.id,
            enterprise.email
        ),
    };
    Util.transporter.use("compile", inLineCss());
    Util.transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            return console.log(err);
        }
        return console.log("Email sent: " + info.response);
    });
    res.status(200).send(enterprise);
};

const verifySetting = async (req, res) => {
    const { id, uid } = req.query;
    const result = await Enterprise.verifySetting(id, uid);
    console.log(result);
    if (result.error) {
        res.status(403).send({ error: result.error });
        return;
    }
    res.status(200).send({ msg: result.msg });
};

const setAccount = async (req, res) => {
    const { id } = req.query;
    const { password } = req.body;
    const result = await Enterprise.setAccount(id, password);

    res.status(200).send({ msg: result.msg });
};

const verifyToken = async (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");
    jwt.verify(token, secret, (err) => {
        if (err) {
            res.status(403).send({ msg: err.message });
        }
        next();
    });
};

const nativeLogin = async (req, res) => {
    const { email, password } = req.body;
    const result = await Enterprise.nativeLogin(email, password, expire);
    if (result.error) {
        console.log(result.error);
        res.status(403).send(result.error);
        return;
    }
    res.status(200).send({ data: result });
};

const sendMailContent = async (name, domain, id, email) => {
    const hashedEmail = bcrypt.hashSync(email, salt);
    return `
    <html>
    <head>
    <style>
    .content {
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: #fff;
        background-clip: border-box;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-radius: 0.25rem;
      }
      
      .content-body {
        flex: 1 1 auto;
        padding: 1.25rem;
        /* display: block;
          overflow: auto; */
      }
      
      .content .content-body {
        padding: 1.88rem 1.81rem;
      }
    </style>
    </head>
    
    <body>
      <div class="content">
        <div class="content-body">
          <h3>嗨， ${name}</h3>
          <p>感謝您使用 Intelligeo 營銷管理平台！</p>
          <p>請您點擊以下連結設置您的密碼：</p>
          <p class="strong">https://${domain}/setting.html?id=${id}&uid=${hashedEmail}</p>
			<div class="logo">
                <a href="https://intelligeo.online"><img src="https://d2vlwc6o9qpx5r.cloudfront.net/images/admin/logo-1.png" width="200px"/></a>
        	</div>
		</div>
    </body>
</html>
    `;
};

module.exports = {
    registerEnterprise,
    verifySetting,
    verifyToken,
    setAccount,
    nativeLogin,
};
