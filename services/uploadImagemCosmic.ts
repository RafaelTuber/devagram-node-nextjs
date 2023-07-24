import multer from "multer";
import cosmicjs from "cosmicjs";

const {
    CHAVE_GRAVACAO_AVATARES,
    CHAVE_GRAVACAO_PUBLICACOES,
    BUCKET_AVATARES,
    BUCKET_PUBLICACOES } = process.env;

const Cosmic = cosmicjs();
const bucketAvatares = Cosmic.bucket({
    slug: BUCKET_AVATARES,
    write_key: CHAVE_GRAVACAO_AVATARES
});

const bucketPublicacoes = Cosmic.bucket({
    slug: BUCKET_PUBLICACOES,
    write_key: CHAVE_GRAVACAO_PUBLICACOES
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImagemCosmic = async (req: any) => {
    //teste
    //console.log('uploadImagemCosmic upload imagemm', req.body);
    if (req?.file?.originalname) {

        if (!req.file.originalname.includes('.png') &&
            !req.file.originalname.includes('.jpg') &&
            !req.file.originalname.includes('.jpeg')) {
                throw new Error('Extensão da imagem invalida');
        }
        const media_object = {
            originalname: req.file.originalname,
            buffer: req.file.buffer
        };
        //teste
        //console.log('uploadImagemCosmic url ', req.url);
        //console.log('uploadImagemCosmic media_object ', media_object);
        if (req.url && req.url.includes('publicacao')) {
            return await bucketPublicacoes.addMedia({ media: media_object, folder: 'feeds' });
        } else {
            return await bucketAvatares.addMedia({ media: media_object });
        }

    }
}

export { upload, uploadImagemCosmic };