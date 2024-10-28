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
    req.body.activo = true;
    const usuario = new Usuario(req.body);
    //Encriptar contraseña
    const salt = bcrypt.genSaltSync(5);
    usuario.password = bcrypt.hashSync(password, salt);
    //Guardar usuario en la BD
    await usuario.save();
    //Generar JWT
    // const token = await generarJWT(usuario);

    // res.json({
    //   token
    // })
    res.send('Usuario creado');

  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al crear nuevo usuario'
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
    res.json({
      token
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: "No se encontró al usuario",
    });
  };
};

const actualizarUsuario =async (req, res = response) => {
  try {
    const {nombre, password, email, rol, activo} = req.body;
    //Encriptar contraseña
    const salt = bcrypt.genSaltSync(5);
    const newPassword = bcrypt.hashSync(password, salt);

    //Actualizar usuario
    const actUsuario = await Usuario.findOneAndUpdate({email}, {nombre, password:newPassword, email, rol, activo}, {new:true});
    if (actUsuario) {
      return res.json({
        actualizado:true,
        nombre:actUsuario.nombre
      });
    }
    return res.json({
      actualizado:false,
    });
  } catch (error) {
    res.status(500).json({
      response: "No se actualizó el usuario",
    });
  }
}

module.exports = {
  crearUsario,
  ingresar,
  nuevoToken,
  actualizarUsuario,
}