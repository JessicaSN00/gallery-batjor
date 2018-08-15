var mongoose = require('mongoose');

var publicationsSchema = mongoose.Schema({
    title : {type: String, required: true},
    text: {type: String, requiered: true},
    role: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
});

var donothing = () => {

}

var Publications = mongoose.model("Publications", publicationsSchema);
module.exports = Publications;
