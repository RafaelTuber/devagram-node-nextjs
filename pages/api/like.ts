import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from "../../models/UsuarioModel";
import { PublicacaoModel } from "../../models/PublicacaoModel";

const likeEndPoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        //metodo http
        if (req.method === 'PUT') {
            //pegar id publicação
            const { id } = req.query;
            //console.log('ID PUBLICACAO =============', id);

            const publicacao = await PublicacaoModel.findById(id);
            //console.log('PUBLICACAO =============', publicacao);

            if (!id) {
                return res.status(400).json({ erro: 'Publicação não encontrada' });
            }

            // pegar id do usuario
            const { userId } = req.query;
            const usuario = await UsuarioModel.findById(userId);
            //console.log('USUARIO =============', publicacao);
            if (!usuario) {
                return res.status(400).json({ erro: 'Usuario não encontrado' });
            }

            // buscar array de likes na publicação
            // se o index for -1 sinal que ele nao curtiu a publicacao
            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e : any) => e.toString() === usuario._id.toString());
            //console.log('INDEX USUARIO NO LIKE =============', indexDoUsuarioNoLike);
            // se o index for > -1 sinal q ele ja curte a foto
            if(indexDoUsuarioNoLike != -1){
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicacao descurtida com sucesso'});
            }else {
                // se o index for -1 sinal q ele nao curte a foto
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicacao curtida com sucesso'});
            }
        }
        return res.status(405).json({ erro: 'Metodo informado invalido' });
    } catch (e) {
        console.log(e);
        return res.status(400).json({ erro: 'Ocorreu erro ao curtir/descurtir uma publicação' });
    }
}

export default validarTokenJWT(conectarMongoDB(likeEndPoint));