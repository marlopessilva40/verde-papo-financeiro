# 🏦 Verde Papo Financeiro (Assistente Open Finance com MCP)

Assistente conversacional interativo desenvolvido para o ecossistema de Open Finance, integrando inteligência artificial a dados bancários por meio da arquitetura **MCP (Model Context Protocol)**.

* **Aplicação Publicada:** [https://verde-papo-financeiro.lovable.app](https://verde-papo-financeiro.lovable.app)
* **Desenvolvedor:** Marcelo Lopes da Silva
* **Projeto:** Desafio Open Finance com MCP (Pluggy & Plaid)

---

## 1. Cenário, Respostas do Assistente e Origem dos Dados

* **Onde o cliente já está:** O assistente atua como um concierge financeiro integrado diretamente à interface bancária pessoal do usuário (internet banking ou aplicativo mobile), acompanhando o cliente no momento em que ele consulta saldos ou toma decisões de compra.
* **O que o assistente responde ali:**
  * Saldos consolidados e individuais de contas (Corrente e Poupança);
  * Limite utilizado e fatura atual de Cartão de Crédito;
  * Extrato de transações agrupadas por padrões de consumo;
  * Avaliação de saúde financeira e alertas contra endividamento no rotativo.
* **De onde vem cada dado:**
  * **Pluggy:** Utilizada como fonte de documentação técnica, regras regulatórias e contexto do Open Finance brasileiro via servidor MCP HTTP (`https://mcp.pluggy.ai/mcp`).
  * **Plaid:** Provedor dos dados bancários simulados em ambiente Sandbox via servidor MCP local STDIO (`mcp-server-plaid`), gerando tokens e simulando contas do *First Platypus Bank*.

---

## 2. Configuração dos Servidores MCP (Pluggy e Plaid)

A integração foi configurada no arquivo de settings do Cline (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "pluggy": {
      "url": "https://mcp.pluggy.ai/mcp",
      "type": "streamableHttp",
      "autoApprove": []
    },
    "plaid": {
      "command": "/home/linuxbrew/.linuxbrew/bin/uvx",
      "args": ["mcp-server-plaid"],
      "env": {
        "PLAID_CLIENT_ID": "SUA_CHAVE_AQUI",
        "PLAID_SECRET": "SUA_CHAVE_AQUI",
        "PLAID_ENV": "sandbox"
      }
    }
  }
}
