// services/LibraryService.js
const Book = require("../models/book");
const User = require("../models/User");

class LibraryService {
  constructor(repository) {
    this.repo = repository;
    this.loanLimit = 3;
    this.prazoDias = 7;
  }

  setLoanLimit(limit) {
    if (limit < 1) throw new Error("O limite deve ser no mínimo 1");
    this.loanLimit = limit
  }
  setPrazoDias(dias) {
    if (dias < 1) throw new Error("O prazo deve ser ao menos 1 dia");
    this.prazoDias = dias;
  }

  // --- Book operations ---
  registerBook(title, author, quantity = 1) {
    if (this.repo.findBook(title)) {
      throw new Error("Livro já existe na biblioteca");
    }
    const book = new Book(title, author, quantity);
    this.repo.addBook(book);
    return book;
  }

  listBooks() {
    return this.repo.listBooks();
  }

  removeBook(title) {
    const book = this.repo.findBook(title);
    if (!book) throw new Error("Livro não encontrado");
    if (book.quantity !== book.originalQuantity) {
      throw new Error("Não é possível remover: há exemplares emprestados");
    }
    this.repo.removeBook(title);
    return true;
  }

  // --- User operations ---
  registerUser(id, name) {
    if (this.repo.findUser(id)) {
      throw new Error("Usuário já cadastrado");
    }
    const user = new User(id, name);
    this.repo.addUser(user);
    return user;
  }

  listUsers() {
    return this.repo.listUsers();
  }

  // --- Loan operations ---
  borrowBook(userId, title) {
    const user = this.repo.findUser(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const book = this.repo.findBook(title);
    if (!book) throw new Error("Livro não encontrado");
    if (book.quantity <= 0) throw new Error("Nenhum exemplar disponível");
  
    // verificar atraso
    const agora = new Date();
    const limiteMs = this.prazoDias * 24 * 60 * 60 * 1000
    
    for (const registro of user.loanHistory) {
      if (registro.dataDevolucao === null && (agora - registro.dataEmprestimo) > limiteMs) {
        throw new Error("Usuário possui empréstimo atrasado e está bloqueado");
      }
    }

    // regras do usuário
    if (user.loanCount() >= this.loanLimit) throw new Error(`Usuário atingiu o limite de empréstimos (${this.loanLimit})`);
    if (user.hasBorrowed(book.title)) throw new Error("Usuário já tem esse livro emprestado");

    // tudo ok -> registra empréstimo
    book.quantity -= 1;
    user.borrow(book.title);
    return true;
  }

  returnBook(userId, title) {
    const user = this.repo.findUser(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const book = this.repo.findBook(title);
    if (!book) throw new Error("Livro não encontrado");

    if (!user.hasBorrowed(book.title)) throw new Error("Usuário não emprestou este livro");

    if (book.quantity + 1 > 5) throw new Error("Quantidade máxima atingida");

    // devolução
    book.quantity += 1;
    user.return(book.title);
    return true;
  }

  listLoans(userId) {
    const user = this.repo.findUser(userId);
    if (!user) throw new Error("Usuário não encontrado");
    return user.listLoans();
  }
}

module.exports = LibraryService;
