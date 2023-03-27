const crypto = require("node:crypto");
const dev = require("../env").developement;


// function for encryption of data
module.exports.getEncryptedData = function(data){
    
    try {
        
        // creating a key from secret_pass/salt and length 24
        const key = crypto.scryptSync(dev.SECRET_PASS, dev.SALT, 24);

        // creating vector
        let iv = Buffer.alloc(16, 0);

        // creating cipher function
        let my_cipher = crypto.createCipheriv("aes-192-cbc", key, iv);

        let encryptPass = "";

        // store encrypted password in variable
        my_cipher.on("readable", () => {
            let chunk = my_cipher.read();
            while(chunk!=null){
                encryptPass += chunk.toString("hex");
                chunk = my_cipher.read();
            }
        });

        my_cipher.on("end", () => {
            
        });

        // initiate cipher func to encrypt pass
        my_cipher.write(data);
        // after it call end event
        my_cipher.end();
        return encryptPass;

    } catch (error) {
        console.error(error);
    }

};
