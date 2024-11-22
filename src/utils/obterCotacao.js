import axios from "axios";

const obterCotacao = async (moeda) => {
  try {
    const response = await axios.get(
      `https://economia.awesomeapi.com.br/json/last/${moeda}-BRL`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao obter a cotação:", error);
    throw error;
  }
};

export default obterCotacao;
