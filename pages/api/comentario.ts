import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import { FeedModel } from '../../models/FeedModel';

const comentarioEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        // metodo http que estaremos utilizando
        if(req.method === 'PUT'){
            // id usuario
            const {userId, id} = req.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuario nao encontrado'});
            }
            // id publicacao
            const publicacao =  await FeedModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro : 'Publicacao nao encontrada'});
            }
            // id comentario
            if(!req.body || !req.body.comentario
                || req.body.comentario.length < 2){
                return res.status(400).json({erro : 'Comentario nao e valido'});
            }

            const comentario = {
                usuarioId : usuarioLogado._id,
                nome : usuarioLogado.nome,
                comentario : req.body.comentario
            }

            publicacao.comentarios.push(comentario);
            await FeedModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
            return res.status(200).json({msg : 'Comentario adicionado com sucesso'});
        }
        return res.status(405).json({ erro: 'Metodo informado nao é valido' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({erro : 'Ocorreu erro ao adicionar comentario'});
    }
}

export default validarTokenJWT(conectarMongoDB(comentarioEndpoint));