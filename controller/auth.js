const { response } = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const { generarJWT, comprobarJWT } = require('../helpers/jwt');

const crearUsario = async (req, res = response) => {
  try {
    const { email, password } = req.body;

    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        response: 'El correo ya existe',
      });
    };

    const usuario = new Usuario(req.body);
    //Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    //Guardar usuario en la BD
    await usuario.save();

    //Generar JWT
    const token = await generarJWT(usuario);

    res.json({
      token
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al guardar los datos'
    });
  };
};

const ingresar = async (req, res = response) => {


  const { email, password } = req.body;

  try {
    //Verificar si el usuario existe 
    const usuarioDB = await Usuario.findOne({ email });
    if (!usuarioDB) {
      return res.status(404).send('Revisa tus credenciales');
    };

    //Validar password
    const validarPassword = bcrypt.compareSync(password, usuarioDB.password);
    if (!validarPassword) {
      return res.status(404).send("Revisa tus credenciales");
    };

    //Generar Token 
    // const token = await generarJWT(usuarioDB.id);
    const token = await generarJWT(usuarioDB);

    res.json({
      token
    });


  } catch (error) {
    console.log(error);
    res.status(500).send('Hable con el administrador');
  }
};

//Renovar token
const nuevoToken = async (req, res = response) => {
  try {

    const t = req.body;
    const [bool, usuario] = comprobarJWT(t.token);

    //Generar nuevo token
    const token = await generarJWT(usuario);

    //Obtener el usuario por UID
    // const usuarioDB = await Usuario.findById(usuario.id);

    res.json({
      token
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: "No se encontró al usuario",
    })
  }
}

module.exports = {
  crearUsario,
  ingresar,
  nuevoToken
}