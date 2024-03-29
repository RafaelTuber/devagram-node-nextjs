import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import type { RespostaPadraoMsg } from '../types/RespostaPadraoMsg';
import NextCors from 'nextjs-cors';

export const politicaCORS = (handler: NextApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
        try {
            await NextCors(req, res, {
                // origin : 'meusite.com';
                origin : '*',
                methods : ['GET', 'POST', 'PUT'],
                //header : [],
                optionsSuccessStatus : 200, // navegador antigos dao problema quendo se retorna 204
            });

            return handler(req, res);
        } catch (e) {
            console.log('Erro ao tratar a politica de CORS: ', e);
            res.status(500).json({ erro: 'Ocorreu erro ao tratar a politica de CORS' });
        }
    }