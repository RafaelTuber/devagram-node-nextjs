import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { ReelModel } from '../../models/ReelModel';
import { FeedModel } from '../../models/FeedModel';
import { StoryModel } from '../../models/StoryModel';
import { UsuarioModel } from "../../models/UsuarioModel";

const likeEndPoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        //metodo http
        if (req.method === 'PUT') {
            const { id, type, userId } = req.query;

            let model;
            let campoLikes;

            if (type === 'reel') {
                model = ReelModel;
                campoLikes = 'reels';
            } else if (type === 'feed') {
                model = FeedModel;
                campoLikes = 'feeds';
            } else if (type === 'story') {
                model = StoryModel;
                campoLikes = 'storys';
            } else {
                return res.status(400).json({ erro: 'Tipo de item inválido' });
            }

            const item = await model.findById(id);

            if (!item) {
                return res.status(400).json({ erro: 'Item não encontrado' });
            }

            const usuario = await UsuarioModel.findById(userId);

            if (!usuario) {
                return res.status(400).json({ erro: 'Usuário não encontrado' });
            }

            const indexDoUsuarioNoLike = item.likes.findIndex((e: any) => e.toString() === usuario._id.toString());

            if (indexDoUsuarioNoLike !== -1) {
                item.likes.splice(indexDoUsuarioNoLike, 1);
                await model.findByIdAndUpdate({ _id: id }, item);
                return res.status(200).json({ msg: 'Item descurtido com sucesso' });
            } else {
                item.likes.push(usuario._id);
                await model.findByIdAndUpdate({ _id: id }, item);
                return res.status(200).json({ msg: 'Item curtido com sucesso' });
            }
        }
        return res.status(405).json({ erro: 'Método informado inválido' });
    } catch (e) {
        console.log(e);
        return res.status(400).json({ erro: 'Ocorreu erro ao curtir/descurtir uma publicação' });
    }
}

export default validarTokenJWT(conectarMongoDB(likeEndPoint));