//Code detailing the app's routes including requests to Primer api

import app from 'express';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const router = app.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const webshop = path.join(__dirname, "../","views", "webshop.html");

//Define the app required credentials
const API_KEY = process.env.API_KEY;
const PRIMER_API_URL = process.env.PRIMER_API_URL;

//Create the order reference
const today = new Date();
const time = today.getFullYear() + "" + (today.getMonth()+1) + "" + today.getDate() + "_" + today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
const orderId = "orderId" + time;

var paymentid;

//Route to display webshop html page
router.get("/", (req, res) => {

  return res.sendFile(webshop);
});

//Route to request client token against Primer api
router.post("/client-token", async (req, res) => {

    const url = `${PRIMER_API_URL}/client-session`;

    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
        "X-Api-Version": "2021-10-19"
      },
      body: JSON.stringify({
        amount: 31000,
        currencyCode: "EUR",
        orderId: orderId,
        customer: {
          emailAddress: "alemail@mail.com",
          billingAddress: {
            firstName: "Al",
            lastName: "Dal",
            addressLine1: "1 rue de Paris",
            city: "Paris",
            countryCode: "FR",
            postalCode: "75001"
          }
        },
        order: {
          shipping: {
            amount: 1000
          }
        }
      })
    });
  
    const json = await response.json();
  
    return res.send(json);
  });
  
  //Route to request payment authorization against Primer api
  router.post("/authorize", async (req, res) => {
    const { token } = req.body;
    const url = `${PRIMER_API_URL}/payments`;
  
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
        "X-Api-Version": "2021-09-27",
        "Idempotency-Key": orderId,
      },
      body: JSON.stringify({
        paymentMethodToken: token
      }),
    });
    
    const json = await response.json();

    paymentid = json.id;
  
    return res.send(json);
  });

  //Route to request payment resume against Primer api when 3DS happened
  router.post("/resume", async (req, res) => {
    const {resumeToken} = req.body;
 
    const url = `${PRIMER_API_URL}/payments/${paymentid}/resume`;
  
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
        "X-Api-Version": "2021-09-27"
      },
      body: JSON.stringify({
        resumeToken: resumeToken
      }),
    });
    
    const json = await response.json();
  
    return res.send(json);
  });

export default router;
  