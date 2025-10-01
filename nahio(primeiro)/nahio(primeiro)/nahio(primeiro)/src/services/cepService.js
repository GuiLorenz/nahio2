// Serviço para consulta de CEP usando a API ViaCEP
class CepService {
    
    // URL base da API ViaCEP
    static BASE_URL = 'https://viacep.com.br/ws';

    // --- Auxiliares Privados ---

    /**
     * Limpa o CEP, removendo caracteres não numéricos, e opcionalmente valida o formato.
     * @param {string} cep CEP a ser limpo.
     * @param {boolean} validate Se deve validar o tamanho.
     * @returns {{ cepLimpo: string, error: string | null }}
     */
    static _cleanCep(cep, validate = true) {
        const cepLimpo = String(cep).replace(/\D/g, '');
        if (validate && cepLimpo.length !== 8) {
            return { cepLimpo, error: 'CEP deve conter 8 dígitos' };
        }
        return { cepLimpo, error: null };
    }

    /**
     * Auxiliar para fazer requisições GET e tratar a resposta JSON.
     * @param {string} url URL completa para a requisição.
     * @returns {Promise<object | null>} Dados JSON em caso de sucesso, ou null em caso de CEP não encontrado/erro.
     */
    static async _makeRequest(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                // Tratar erros de HTTP, embora o ViaCEP geralmente retorne 200 com 'erro: true'
                throw new Error(`Erro de rede: ${response.status}`);
            }

            const data = await response.json();

            if (data.erro) {
                return null; // Sinaliza que o CEP não foi encontrado (erro 400 simulado pelo ViaCEP)
            }
            
            // Retorna o objeto de dados da API
            return data;
        } catch (error) {
            // Re-throw para ser capturado pela função pública
            throw new Error(`Erro na comunicação com a API: ${error.message}`);
        }
    }

    // --- Métodos de Busca ---

    /**
     * Buscar endereço por CEP.
     * @param {string} cep CEP a ser consultado.
     * @returns {Promise<{success: boolean, data?: object, error?: string}>}
     */
    static async buscarCep(cep) {
        try {
            const { cepLimpo, error: validationError } = this._cleanCep(cep);
            
            if (validationError) {
                return { success: false, error: validationError };
            }

            const url = `${this.BASE_URL}/${cepLimpo}/json/`;
            const data = await this._makeRequest(url);

            if (!data) {
                return { success: false, error: 'CEP não encontrado' };
            }

            // Retornar dados formatados
            return {
                success: true,
                data: {
                    cep: data.cep,
                    logradouro: data.logradouro,
                    complemento: data.complemento,
                    bairro: data.bairro,
                    localidade: data.localidade, // cidade
                    uf: data.uf, // estado
                    ibge: data.ibge,
                    gia: data.gia,
                    ddd: data.ddd,
                    siafi: data.siafi
                }
            };
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            return {
                success: false,
                error: 'Erro ao consultar CEP. Verifique sua conexão ou tente novamente.'
            };
        }
    }

    /**
     * Buscar CEPs por cidade, estado e logradouro.
     * @param {string} uf Sigla do estado (Ex: SP).
     * @param {string} cidade Nome da cidade (Ex: Sao Paulo).
     * @param {string} [logradouro=''] Nome do logradouro/rua (Ex: Paulista).
     * @returns {Promise<{success: boolean, data?: object[], error?: string}>}
     */
    static async buscarCepsPorCidade(uf, cidade, logradouro = '') {
        try {
            // ViaCEP espera parâmetros URL-encoded
            const ufEncoded = encodeURIComponent(uf);
            const cidadeEncoded = encodeURIComponent(cidade);
            const logradouroEncoded = encodeURIComponent(logradouro);

            const url = `${this.BASE_URL}/${ufEncoded}/${cidadeEncoded}/${logradouroEncoded}/json/`;
            
            const data = await this._makeRequest(url);

            if (!Array.isArray(data) || data.length === 0) {
                return {
                    success: false,
                    error: 'Nenhum CEP encontrado para esta localização'
                };
            }
            
            // Mapear e retornar apenas os campos principais
            return {
                success: true,
                data: data.map(item => ({
                    cep: item.cep,
                    logradouro: item.logradouro,
                    complemento: item.complemento,
                    bairro: item.bairro,
                    localidade: item.localidade,
                    uf: item.uf
                }))
            };
        } catch (error) {
            console.error('Erro ao buscar CEPs por cidade:', error);
            return {
                success: false,
                error: 'Erro ao consultar CEPs. Verifique sua conexão ou tente novamente.'
            };
        }
    }
    
    // --- Métodos de Utilidade ---

    /**
     * Formata o CEP para exibição (Ex: 12345678 -> 12345-678).
     * @param {string} cep CEP no formato string.
     * @returns {string} CEP formatado ou original se inválido.
     */
    static formatarCep(cep) {
        const cepLimpo = String(cep).replace(/\D/g, '');
        // Aplica a máscara se tiver exatamente 8 dígitos
        return cepLimpo.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    }

    /**
     * Valida se o CEP tem exatamente 8 dígitos numéricos.
     * @param {string} cep CEP a ser validado.
     * @returns {boolean}
     */
    static validarCep(cep) {
        const { error } = this._cleanCep(cep);
        return error === null;
    }
}

export default CepService;