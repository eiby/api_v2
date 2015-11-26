/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 13-6-19
 * Time: 下午3:24
 * To change this template use File | Settings | File Templates.
 */
var nodemailer = require("nodemailer");

exports.sendMail = function(from, to, subject, text, html, callback){

// create reusable transport method (opens pool of SMTP connections)
    var smtpTransport = nodemailer.createTransport("SMTP",{
        host: "smtp.exmail.qq.com", // hostname
        secureConnection: true, // use SSL
        port: 465, // port for secure SMTP
        auth: {
            user: "service_noreply@bibibaba.cn",
            pass: "wisegps@345"
        }
    });

// setup e-mail data with unicode symbols
    var mailOptions = {
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plaintext body
        html: html // html body
    };

// send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        callback(error, response);

        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
};
