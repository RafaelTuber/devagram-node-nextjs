import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import { StoryModel } from '../../models/StoryModel';
import { SeguidorModel } from '../../models/SeguidorModel';

const StoryEndPoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if (req.method === 'GET') {
            // Deletar histórias com mais de 24 horas
            const umDiaAtras = new Date();
            umDiaAtras.setHours(umDiaAtras.getHours() - 24);
            await StoryModel.deleteMany({ data: { $lt: umDiaAtras } }); 
            /*
            * O operador $lt é um operador de comparação usado em consultas no MongoDB para verificar 
            * se um valor é menor que outro valor. No contexto da sua pergunta, onde está sendo usado 
            * data: { $lt: umDiaAtras }, isso significa que estamos buscando documentos em que o valor do campo 
            * "data" seja menor que a data umDiaAtras.
            */

            if (req?.query?.id) {
                //validadar usuario valido
                const usuario = await UsuarioModel.findById(req?.query?.id);
                if (!usuario) {
                    res.status(400).json({ erro: 'Usuario não encontrado' });
                }
                // buscar story
                const story = await StoryModel
                    .find({ idUsuario: usuario._id })
                    .sort({ data: -1 });
                return res.status(200).json(story);
            } else {
                // pegar id do usuario logado
                const { userId, storyId } = req.query;

                const usuarioLogado = await UsuarioModel.findById(userId);
                if (!usuarioLogado) {
                    return res.status(400).json({ erro: 'Usuario nao encontrado' });
                }
                // Buscar story e verificar se o usuário já visualizou
                if (storyId) {
                    const story = await StoryModel.findById(storyId);
                    if (story) {
                        if (!story.usuariosQueVisualizaram.includes(usuarioLogado._id)) {
                            await StoryModel.updateOne(
                                { _id: storyId },
                                {
                                    $inc: { contadorDeVisualizacoes: 1 },
                                    $addToSet: { usuariosQueVisualizaram: usuarioLogado._id }
                                }
                            );
                        }
                    }
                }
                //console.log(storyId);
                // pegar id dos usuarios que sigo
                const seguidores = await SeguidorModel.find({ usuarioId: userId });
                const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);
                const storys = await StoryModel.find({
                    $or: [
                        { idUsuario: usuarioLogado._id },
                        { idUsuario: seguidoresIds }
                    ],
                }).sort({ data: -1 });
                const result = [];
                for (const story of storys) {
                    const usuarioDoStory = await UsuarioModel.findById(story.idUsuario);
                    if (usuarioDoStory) {
                        const final = {
                            ...story._doc, usuario: {
                                nome: usuarioDoStory.nome,
                                avatar: usuarioDoStory.avatar
                            }
                        };
                        result.push(final);
                    }
                }
                return res.status(200).json(result);
            }
        }
        res.status(405).json({ erro: 'Metodo informado não é invalido' });
    } catch (e) {
        console.log(e);
        res.status(400).json({ erro: 'Não foi possivel carregar o Story' });
    }
};
export default validarTokenJWT(conectarMongoDB(StoryEndPoint));