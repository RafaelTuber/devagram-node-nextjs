import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { ReelModel } from '../../models/ReelModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';

const ReelEndPoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if (req.method === 'GET') {
            const { userId, reelId } = req.query;

            // Buscar o usuário logado
            const usuarioLogado = await UsuarioModel.findById(userId);
            if (!usuarioLogado) {
                return res.status(400).json({ erro: 'Usuário não encontrado' });
            }

            // Buscar e verificar reel do ID fornecido
            if (reelId) {
                const reel = await ReelModel.findById(reelId);
                if (reel) {
                    // Verificar se o usuário logado já visualizou o reel
                    if (!reel.usuariosQueVisualizaram.includes(usuarioLogado._id)) {
                        await ReelModel.updateOne(
                            { _id: reelId },
                            {
                                $inc: { contadorDeVisualizacoes: 1 },
                                $addToSet: { usuariosQueVisualizaram: usuarioLogado._id }
                            }
                        );
                    }
                }
            }

            // Buscar todos os reels e formatar resultados
            const reels = await ReelModel.find().sort({ data: -1 });
            // Use tipos apropriados se disponíveis
            const result: { reel: any, usuario: any }[] = []; 
            for (const reel of reels) {
                const usuarioDoReel = await UsuarioModel.findById(reel.idUsuario);
                if (usuarioDoReel) {
                    const final = {
                        reel: reel,
                        usuario: {
                            nome: usuarioDoReel.nome,
                            avatar: usuarioDoReel.avatar
                        }
                    };
                    result.push(final);
                }
            }
            return res.status(200).json(result);
        }
        res.status(405).json({ erro: 'Método informado não é válido' });
    } catch (e) {
        console.log(e);
        res.status(400).json({ erro: 'Não foi possível carregar os Reels' });
    }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(ReelEndPoint)));