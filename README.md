# R-Book Library 📚  
Sistema simples de gerenciamento de empréstimos de livros, desenvolvido em Node.js, com foco em boas práticas e testes automatizados.

---

## ✨ Funcionalidades Principais

| Código da HU | Funcionalidade | Descrição |
|--------------|---------------|-----------|
| **HU11** | Registro de datas de empréstimo e devolução | Cada empréstimo registra **data de retirada** e **data de devolução** no histórico do usuário. |
| **HU12** | Bloqueio em caso de atraso | Usuário com livro emprestado há **mais de 7 dias** fica impedido de realizar novos empréstimos. |
| **HU16** | Limite de empréstimos por usuário | Define quantos livros o usuário pode tomar emprestado simultaneamente. |

---

## 🏗 Arquitetura do Projeto

src/
├─ models/
│ ├─ user.js
│ └─ book.js
├─ repo/
│ └─ in-memory-repository.js
├─ services/
│ └─ library-service.js
├─ tests/
│ └─ library-service.test.js
└─ ui/
└─ console-ui.js
app.js

- `User.js` → Gerencia dados do usuário, empréstimos e histórico  
- `LibraryService.js` → Contém regras de negócio e validações  
- `InMemoryRepository.js` → Armazena livros e usuários em memória  
- `library-service.test.js` → Testes unitários com **Jest**  
- `app.js` → Interface em linha de comando (terminal)
---
## 💾 Pré-requisitos

- Node.js **>= 18**
- npm instalado
---

## 🚀 Como Executar o Sistema
Instale as dependências:

```bash
npm install
```
Execute o sistema no terminal:

```bash
node src/app.js
```

🧪 Testes Automatizados (Jest)
Rodar todos os testes:

```bash
npm test
```
