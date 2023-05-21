import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';

const endpointLogin = (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg>
) => {
    if (req.method === 'POST') {
        const { login, password } = req.body;
        if (login === 'admin@admin.com' && password === 'Admin@123') {
            return res.status(200).json({ msg: 'Usuário autenticado com sucesso' });
        }
        return res.status(400).json({ erro: 'Usuário ou senha não encontrado' });
    }
    return res.status(405).json({ erro: 'Método informado não é valido' });
}

export default conectarMongoDB(endpointLogin);