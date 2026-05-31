module.exports = async (req, res) => {
    try {
        const { key, uid } = req.body || {};
        console.log("Teste de recebimento:", { key, uid });
        
        if (req.method !== 'POST') {
            return res.send("Servidor OK - Aguardando POST");
        }
        
        // Simular resposta positiva para testar se o erro 500 some
        // Se sumir, o problema era o Axios ou a conexao com o Firebase
        return res.send("Logado");
    } catch (e) {
        return res.send("Erro interno: " + e.message);
    }
};
