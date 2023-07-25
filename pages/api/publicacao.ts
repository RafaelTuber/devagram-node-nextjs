import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import nc from 'next-connect';
import { upload, uploadMidiaCosmic } from '../../services/uploadMidiaCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { FeedModel } from '../../models/FeedModel';
import { ReelModel } from '../../models/ReelModel';
import { StoryModel } from '../../models/StoryModel';
import { UsuarioModel } from '../../models/UsuarioModel';


const handler = nc()
    .use(upload.single('file'))
    .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
        try {

            const { userId } = req.query;
            ///console.log('IDENTIFICAÇÃO DO USUARIO >>>>>>>>>> ', userId);
            const usuario = await UsuarioModel.findById(userId);
            if (!usuario) {
                return res.status(400).json({ erro: 'usuario não encontrado' });
            }
            if (!req || !req.body) {
                return res.status(400).json({ erro: 'Parametros de entrada não informado' });
            }
            const type = req.body.type;

            //console.log('Tipo Indentificado  >>>>>>>>>> ', type);

            if (type === 'feed') {

                const { descricao } = req.body;
                if (!descricao || descricao.length < 2) {
                    return res.status(400).json({ erro: 'Descrição não é valida' });
                }
                if (!req.file || req.file.originalname.includes('.mp4')) {
                    return res.status(400).json({ erro: 'Midia é obrigatoria png, jpg ou jpeg' });
                }

                const midiaFeed = await uploadMidiaCosmic(req);
                // salvar no banco de dados
                const publicacaoFeed = {
                    idUsuario: usuario._id,
                    descricao,
                    foto: midiaFeed.media.url,
                    data: new Date()
                }
                usuario.publicacoes++;
                await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

                await FeedModel.create(publicacaoFeed);

                return res.status(200).json({ msg: 'Publicação criada com sucesso' });

            } if (type === 'story') {
                if (!req.file || !req.file.originalname) {
                    return res.status(400).json({ erro: 'Midia é Obrigatoria' });
                }

                const MidiaStory = await uploadMidiaCosmic(req);
                // salvar no banco de dados
                const story = {
                    idUsuario: usuario._id,
                    midia: MidiaStory.media.url,
                    data: new Date(),
                }
                usuario.storys++;
                await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

                await StoryModel.create(story);

                res.status(200).json({ msg: 'Você selecionou Story. criada com sucesso' });
            } if (type === 'reel') {
                const { descricao } = req.body;
                if (!descricao || descricao.length < 2) {
                    return res.status(400).json({ erro: 'Descrição não é valida' });
                }
                if (!req.file || !req.file.originalname.includes('.mp4')) {
                    return res.status(400).json({ erro: 'Somente arquivos de video mp4 é aceito' });
                }

                const midiaFeed = await uploadMidiaCosmic(req);
                // salvar no banco de dados
                const Reel = {
                    idUsuario: usuario._id,
                    descricao,
                    video: midiaFeed.media.url,
                    data: new Date()
                }
                usuario.reels++;
                await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

                await ReelModel.create(Reel);
                res.status(200).json({ msg: 'Reel Criado com sucesso!' });
            }
            res.status(400).json({ msg: 'Opção inválida!' });
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