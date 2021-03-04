const Modal = {
    open(){
        // Abrir modal
        // procure pelo seletor css .modal-overlay na lista de classe dele adicione um 'active'
        document
            .querySelector('.modal-overlay') 
            .classList
            .add('active')
    },
    close(){
        // fechar o modal
        // procure pelo seletor css .modal-overlay na lista de classe dele adicione um 'remove'
  
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}


const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    // add nova transaçao 
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    // botao de remover 
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    // somar as entradas 
    incomes() {
        let income = 0;
        // pegar td as transaçoes para cada transaçao 
        Transaction.all.forEach(transaction => {
        // se for maior que zero soma e retorna a variavel (income)    
            if( transaction.amount > 0 ) {
                income += transaction.amount;
            }
        })
        return income;
    },

    // somar saidas 
    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    // entradas - menos saidas 
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

// pegando as tabelas / transaction pelo html e passando para o js 
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        
        const tr = document.createElement('tr') // tr era do html q foi criado aqui para armazenar o DOM  
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

// a unica classe que mudava de nome dentre as tres (luz, internet, website) da tabela era o expense entao com uma verificaçao usando o ternario 
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    // limpar transaçoes 
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// Formataçao dos valores 
const Utils = {
    formatAmount(value){
        value = value * 100
        
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    // formataçao de sinais 
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        // formataçao de moeda 
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

       return signal + value
    }
}

const Form = {
    // pegando propriedades para serem usadas dentro da aplicaçao 
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // validaçao de campos 
    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        // trim faz uma limpeza dos espaços vazios / verificando campos vazios
        if( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    
    // limpar dados 
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    // url formatada 
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()