import type {  NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import nc from 'next-connect';
import {upload, uploadImagemCosmic} from '../../services/uploadImagemCosmic';
import { conectarMongoDB } from '@/middlewares/conectarMongoDB';
import { validarTokenJWT } from '@/middlewares/validarTokenJWT';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { UsuarioModel } from '../../models/UsuarioModel';


const handler = nc()
    .use(upload.single('file'))
    .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
        try {
            const {userId } = req.query;
            console.log('IDENTIFICAÇÃO DO USUARIO >>>>>>>>>> ', userId);
            const usuario = await UsuarioModel.findById(userId );
            if(!usuario){
                return res.status(400).json({erro: 'usuario não encontrado'});
            }
            if(!req || !req.body){
                return res.status(400).json({erro: 'Parametros de entrada não informado'});
            }
            const {descricao} = req.body;
            if(!descricao || descricao.length < 2){
                return res.status(400).json({erro: 'Descrição não é valida'});
            }
            if(!req.file || !req.file.originalname){
                return res.status(400).json({erro: 'imagem é Obrigatoria'});
            }

            const image = await uploadImagemCosmic(req);
            // salvar no banco de dados
            const publicacao = {
                idUsuario : usuario._id,
                descricao,
                foto : image.media.url,
                data: new Date()
            }
            await PublicacaoModel.create(publicacao);
            return res.status(200).json({msg: 'Publicação criada com sucesso'});
        } catch (e) {
            console.log(e);     
            return res.status(500).json({ erro: 'Erro ao criar publicação' });
        }
    });

    export const config = {
        api: {
            bodyParser: false
        }
    }

    export default validarTokenJWT(conectarMongoDB(handler));