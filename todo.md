# Sistema de Controle de Vendas de Joias - TODO

## Funcionalidades Principais

### Banco de Dados
- [x] Criar tabela de vendas com campos: código do produto, cliente, valor, forma de pagamento, data do pagamento
- [x] Criar índices para melhor performance

### Formulário de Registro de Vendas
- [x] Criar formulário online com validação
- [x] Implementar campos: código do produto, cliente, valor, forma de pagamento, data do pagamento
- [x] Adicionar botão de envio com feedback visual
- [x] Implementar limpeza de formulário após envio

### Backend (tRPC Procedures)
- [x] Criar procedure para adicionar nova venda
- [x] Criar procedure para listar todas as vendas
- [x] Criar procedure para calcular totais (bruto e líquido)

### Página de Relatórios
- [x] Criar página de relatórios com visualização de dados
- [x] Exibir tabela de vendas registradas
- [x] Calcular e exibir total bruto (soma de todos os valores)
- [x] Calcular e exibir total líquido (30% do bruto)
- [x] Exibir resumo por forma de pagamento
- [ ] Adicionar filtros por data/período

### Interface e UX
- [x] Criar layout com navegação entre formulário e relatórios
- [x] Adicionar estilos com Tailwind CSS
- [x] Implementar feedback visual (toasts, mensagens de sucesso/erro)
- [x] Garantir responsividade mobile

### Melhorias Futuras
- [ ] Exportar relatórios em PDF
- [ ] Gráficos de vendas por período
- [ ] Editar/deletar vendas registradas
- [ ] Busca e filtros avançados

### Painel de Gerenciamento de Vendas
- [x] Criar procedure no backend para atualizar venda
- [x] Criar procedure no backend para deletar venda
- [x] Criar página de gerenciamento com tabela de vendas
- [x] Implementar modal de edição de venda
- [x] Implementar modal de confirmação de exclusão
- [x] Adicionar botões de editar e excluir em cada linha
- [x] Sincronizar dados após edição/exclusão

### Navegação
- [x] Adicionar botão de voltar à página inicial em SalesForm
- [x] Adicionar botão de voltar à página inicial em SalesReport
- [x] Adicionar botão de voltar à página inicial em SalesManagement

### Ajustes nos Relatórios
- [x] Remover card de Total Líquido da página de relatórios
- [x] Manter apenas Total Bruto e Comissão (30%)

### Exportação de Relatórios
- [x] Instalar biblioteca xlsx para exportar Excel
- [x] Criar função para exportar vendas em Excel
- [x] Adicionar botão de exportar na página de relatórios

### Branding
- [ ] Alterar nome do sistema para "Policena Jóias" na página Home
- [ ] Atualizar título do navegador (VITE_APP_TITLE)

### Ajustes Solicitados
- [x] Alterar branding para "Policena Jóias" via variável de ambiente
- [x] Corrigir cálculo da comissão para 30% do bruto
- [x] Adicionar filtro por forma de pagamento nos relatórios
- [x] Adicionar filtro por data nos relatórios
- [x] Adicionar filtro por cliente nos relatórios

### Correções
- [x] Corrigir erro na página de relatórios que impede acesso

### Correções Adicionais
- [x] Corrigir erro no Select de forma de pagamento (valor vazio)

### Backup Manual em Excel
- [x] Criar página de backup com histórico
- [x] Implementar função para fazer backup completo dos dados
- [x] Adicionar lista de backups realizados com data/hora
- [x] Permitir download de backups anteriores

### Campo Tipo de Joia
- [x] Adicionar coluna "type" na tabela de vendas
- [x] Criar procedimento tRPC para atualizar schema
- [x] Adicionar campo "Tipo" no formulário de registro
- [x] Adicionar campo "Tipo" no formulário de edição
- [x] Exibir "Tipo" na tabela de relatórios e gerenciamento
- [x] Adicionar "Tipo" na exportação de Excel

### Painel Admin
- [x] Criar procedures tRPC para admin acessar dados de outros usuários
- [x] Criar página de admin com lista de usuários por email
- [x] Implementar seleção de usuário para visualizar suas vendas
- [x] Adicionar funcionalidade de editar vendas de outro usuário
- [x] Adicionar funcionalidade de deletar vendas de outro usuário
- [x] Criar relatórios consolidados de todos os usuários
- [x] Criar painel de resumo geral com estatísticas de todos os usuários
- [x] Adicionar acesso ao painel admin apenas para usuários com role "admin"
