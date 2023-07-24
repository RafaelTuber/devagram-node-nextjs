import mongoose, {Schema} from "mongoose";

const StorySchema = new Schema({
    idUsuario: {type : String, require : true},
    midia: {type : String, require : true},
    data: {type : Date, require : true},
    likes : {type : Array, required : true, default : []},
    comentarios: {type : Array, require : true, default : []},
    usuariosQueVisualizaram: {type : Array, require : true, default : []},
});

export const StoryModel = (mongoose.models.storys || mongoose.model('storys', StorySchema));