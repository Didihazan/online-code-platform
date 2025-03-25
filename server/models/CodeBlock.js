const mongoose = require('mongoose');

const CodeBlockSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true
    },
    solution: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('CodeBlock', CodeBlockSchema);