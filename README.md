# 🏦 Verde Papo Financeiro (Assistente Open Finance com MCP)

Assistente conversacional desenvolvido para atuar no ecossistema de Open Finance, integrando inteligência artificial a dados bancários simulados por meio da arquitetura **MCP (Model Context Protocol)**.

---

## 👨‍💻 Desenvolvedor
- **Nome:** Marcelo Lopes da Silva
- **Projeto:** Desafio Open Finance com MCP (Pluggy & Plaid)
- **Aplicação Publicada:** [Acesse o Verde Papo Financeiro](https://verde-papo-financeiro.lovable.app)

---

## 🎯 Cenário e Proposta de Valor
- **Onde o cliente está:** O assistente atua como um concierge financeiro integrado diretamente à jornada do usuário (podendo operar em app bancário ou integrado ao momento de decisão financeira).
- **O que ele responde:** Saldos consolidados de contas (Corrente e Poupança), limite e fatura de Cartão de Crédito, extrato categorizado de transações e diagnóstico de saúde financeira.
- **De onde vem cada dado:**
  - **Pluggy:** Fonte de documentação e contexto técnico de Open Finance brasileiro via servidor MCP (`https://mcp.pluggy.ai/mcp`).
  - **Plaid:** Provedor de dados bancários mockados no ambiente Sandbox via servidor MCP local (`mcp-server-plaid`), gerando tokens e simulando contas do *First Platypus Bank*.

---

## ⚙️ Arquitetura e Configuração dos Servidores MCP

A conexão no arquivo `cline_mcp_settings.json` foi configurada da seguinte forma:

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
