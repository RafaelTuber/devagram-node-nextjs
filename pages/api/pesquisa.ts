import { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from "../../models/UsuarioModel";
import nc from 'next-connect';
import usuario from "./usuario";

const pesquisaEndPoint
    = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
        try {
            if (req.method === 'GET') {
                if (req.query.id) {
                    const usuarioEncontrado = await UsuarioModel.findById(req.query.id);
                    if (!usuarioEncontrado) {
                        res.status(400).json({ erro: 'Usuario não encontrado' });
                    }
                    usuarioEncontrado.senha = null;
                    return res.status(200).json(usuarioEncontrado);
                } else {
                    const { filtro } = req.query;
                    //buscar nome pelo filtro
                    // ou buscar email
                    if (!filtro || filtro.length < 2) {
                        return res.status(400).json({ erro: 'Favor informar 2 caracteres para a busca ' });
                    }
                    const usuarioEncontrados = await UsuarioModel.find({                        
                        $or: [{ nome: { $regex: filtro, $options: 'i' } },
                        { email: { $regex: filtro, $options: 'i' } }]                        
                    });
                    return res.status(200).json(usuarioEncontrados);
                }
            }
            return res.status(405).json({ erro: 'Metodo informado nao e valido ' });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ erro: 'Não foi possivel buscar usuarios: ' + e });
        }
    }

export default validarTokenJWT(conectarMongoDB(pesquisaEndPoint));