import multer from "multer";
/* import cosmicjs from "cosmicjs"; OLD VERSION*/
import { createBucketClient } from "@cosmicjs/sdk"; /* new version */

/* OLD VERSION 
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
}); */

/*NEW VERSION*/
const { BUCKET_SLUG, READ_KEY, WRITE_KEY } = process.env;

/* NEW VERSION */
const bucketDevagram = createBucketClient({
    bucketSlug: BUCKET_SLUG as string,
    readKey: READ_KEY as string,
    writeKey: WRITE_KEY as string,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadMidiaCosmic = async (req: any) => {
    //teste
    //console.log('uploadImagemCosmic upload imagemm', req.body);
    if (req?.file?.originalname) {
        const media_object = {
            originalname: req.file.originalname,
            buffer: req.file.buffer
        };
        //teste
        //console.log('uploadImagemCosmic url ', req.url);
        //console.log('uploadImagemCosmic media_object ', media_object);
        if (req.url && req.url.includes('publicacao')) {
            if (req.body.type === 'feed' && req.file.originalname.includes('.png' || req.file.originalname.includes('.jpg') || req.file.originalname.includes('.jpeg'))) {
                /* return await bucketPublicacoes.addMedia({ media: media_object, folder: 'feeds' }); OLD VERSION*/
                /*NEW VERSION*/
                return await bucketDevagram.media.insertOne({
                    media: media_object,
                    folder: "feeds"
                });
            } if (req.body.type === 'story') {
                /* return await bucketPublicacoes.addMedia({ media: media_object, folder: 'storys' }); OLD VERSION*/
                /*NEW VERSION*/
                return await bucketDevagram.media.insertOne({
                    media: media_object,
                    folder: "storys"
                });
            } if (req.body.type === 'reel' && req.file.originalname.includes('.mp4')) {
                /* return await bucketPublicacoes.addMedia({ media: media_object, folder: 'reels' }); OLD VERSION*/
                /*NEW VERSION*/
                return await bucketDevagram.media.insertOne({
                    media: media_object,
                    folder: "reels"
                });
            }
            else {
                console.log('nenhuma publicação criada');
                throw new Error('Extensão da imagem invalida');
            }

        } else {
            /*return await bucketAvatares.addMedia({ media: media_object }); OLD VERSION*/
            /*NEW VERSION*/
            return await bucketDevagram.media.insertOne({
                media: media_object,
                folder: "avatares",
            });
        }

    }
}

export { upload, uploadMidiaCosmic };