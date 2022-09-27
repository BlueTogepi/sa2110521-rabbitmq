const client = require("./client");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("views",path.join(__dirname,"views"));
app.set("view engine","hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    client.getAllMenu(null,(err,data)=>{
        if(!err){
            res.render("menu",{
                results: data.menu
            });
        }
    });
});

var amqp = require('amqplib/callback_api');

const routing = {
    "Tomyam Gung": "Thai",
    "Somtam": "Thai",
    "Pad-Thai": "Thai",
    "Kai-Jiew": "Thai",
    "Kraprao": "Thai",
    "Fried rice": "Thai",
    "Sukiyaki": "Thai",
    "Fried egg": "Thai",
    "Fried chicken": "Thai",
    "Hawaiian pizza": "Italian",
    "Vanilla icecream": "dessert",
    "Chang": "drink"
}

app.post("/placeorder", (req, res) => {
    var orderItem = {
		id: req.body.id,
		name: req.body.name,
		quantity: req.body.quantity,
	};

    // Send the order msg to RabbitMQ 
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            // var queue = 'order_queue';
            // channel.assertQueue(queue, {
            //     durable: true
            // });
            // channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderItem)), {
            //     persistent: true
            // });
            const exchange = "";
            const routingKey = routing[orderItem.name]
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(orderItem)), { persistent: true });
            console.log(" [x] Sent '%s'", orderItem);
        });
    });

    res.redirect("/");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log("Server running at port %d",PORT);
});