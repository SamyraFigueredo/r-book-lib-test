// tests/library-service.test.js
const LibraryService = require('../services/library-service');

// Mock do repositório para simular o comportamento do banco de dados
const mockRepository = () => {
  const books = new Map();
  const users = new Map();
  
  return {
    // Book operations
    findBook: (title) => books.get(title),
    addBook: (book) => books.set(book.title, book),
    removeBook: (title) => books.delete(title),
    listBooks: () => Array.from(books.values()),
    
    // User operations
    findUser: (id) => users.get(id),
    addUser: (user) => users.set(user.id, user),
    listUsers: () => Array.from(users.values()),
    
    // Métodos auxiliares para os testes
    _clear: () => {
      books.clear();
      users.clear();
    },
    _getBook: (title) => books.get(title),
    _getUser: (id) => users.get(id)
  };
};

describe('LibraryService', () => {
  let libraryService;
  let repository;

  beforeEach(() => {
    repository = mockRepository();
    libraryService = new LibraryService(repository);
  });

  afterEach(() => {
    repository._clear();
  });

  describe('Cadastro de Livro', () => {
    test('deve cadastrar livro com sucesso', () => {
      const book = libraryService.registerBook('Dom Casmurro', 'Machado de Assis', 3);
      
      expect(book.title).toBe('Dom Casmurro');
      expect(book.author).toBe('Machado de Assis');
      expect(book.quantity).toBe(3);
      expect(book.originalQuantity).toBe(3);
    });

    test('deve lançar erro ao cadastrar livro com título duplicado', () => {
      libraryService.registerBook('Dom Casmurro', 'Machado de Assis');
      
      expect(() => {
        libraryService.registerBook('Dom Casmurro', 'Outro Autor');
      }).toThrow('Livro já existe na biblioteca');
    });

    test('deve lançar erro ao cadastrar livro com quantidade inválida (<=0)', () => {
      expect(() => {
        libraryService.registerBook('Dom Casmurro', 'Machado de Assis', 0);
      }).toThrow('Quantidade deve ser positiva');

      expect(() => {
        libraryService.registerBook('Dom Casmurro', 'Machado de Assis', -1);
      }).toThrow('Quantidade deve ser positiva');
    });
  });

  describe('Cadastro de Usuário', () => {
    test('deve cadastrar usuário com sucesso', () => {
      const user = libraryService.registerUser('123', 'João Silva');
      
      expect(user.id).toBe('123');
      expect(user.name).toBe('João Silva');
    });

    test('deve lançar erro ao cadastrar usuário com identificador duplicado', () => {
      libraryService.registerUser('123', 'João Silva');
      
      expect(() => {
        libraryService.registerUser('123', 'Maria Santos');
      }).toThrow('Usuário já cadastrado');
    });
  });

  describe('Empréstimo de Livro', () => {
    beforeEach(() => {
      libraryService.registerBook('Dom Casmurro', 'Machado de Assis', 2);
      libraryService.registerUser('123', 'João Silva');
    });

    test('deve lançar erro ao emprestar livro inexistente', () => {
      expect(() => {
        libraryService.borrowBook('123', 'Livro Inexistente');
      }).toThrow('Livro não encontrado');
    });

    test('deve lançar erro ao emprestar com quantidade 0', () => {
      libraryService.registerBook('Sem Estoque', 'Autor', 1);
      libraryService.borrowBook('123', 'Sem Estoque');
      expect(() => {
        libraryService.borrowBook('123', 'Sem Estoque');
      }).toThrow('Nenhum exemplar disponível');
    });

    test('deve lançar erro ao emprestar para usuário inexistente', () => {
      expect(() => {
        libraryService.borrowBook('999', 'Dom Casmurro');
      }).toThrow('Usuário não encontrado');
    });

    test('deve lançar erro quando usuário já tem 3 livros emprestados', () => {
      // Cadastra mais livros
      libraryService.registerBook('Livro 1', 'Autor 1', 1);
      libraryService.registerBook('Livro 2', 'Autor 2', 1);
      libraryService.registerBook('Livro 3', 'Autor 3', 1);
      
      // Empresta 3 livros
      libraryService.borrowBook('123', 'Livro 1');
      libraryService.borrowBook('123', 'Livro 2');
      libraryService.borrowBook('123', 'Livro 3');
      
      expect(() => {
        libraryService.borrowBook('123', 'Dom Casmurro');
      }).toThrow('Usuário atingiu o limite de empréstimos (3)');
    });

    test('deve lançar erro quando usuário já tem o mesmo livro emprestado', () => {
      libraryService.borrowBook('123', 'Dom Casmurro');
      
      expect(() => {
        libraryService.borrowBook('123', 'Dom Casmurro');
      }).toThrow('Usuário já tem esse livro emprestado');
    });

    test('deve realizar empréstimo bem-sucedido', () => {
      const result = libraryService.borrowBook('123', 'Dom Casmurro');
      
      expect(result).toBe(true);
      
      // Verifica se a quantidade do livro foi decrementada
      const book = repository._getBook('Dom Casmurro');
      expect(book.quantity).toBe(1);
      
      // Verifica se o empréstimo foi registrado no usuário
      const user = repository._getUser('123');
      expect(user.hasBorrowed('Dom Casmurro')).toBe(true);
      expect(user.loanCount()).toBe(1);
    });
  });

  describe('Devolução de Livro', () => {
    beforeEach(() => {
      libraryService.registerBook('Dom Casmurro', 'Machado de Assis', 2);
      libraryService.registerUser('123', 'João Silva');
      libraryService.borrowBook('123', 'Dom Casmurro');
    });

    test('deve lançar erro ao devolver livro que usuário não emprestou', () => {
      libraryService.registerUser('456', 'Maria');
      
      expect(() => {
        libraryService.returnBook('456', 'Dom Casmurro');
      }).toThrow('Usuário não emprestou este livro');
    });

    test('deve lançar erro ao devolver livro inexistente', () => {
      expect(() => {
        libraryService.returnBook('123', 'Livro Inexistente');
      }).toThrow('Livro não encontrado');
    });

    test('deve lançar erro quando devolução excederia quantidade máxima', () => {
      // Configura o livro com quantidade máxima
      const book = repository._getBook('Dom Casmurro');
      book.quantity = 5; // Máximo permitido
      
      expect(() => {
        libraryService.returnBook('123', 'Dom Casmurro');
      }).toThrow('Quantidade máxima atingida');
    });

    test('deve realizar devolução bem-sucedida', () => {
      const result = libraryService.returnBook('123', 'Dom Casmurro');
      
      expect(result).toBe(true);
      
      // Verifica se a quantidade do livro foi incrementada
      const book = repository._getBook('Dom Casmurro');
      expect(book.quantity).toBe(2);
      
      // Verifica se o empréstimo foi removido do usuário
      const user = repository._getUser('123');
      expect(user.hasBorrowed('Dom Casmurro')).toBe(false);
      expect(user.loanCount()).toBe(0);
    });
  });

  describe('Remoção de Livro', () => {
    beforeEach(() => {
      libraryService.registerBook('Dom Casmurro', 'Machado de Assis', 3);
      libraryService.registerUser('123', 'João Silva');
    });

    test('deve lançar erro ao remover livro com exemplares emprestados', () => {
      libraryService.borrowBook('123', 'Dom Casmurro');
      
      expect(() => {
        libraryService.removeBook('Dom Casmurro');
      }).toThrow('Não é possível remover: há exemplares emprestados');
    });

    test('deve remover livro com sucesso quando todas as cópias estão disponíveis', () => {
      const result = libraryService.removeBook('Dom Casmurro');
      
      expect(result).toBe(true);
      
      // Verifica se o livro foi removido do repositório
      const book = repository._getBook('Dom Casmurro');
      expect(book).toBeUndefined();
    });

    test('deve lançar erro ao tentar remover livro inexistente', () => {
      expect(() => {
        libraryService.removeBook('Livro Inexistente');
      }).toThrow('Livro não encontrado');
    });
  });

  describe('Listagens', () => {
    test('deve listar livros corretamente', () => {
      libraryService.registerBook('Livro 1', 'Autor 1', 1);
      libraryService.registerBook('Livro 2', 'Autor 2', 2);
      
      const books = libraryService.listBooks();
      
      expect(books).toHaveLength(2);
      expect(books[0].title).toBe('Livro 1');
      expect(books[1].title).toBe('Livro 2');
    });

    test('deve listar usuários corretamente', () => {
      libraryService.registerUser('123', 'João');
      libraryService.registerUser('456', 'Maria');
      
      const users = libraryService.listUsers();
      
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('João');
      expect(users[1].name).toBe('Maria');
    });

    test('deve listar empréstimos do usuário', () => {
      libraryService.registerBook('Livro 1', 'Autor 1', 1);
      libraryService.registerUser('123', 'João');
      
      libraryService.borrowBook('123', 'Livro 1');
      
      const loans = libraryService.listLoans('123');
      
      expect(loans).toHaveLength(1);
      expect(loans[0]).toBe('Livro 1');
    });

    test('deve lançar erro ao listar empréstimos de usuário inexistente', () => {
      expect(() => {
        libraryService.listLoans('999');
      }).toThrow('Usuário não encontrado');
    });
  });

    describe('Regras de Empréstimo com Datas e Atraso)', () => {
    beforeEach(() => {
      libraryService.registerBook('Dom Casmurro', 'Machado de Assis', 1);
      libraryService.registerUser('123', 'João Silva');
    });

    test('deve registrar a data do empréstimo', () => {
      const before = Date.now();
      libraryService.borrowBook('123', 'Dom Casmurro');
      const user = repository._getUser('123');

      expect(user.loanCount()).toBe(1);

      const registro = user.loanHistory.find(l => l.title === 'Dom Casmurro' && l.dataDevolucao === null);
      expect(registro).toBeDefined();
      expect(registro.dataEmprestimo.getTime()).toBeGreaterThanOrEqual(before);
    });

    test('deve impedir empréstimo se houver livro atrasado há mais de 7 dias', () => {
      libraryService.borrowBook('123', 'Dom Casmurro');
      const user = repository._getUser('123');

      // Simula atraso > 7 dias
      const registro = user.loanHistory.find(l => l.title === 'Dom Casmurro' && l.dataDevolucao === null);
      registro.dataEmprestimo = new Date(Date.now() - (8 * 24 * 60 * 60 * 1000));

      // Recoloca estoque do livro para tentar novo empréstimo
      const book = repository._getBook('Dom Casmurro');
      book.quantity = 1;

      expect(() => {
        libraryService.borrowBook('123', 'Dom Casmurro');
      }).toThrow('Usuário possui empréstimo atrasado e está bloqueado');
    });

    test('deve registrar data de devolução corretamente', () => {
      libraryService.borrowBook('123', 'Dom Casmurro');
      libraryService.returnBook('123', 'Dom Casmurro');
      const user = repository._getUser('123');

    expect(user.loanCount()).toBe(0);
    });
  });
});