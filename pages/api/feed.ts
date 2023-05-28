import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import publicacao from './publicacao';

const feedEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if (req.method === 'GET') {
            // informação do id do usuario
            //buscar o feed
            if (req.query.id) {
                //validadar usuario valido
                const usuario = await UsuarioModel.findById(req.query.id);
                if (!usuario) {
                    res.status(400).json({ erro: 'Usuario não encontrado' });
                }
                // buscar publicacoes
                const publicacoes = await PublicacaoModel
                .find({idUsuario : usuario._id})
                .sort({data: -1});
                return res.status(200).json(publicacoes);
            }
        }
        res.status(405).json({ erro: 'Metodo informado não é invalido' });
    } catch (e) {
        console.log(e);
        res.status(400).json({ erro: 'Não foi possivel carregar o feed' });
    }
};

export default validarTokenJWT(conectarMongoDB(feedEndpoint));