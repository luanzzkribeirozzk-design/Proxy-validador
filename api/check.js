const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).send('Servidor Ativo');
    }

    const { key, uid } = req.body || {};
    const PROJECT_ID = "principal-6bf6f";

    try {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/keys`;
        const response = await axios.get(url);
        const documents = response.data.documents || [];
        
        let foundDoc = null;
        for (const doc of documents) {
            if (doc.fields && doc.fields.keyString && doc.fields.keyString.stringValue === key) {
                foundDoc = doc;
                break;
            }
        }

        if (!foundDoc) return res.send("Invalida");

        const data = foundDoc.fields;
        const docId = foundDoc.name.split('/').pop();

        if (data.status && data.status.stringValue !== 'active') return res.send("Banida");

        const currentDeviceId = data.deviceId ? data.deviceId.stringValue : null;

        if (!currentDeviceId) {
            const updateUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/keys/${docId}?updateMask.fieldPaths=deviceId&updateMask.fieldPaths=firstUsed`;
            await axios.patch(updateUrl, {
                fields: {
                    deviceId: { stringValue: uid },
                    firstUsed: { timestampValue: new Date().toISOString() }
                }
            });
            return res.send("Logado");
        } else if (currentDeviceId !== uid) {
            return res.send("Dispositivo Invalido");
        }

        return res.send("Logado");

    } catch (error) {
        return res.send("Erro de conexao");
    }
};
