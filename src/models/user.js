// models/User.js
class User {
  constructor(id, name) {
    if (!id) throw new Error("Identificador inválido");
    this.id = id;
    this.name = name || "";
    // loans será um Set de títulos emprestados
    this.loans = new Set();
    this.loanHistory = [];
  }

  borrow(title) {
    this.loans.add(title);
    this.loanHistory.push({
      title,
      dataEmprestimo: new Date(),
      dataDevolucao: null
    });
  }

  hasBorrowed(title) {
    return this.loans.has(title);
  }

  return(title) {
    this.loans.delete(title);
    // Marca data de devolução no histórico
    const loan = this.loanHistory.find(
      l => l.title === title && l.dataDevolucao === null
    );
    if (loan) {
      loan.dataDevolucao = new Date();
    }
  }

  loanCount() {
    return this.loans.size;
  }

  listLoans() {
    return Array.from(this.loans);
  }
  //listar histórico com datas
  listLoanHistory() {
    return this.loanHistory.map(l => ({ ...l }));
  }
}

module.exports = User;
