const fs = require("fs")

module.exports = {
    createNewFile: (fileName) => {
        const fd = fs.openSync(fileName, 'w');  
    }
}