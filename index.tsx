import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Database,
  Landmark,
  Leaf,
  MessageSquare,
  PieChart,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wallet,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  accounts,
  availableBalance,
  cardBill,
  categories,
  categoryTotal,
  getAnswerKind,
  money,
  monthlySpending,
  transactions,
  type AnswerKind,
} from "@/lib/finance-demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seu assistente financeiro | Open Finance" },
      {
        name: "description",
        content:
          "Converse sobre seu saldo, suas últimas transações e gastos por categoria. Demonstração com dados fictícios de Open Finance.",
      },
      { property: "og:title", content: "Seu assistente financeiro | Open Finance" },
      {
        property: "og:description",
        content:
          "Suas finanças, em uma conversa. Explore contas e despesas com dados simulados da Plaid Sandbox.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const suggestions = [
  { question: "Qual é o meu saldo consolidado?", icon: Wallet },
  { question: "Quais foram minhas últimas transações?", icon: ArrowDownUp },
  { question: "Mostre meus gastos divididos por categoria", icon: PieChart },
];
const categoryClasses = ["", "daily", "leisure"];
type Exchange = { id: number; question: string; answer: AnswerKind };

function AssistantSymbol() {
  return (
    <span className="assistant-symbol">
      <Sparkles size={17} strokeWidth={1.6} />
    </span>
  );
}

function PlaidNote() {
  return (
    <p className="plaid-note">
      <strong className="text-foreground">Sobre os valores da Plaid:</strong> valores positivos são
      saídas (despesas) e valores negativos são entradas (receitas). Todos os dados desta conversa
      são fictícios.
    </p>
  );
}

function Answer({ kind }: { kind: AnswerKind }) {
  if (kind === "balance")
    return (
      <>
        <p>
          Marcelo, seu saldo disponível consolidado é de{" "}
          <strong className="text-primary">{money(availableBalance)}</strong>. Aqui está o detalhe
          das suas contas:
        </p>
        <table className="answer-table">
          <thead>
            <tr>
              <th>Conta</th>
              <th>Tipo de saldo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.name}>
                <td>{account.name}</td>
                <td className="text-muted-foreground">
                  {account.type === "debt" ? "Fatura / dívida" : "Disponível"}
                </td>
                <td className={account.type === "debt" ? "text-warning" : "text-primary"}>
                  {money(account.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          O saldo do cartão de crédito é a sua <strong>fatura de {money(cardBill)}</strong>, não
          dinheiro disponível. Por isso, ele não entra na soma da conta corrente e da poupança.
        </p>
      </>
    );
  if (kind === "transactions" || kind === "categories")
    return (
      <>
        <p>
          {kind === "transactions"
            ? "Estas são suas últimas transações de novembro, separadas por categoria."
            : "Em novembro, seus gastos somam R$ 820,00. Veja como estão divididos:"}
        </p>
        {categories.map((category) => (
          <section key={category}>
            <h3 className="flex items-center justify-between gap-2">
              <span>{category}</span>
              <span className="text-muted-foreground">
                {money(categoryTotal(category))}
                {kind === "categories"
                  ? ` · ${((categoryTotal(category) / monthlySpending) * 100).toFixed(1).replace(".", ",")}%`
                  : ""}
              </span>
            </h3>
            <table className="answer-table">
              <thead>
                <tr>
                  <th>{kind === "transactions" ? "Transação" : "Despesa"}</th>
                  <th>{kind === "transactions" ? "Data" : "Tipo"}</th>
                  <th>Valor Plaid</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter((transaction) => transaction.category === category)
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((transaction) => (
                    <tr key={transaction.name}>
                      <td>{transaction.name}</td>
                      <td className="text-muted-foreground">
                        {kind === "transactions" ? transaction.date : "Saída"}
                      </td>
                      <td>+ {money(transaction.amount)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        ))}
        <PlaidNote />
      </>
    );
  return (
    <>
      <p>
        Marcelo, nesta demonstração posso consultar os dados fictícios de{" "}
        <strong>saldo, fatura, últimas transações e gastos por categoria</strong>.
      </p>
      <p>
        Experimente perguntar “Qual é o meu saldo?” ou “Quanto gastei por categoria?”. Não há
        conexão com bancos reais ou um modelo de IA nesta versão.
      </p>
    </>
  );
}

function Index() {
  const [input, setInput] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [dialog, setDialog] = useState<"sources" | "reset" | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (exchanges.length > 0 && chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [exchanges]);

  function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setExchanges((current) => [
      ...current,
      { id: Date.now(), question: trimmed, answer: getAnswerKind(trimmed) },
    ]);
    setInput("");
    inputRef.current?.focus();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send(input);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="demo-banner">
        <TriangleAlert size={12} className="shrink-0" />
        <span>⚠️ Ambiente de Demonstração: Dados fictícios simulados via Plaid Sandbox e MCP</span>
      </div>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="flex items-center gap-3">
            <span className="brand-mark">
              <ChartNoAxesCombined size={24} strokeWidth={2} />
            </span>
            <div>
              <div className="brand-name">
                Financeiro<span className="text-primary">.</span>
              </div>
              <div className="brand-subtitle">SEU ASSISTENTE PESSOAL</div>
            </div>
            <div className="topnav-label">
              <MessageSquare size={15} />
              Visão geral
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDialog("sources")}
              className="text-muted-foreground text-[11px]"
            >
              <ShieldCheck className="text-primary" />
              <span className="hidden sm:inline">Open Finance</span>
            </Button>
            <span className="h-6 border-l border-border" />
            <div className="flex items-center gap-3">
              <div className="profile-name text-right">
                <div className="text-xs font-semibold">Marcelo Lopes</div>
                <div className="text-[10px] text-muted-foreground mt-1">Conta demonstração</div>
              </div>
              <span className="user-avatar">ML</span>
            </div>
          </div>
        </div>
      </header>

      <main className="workspace">
        <div className="page-heading">
          <div>
            <div className="eyebrow">SEU DINHEIRO, MAIS CLARO</div>
            <h1>Seu assistente financeiro</h1>
            <p className="text-muted-foreground text-xs">Bom ter você por aqui, Marcelo.</p>
          </div>
          <div className="month-label">
            <CalendarDays size={13} />
            Novembro de 2026
          </div>
        </div>

        <section className="summary-grid" aria-label="Resumo financeiro">
          <article className="summary-card balance">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-medium">Saldo Disponível Total</h2>
              <span className="summary-icon">
                <Wallet size={17} />
              </span>
            </div>
            <div className="summary-value text-primary">{money(availableBalance)}</div>
            <div className="summary-caption">
              <Landmark size={10} />
              Conta corrente + poupança
            </div>
          </article>
          <article className="summary-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-medium text-muted-foreground">Fatura Atual do Cartão</h2>
              <span className="summary-icon warning">
                <CreditCard size={17} />
              </span>
            </div>
            <div className="summary-value">{money(cardBill)}</div>
            <div className="summary-caption">Saldo devedor, não disponível</div>
          </article>
          <article className="summary-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-medium text-muted-foreground">Gastos do Mês</h2>
              <span className="summary-icon info">
                <ChartNoAxesCombined size={17} />
              </span>
            </div>
            <div className="summary-value">{money(monthlySpending)}</div>
            <div className="summary-caption">6 transações em novembro</div>
          </article>
        </section>

        <div className="content-grid">
          <section className="chat-panel" aria-label="Chat financeiro">
            <div className="chat-heading">
              <div className="flex items-center gap-11">
                <div className="flex items-center gap-3">
                  <AssistantSymbol />
                  <div>
                    <h2 className="text-xs font-semibold">Assistente financeiro</h2>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-muted-foreground">
                      <span className="status-dot" />
                      Modo demonstração
                    </div>
                  </div>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Nova conversa"
                    onClick={() =>
                      exchanges.length > 0 ? setDialog("reset") : inputRef.current?.focus()
                    }
                    className="text-muted-foreground"
                  >
                    <Plus size={17} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Nova conversa</TooltipContent>
              </Tooltip>
            </div>
            <div
              className="chat-body"
              ref={chatRef}
              role="log"
              aria-label="Mensagens da conversa"
              aria-live="polite"
            >
              {exchanges.length === 0 ? (
                <div className="welcome">
                  <div className="flex items-center gap-2 text-primary text-[10px] mb-5">
                    <Sparkles size={12} />
                    UM NOVO OLHAR PARA SEU DINHEIRO
                  </div>
                  <h2>
                    Olá, Marcelo Lopes <span className="inline-block ml-1">👋</span>
                  </h2>
                  <p>
                    Bem-vindo ao seu assistente financeiro pessoal.
                    <br />
                    <strong>Suas finanças estão reunidas aqui.</strong> O que vamos olhar hoje?
                  </p>
                  <div className="suggestions-label">POR ONDE COMEÇAMOS?</div>
                  <div className="suggestions">
                    {suggestions.map(({ question, icon: Icon }) => (
                      <Button
                        variant="suggestion"
                        className="suggestion-card"
                        key={question}
                        onClick={() => send(question)}
                      >
                        <span className="suggestion-top">
                          <Icon size={17} strokeWidth={1.6} />
                          <ArrowUpRight size={13} />
                        </span>
                        <span>{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="message-list">
                  {exchanges.map((exchange) => (
                    <div className="flex flex-col gap-5" key={exchange.id}>
                      <div className="user-message">{exchange.question}</div>
                      <div className="assistant-message">
                        <AssistantSymbol />
                        <div className="answer-content">
                          <div className="text-[10px] font-semibold text-primary">
                            Assistente financeiro
                          </div>
                          <Answer kind={exchange.answer} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <form className="chat-composer" onSubmit={submit}>
              <div className="composer-field">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      send(input);
                    }
                  }}
                  maxLength={1000}
                  aria-label="Sua pergunta financeira"
                  placeholder="O que você quer saber sobre suas finanças?"
                  rows={1}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      type="submit"
                      disabled={!input.trim()}
                      aria-label="Enviar mensagem"
                      className="shrink-0"
                    >
                      <Send size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Enviar mensagem</TooltipContent>
                </Tooltip>
              </div>
              <div className="composer-meta">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} />
                  Nenhum dado bancário real é utilizado
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles size={10} />
                  Plaid Sandbox · MCP
                </span>
              </div>
            </form>
          </section>

          <aside aria-label="Detalhes financeiros">
            <section className="side-section">
              <div className="side-title">
                <h2>Gastos por categoria</h2>
                <span>NOVEMBRO</span>
              </div>
              <div className="spending-overview">
                <div
                  className="spending-chart"
                  role="img"
                  aria-label="Despesas fixas: 58,5%; Dia a dia: 23,2%; Lazer: 18,3%"
                >
                  <div className="spending-chart-center">
                    <strong>
                      R$ 820<span className="text-sm text-foreground">,00</span>
                    </strong>
                    <span>em despesas</span>
                  </div>
                </div>
                <div>
                  {categories.map((category, index) => (
                    <div className="category-row" key={category}>
                      <span className="flex items-center gap-2">
                        <span className={`category-dot ${categoryClasses[index] ?? ""}`} />
                        {category}
                      </span>
                      <span className="font-medium">{money(categoryTotal(category))}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-between text-[10px] text-muted-foreground mt-2 px-0"
                onClick={() => send(suggestions[2]?.question ?? "Gastos por categoria")}
              >
                Ver detalhes dos gastos
                <ArrowUpRight size={13} />
              </Button>
            </section>
            <section className="side-section side-divider">
              <div className="side-title mb-2">
                <h2>Suas contas</h2>
                <span className="sandbox-pill">SANDBOX</span>
              </div>
              {accounts.map((account, index) => {
                const Icon = index === 0 ? Landmark : index === 1 ? Leaf : CreditCard;
                return (
                  <div className="account-row" key={account.name}>
                    <span className="account-icon">
                      <Icon size={15} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium">{account.name}</div>
                      <div className="text-[9px] text-muted-foreground mt-1">
                        {account.type === "debt" ? "Fatura atual" : "Saldo disponível"}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-medium ${account.type === "debt" ? "text-warning" : "text-foreground"}`}
                    >
                      {money(account.balance)}
                    </span>
                  </div>
                );
              })}
              <Button
                variant="ghost"
                className="w-full justify-between text-[10px] text-muted-foreground mt-2 px-0"
                onClick={() => setDialog("sources")}
              >
                <span className="flex items-center gap-1.5">
                  <Database size={12} />
                  Sobre os dados
                </span>
                <ChevronRight size={13} />
              </Button>
            </section>
            <div className="security-note">
              <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
              <p>
                <strong className="text-foreground font-medium">
                  Sua privacidade vem primeiro.
                </strong>
                <br />
                Ambiente simulado, sem acesso a contas bancárias reais.
              </p>
            </div>
          </aside>
        </div>
        <footer className="page-footer">
          <span>
            Desenvolvido por <span className="text-foreground">Marcelo Lopes da Silva</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="status-dot" />
            Open Finance · Pluggy & Plaid · Demonstração
          </span>
        </footer>
      </main>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialog === "reset" ? (
                <>
                  <MessageSquare size={19} className="text-primary" />
                  Começar uma nova conversa?
                </>
              ) : (
                <>
                  <CircleHelp size={19} className="text-primary" />
                  Sobre esta demonstração
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-3 leading-relaxed">
              {dialog === "reset"
                ? "As mensagens desta conversa serão apagadas. Seus dados financeiros de demonstração continuam iguais."
                : "Este assistente utiliza apenas dados fictícios locais. Plaid Sandbox, Pluggy e MCP representam o cenário de Open Finance; nenhuma conexão externa é realizada nesta versão."}
            </DialogDescription>
          </DialogHeader>
          {dialog === "reset" ? (
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={() => setDialog(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setExchanges([]);
                  setDialog(null);
                  setInput("");
                }}
              >
                Nova conversa
              </Button>
            </div>
          ) : (
            <>
              <div className="plaid-note">
                Na convenção da Plaid, valores positivos representam despesas e valores negativos
                representam receitas. O cartão representa uma dívida e não compõe o saldo
                disponível.
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As respostas são simuladas, sem modelo de IA. A conversa não é salva e é apagada ao
                atualizar a página.
              </p>
              <Button className="mt-2" onClick={() => setDialog(null)}>
                Entendi
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
