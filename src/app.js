// app.js
const InMemoryRepository = require('./repo/in-memory-repository');
const LibraryService = require("./services/Library-service");
const ui = require("./ui/console-ui");

const repo = new InMemoryRepository();
const service = new LibraryService(repo);

function run() {
  let opt;
  do {
    opt = ui.showMenu();

    try {
      switch (opt) {
        case "1": {
          const title = ui.prompt("Título: ");
          const author = ui.prompt("Autor: ");
          const q = parseInt(ui.prompt("Quantidade: "), 10);
          service.registerBook(title, author, q);
          console.log("Livro cadastrado.");
          break;
        }
        case "2":
          console.log("Livros cadastrados:");
          service.listBooks().forEach(b => {
            console.log(`${b.title} - ${b.author} | Disponível: ${b.quantity}`);
          });
          break;
        case "3": {
          const title = ui.prompt("Título a remover: ");
          service.removeBook(title);
          console.log("Livro removido.");
          break;
        }
        case "4": {
          const id = ui.prompt("ID do usuário: ");
          const name = ui.prompt("Nome: ");
          service.registerUser(id, name);
          console.log("Usuário cadastrado.");
          break;
        }
        case "5":
          console.log("Usuários:");
          service.listUsers().forEach(u => {
            console.log(`${u.id} - ${u.name}`);
          });
          break;
        case "6": {
          const userId = ui.prompt("ID do usuário: ");
          const title = ui.prompt("Título do livro: ");
          service.borrowBook(userId, title);
          console.log("Empréstimo realizado.");
          break;
        }
        case "7": {
          const userId = ui.prompt("ID do usuário: ");
          const title = ui.prompt("Título do livro: ");
          service.returnBook(userId, title);
          console.log("Devolução realizada.");
          break;
        }
        case "8": {
          const userId = ui.prompt("ID do usuário: ");
          const loans = service.listLoans(userId);
          console.log(`Empréstimos de ${userId}: ${loans.join(", ") || "(nenhum)"}`);
          break;
        }
        case "0":
          console.log("Até logo!");
          break;
        default:
          console.log("Opção inválida.");
      }
    } catch (err) {
      console.log("Erro:", err.message);
    }

    if (opt !== "0") ui.pause();
  } while (opt !== "0");
}

if (require.main === module) {
  run();
}

module.exports = { run, service, repo };