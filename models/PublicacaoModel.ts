import mongoose, {Schema} from "mongoose";

const PublicacaoSchema = new Schema({
    idUsuario: {type : String, require : true},
    descricao: {type : String, require : true},
    foto: {type : String, require : true},
    data: {type : Date, require : true},
    likes : {type : Array, required : true, default : []},
    comentarios: {type : Array, require : true, default : []}
});

export const PublicacaoModel = (mongoose.models.publicacoes || mongoose.model('publicacoes', PublicacaoSchema));