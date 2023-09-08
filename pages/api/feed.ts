import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import { FeedModel } from '../../models/FeedModel';
import { SeguidorModel } from '../../models/SeguidorModel';
import { politicaCORS } from '../../middlewares/politicaCORS';

const feedEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if (req.method === 'GET') {
            // informação do id do usuario
            //buscar o feed
            if (req?.query?.id) {
                //validadar usuario valido
                const usuario = await UsuarioModel.findById(req?.query?.id);
                if (!usuario) {
                    res.status(400).json({ erro: 'Usuario não encontrado' });
                }
                // buscar publicacoes
                const publicacoes = await FeedModel
                    .find({ idUsuario: usuario._id })
                    .sort({ data: -1 });
                return res.status(200).json(publicacoes);
            } else {
                // pegar id do usuario logado
                const { userId } = req.query;
                const usuarioLogado = await UsuarioModel.findById(userId);
                if (!usuarioLogado) {
                    return res.status(400).json({ erro: 'Usuario nao encontrado' });
                }

                // pegar id dos usuarios que sigo
                const seguidores = await SeguidorModel.find({ usuarioId: userId });
                const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);
                const publicacoes = await FeedModel.find({
                    $or: [
                        { idUsuario: usuarioLogado._id },
                        { idUsuario: seguidoresIds }
                    ],
                }).sort({ data: -1 });
                const result = [];
                for (const publicacao of publicacoes) {
                    const usuarioDaPublicacao = await UsuarioModel.findById( publicacao.idUsuario );
                    if (usuarioDaPublicacao) {
                        const final = {
                            ...publicacao._doc, usuario: {
                                nome: usuarioDaPublicacao.nome,
                                avatar: usuarioDaPublicacao.avatar
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
        res.status(400).json({ erro: 'Não foi possivel carregar o feed' });
    }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));