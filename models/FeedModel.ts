import mongoose, {Schema} from "mongoose";

const FeedSchema = new Schema({
    idUsuario: {type : String, require : true},
    descricao: {type : String, require : true},
    foto: {type : String, require : true},
    data: {type : Date, require : true},
    likes : {type : Array, required : true, default : []},
    comentarios: {type : Array, require : true, default : []}
});

export const FeedModel = (mongoose.models.feeds || mongoose.model('feeds', FeedSchema));