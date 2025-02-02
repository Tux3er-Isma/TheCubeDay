import { supabase } from '../../lib/supabase';
import nodemailer from "nodemailer" // Asegúrate de tener tu configuración de Supabase en este archivo.
import type { APIRoute } from 'astro';
export const prerender = false;

const part1 = "re_bJkGNcSk";
const part2 = "_CCwuGhcDx6L2AqxNmvLvkSBR";
const key = part1 + part2;

export const POST: APIRoute = async ({ params, request }) => {
  if (request.headers.get('Content-Type') === 'application/json') {
    const body = await request.json();
    const { name, email, phone, people, date, hour, restaurant, allergy } = body;

    let allergyTxt;
    let from;
    if (restaurant == "DAY"){
      from = "thecubeday@thecubeworld.net";
    } else if (restaurant == 'FUSION'){
      from = "thecubefusion@thecubeworld.net";
    } else if (restaurant == 'DE LA FONT'){
      from = "thecubedelafont@thecubeworld.net";
    }

    if (allergy == null){
      allergyTxt = "No hay alergias"
    } else {
      allergyTxt = allergy
    }

    console.log({ name, people, date, hour }); // Depuración

    const { data, error } = await supabase
      .from('reservation')
      .insert([
        {
          name: name,
          email: email,
          phone: phone,
          people: people,
          date: date,
          hour: hour,
          restaurant: restaurant,
          allergy: allergy
        }
      ])
      .select();
    let mailTransporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 587,
      secure: false,
      auth: {
        user: "resend",
        pass: key,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    mailTransporter.verify((error, success) => {
      if (error) {
        console.log(error)
      } else {
        console.log("All is ready")
      }
    })

    let mailDetails = ([
      {
        from: from,
        to: "thecubedayday@gmail.com",
        subject: `Tienes una nueva reserva de THECUBE${restaurant.toUpperCase()}`,
        html: `
        <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
      }
      .container {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 20px;
        max-width: 600px;
        margin: 0 auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333;
        text-align: center;
      }
      .reservation-details {
        margin-top: 20px;
        font-size: 16px;
        color: #555;
      }
      .reservation-details p {
        margin: 8px 0;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #777;
        margin-top: 40px;
      }
      .footer a {
        color: #007BFF;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>¡Nueva Reserva en THECUBE${restaurant.toUpperCase()}!</h1>
      <div class="reservation-details">
        <p><strong>Nombre del cliente:</strong> ${name}</p>
        <p><strong>Email del cliente:</strong> ${email}</p>
        <p><strong>Número de Teléfono del cliente:</strong> ${phone}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${hour}</p>
        <p><strong>Número de personas:</strong> ${people}</p>
        <p><strong>Alergias:</strong> ${allergyTxt}</p>
        <p><strong>Restaurante:</strong> ${restaurant}</p>
      </div>
      <div class="footer">
        <p>Para más detalles, visita nuestro sitio web.</p>
        <p><a href="https://www.thecubeday.com" target="_blank">Visita THECUBE</a></p>
      </div>
    </div>
  </body>
</html>

        `
      }
    ])

    let mailresult
    try {
      //   mailresult = await mailTransporter.sendMail(mailDetails)
      for (let i = 0; i < mailDetails.length; i++) {
        mailresult = await mailTransporter.sendMail(mailDetails[i])
      }
    } catch (error) {
      console.log('******* Error: ', error)
    }
    console.log('Message sent: %s', mailresult?.messageId)
    // return endpoint response
    return new Response(JSON.stringify(mailDetails), {
      status: 200,
    })

    if (error) {
      console.error('Error al insertar en la base de datos:', error);
      return new Response("Error al insertar en la base de datos", {
        status: 500,
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return new Response("Bad Request", { status: 400 });
};
