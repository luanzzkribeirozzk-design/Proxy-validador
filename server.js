const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const FIREBASE_API_KEY = "AIzaSyAmXzPrNaK_-Zr190oB8MuxA_sqI_ctetc";
const PROJECT_ID = "principal-6bf6f";

app.post('/check', async (req, res) => {
    const { key, uid } = req.body;
    console.log("Validando key:", key, "UID:", uid);

    try {
        // 1. Buscar a chave no Firestore via API REST
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/keys`;
        const response = await axios.get(url);
        
        const documents = response.data.documents || [];
        let foundDoc = null;

        for (const doc of documents) {
            const fields = doc.fields;
            if (fields.keyString && fields.keyString.stringValue === key) {
                foundDoc = doc;
                break;
            }
        }

        if (!foundDoc) {
            return res.send("Invalida");
        }

        const data = foundDoc.fields;
        const docId = foundDoc.name.split('/').pop();

        // 2. Verificar Status
        if (data.status && data.status.stringValue !== 'active') {
            return res.send("Banida");
        }

        // 3. Verificar Dispositivo (UID)
        const currentDeviceId = data.deviceId ? data.deviceId.stringValue : null;

        if (!currentDeviceId) {
            // Vincular dispositivo se for a primeira vez
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

        res.send("Logado");

    } catch (error) {
        console.error("Erro:", error.message);
        res.send("Erro de conexao");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
