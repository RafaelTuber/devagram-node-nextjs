import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import { FeedModel } from '../../models/FeedModel'; // Importe o modelo apropriado para feed
import { StoryModel } from '../../models/StoryModel'; // Importe o modelo apropriado para histórias
import { ReelModel } from '../../models/ReelModel'; // Importe o modelo apropriado para reels
import { politicaCORS } from '../../middlewares/politicaCORS';

const comentarioEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        // metodo http que estaremos utilizando
        if (req.method === 'PUT') {
            // id usuario
            const { userId, idPub, type } = req.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if (!usuarioLogado) {
                return res.status(400).json({ erro: 'Usuário não encontrado' });
            }

            let publicacao;

            // Verificar o tipo (feed, story, reel)
            if (type === 'feed') {
                publicacao = await FeedModel.findById(idPub);
            } else if (type === 'story') {
                publicacao = await StoryModel.findById(idPub);
            } else if (type === 'reel') {
                publicacao = await ReelModel.findById(idPub);
            }

            if (!publicacao) {
                return res.status(400).json({ erro: 'Publicação não encontrada' });
            }

            if (!req.body || !req.body.comentario || req.body.comentario.length < 2) {
                return res.status(400).json({ erro: 'Comentário não é válido' });
            }

            const comentario = {
                usuarioId: usuarioLogado._id,
                nome: usuarioLogado.nome,
                comentario: req.body.comentario
            }

            publicacao.comentarios.push(comentario);

            // Atualize o documento apropriado com base no tipo
            if (type === 'feed') {
                await FeedModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
            } else if (type === 'story') {
                await StoryModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
            } else if (type === 'reel') {
                await ReelModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
            }

            return res.status(200).json({ msg: 'Comentário adicionado com sucesso' });
        }
        return res.status(405).json({ erro: 'Método informado não é válido' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Ocorreu erro ao adicionar comentario' });
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(comentarioEndpoint)));