const axios = require('axios');

module.exports = async (req, res) => {
    // Configurar Headers para evitar problemas de CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(200).send('Servidor Ativo - Use o Proxy para validar.');
    }

    const { key, uid } = req.body;
    
    if (!key || !uid) {
        return res.status(200).send('Dados incompletos.');
    }

    const PROJECT_ID = "principal-6bf6f";

    try {
        // Usar a API REST pública do Firestore (funciona se as regras do banco permitirem leitura)
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/keys`;
        
        console.log(`Consultando Firestore para a key: ${key}`);
        
        const response = await axios.get(url, { timeout: 5000 });
        const documents = response.data.documents || [];
        
        let foundDoc = null;
        for (const doc of documents) {
            const fields = doc.fields;
            if (fields && fields.keyString && fields.keyString.stringValue === key) {
                foundDoc = doc;
                break;
            }
        }

        if (!foundDoc) {
            console.log("Chave nao encontrada no banco.");
            return res.send("Invalida");
        }

        const data = foundDoc.fields;
        const docId = foundDoc.name.split('/').pop();

        // Verificar Status
        if (data.status && data.status.stringValue !== 'active') {
            return res.send("Banida");
        }

        // Verificar Dispositivo
        const currentDeviceId = data.deviceId ? data.deviceId.stringValue : null;

        if (!currentDeviceId) {
            // Vincular dispositivo
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
        console.error("Erro na execucao:", error.message);
        // Se der erro de permissão no Firebase, avisar
        if (error.response && error.response.status === 403) {
            return res.send("Erro: Regras do Firebase bloqueando acesso.");
        }
        return res.send("Erro de conexao com o banco.");
    }
};
