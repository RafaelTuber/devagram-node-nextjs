import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from "../../models/UsuarioModel";
import { SeguidorModel } from "../../models/SeguidorModel";
import { politicaCORS } from "../../middlewares/politicaCORS";

const endPointSeguir = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        if (req.method === 'PUT') {
            //id do usuario vindo do token = usuario logado/autenticado = quem esta fazendo as açoes
            const { userId, id } = req?.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if (!usuarioLogado) {
                return res.status(400).json({ erro: 'Usuario logado nao encontrado' });
            }
            // e qual a outra informaçao e onde ela vem ?
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if (!usuarioASerSeguido) {
                return res.status(400).json({ erro: 'Usuario a ser seguido nao encontrado' })
            }
            // buscar se EU LOGADO sigo ou nao esse usuario
            const euJaSigoEsseUsuario = await SeguidorModel
                .find({ usuarioId: usuarioLogado._id, usuarioSeguidoId: usuarioASerSeguido._id });
            if (euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0) {
                // sinal que eu ja sigo esse usuario
                euJaSigoEsseUsuario.forEach(async (e: any) =>
                    await SeguidorModel.findByIdAndDelete({ _id: e._id }));

                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({ _id: usuarioLogado._id }, usuarioLogado);
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({ _id: usuarioASerSeguido._id }, usuarioASerSeguido);

                return res.status(200).json({ msg: 'Deixou de seguir o usuario com sucesso' });
            } else {
                // sinal q eu nao sigo esse usuario
                const seguidor = {
                    usuarioId: usuarioLogado._id,
                    usuarioSeguidoId: usuarioASerSeguido._id
                };
                await SeguidorModel.create(seguidor);

                // adicionar um seguindo no usuario logado
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({ _id: usuarioLogado._id }, usuarioLogado);

                // adicionar um seguidor no usuario seguido
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({ _id: usuarioASerSeguido._id }, usuarioASerSeguido);

                return res.status(200).json({ msg: 'Usuario seguido com sucesso' });
            }
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Nao foi possivel seguir / Deseguir o usuario informado' });
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(endPointSeguir)));