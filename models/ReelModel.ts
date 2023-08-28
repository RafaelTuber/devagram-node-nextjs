import mongoose, {Schema} from "mongoose";

const ReelSchema = new Schema({
    idUsuario: {type : String, require : true},
    descricao: {type : String, require : true},
    video: {type : String, require : true},
    data: {type : Date, require : true},
    likes : {type : Array, required : true, default : []},
    comentarios: {type : Array, require : true, default : []},
    contadorDeVisualizacoes: { type: Number, default: 0 },
    usuariosQueVisualizaram: {type : Array, require : true, default : []},
});

export const ReelModel = (mongoose.models.reels || mongoose.model('reels', ReelSchema));