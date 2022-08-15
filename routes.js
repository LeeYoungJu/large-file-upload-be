import UploadService from "./service/upload.js";

const routes = {
    test: (req, res) => {
        res.send('good!');
    },

    upload: async (req, res) => {
        const uploadService = new UploadService(req.query);
    
        try {
            uploadService.uploadChunk(
                req.body.toString(),
                () => {
                    res.send('ok');
                },
                (finalFileName) => {
                    res.json({
                        finalFileName,
                    });
                }
            );
            
        } catch(err) {
            res.json({err});
        }    
    },
};

export default routes;