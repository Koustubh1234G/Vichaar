// Quote class
class Quote {
    constructor(id, text, author, tags) {
        this.id = id;
        this.text = text;
        this.author = author;
        this.tags = tags;
    }

    renderMarkdown(text) {
        if (marked) {
            const rendered =  marked.parse(text);
            return rendered;
        }
        return text;
    }

    // method to display on UI
    display() {
        return `
            <div class="quoteCard">
                <p class="quoteText">${this.renderMarkdown(this.text)}</p>
                <p class="extraText">~${this.author}</p>
                <p class="extraText">Tags: ${this.tags.join(', ')}</p>
            </div>
        `;
    }
}   

// QuoteManager class
class QuoteManager {
    constructor() {
        this.quotes = [];
        this.currentPage = 1;
        this.quotesPerPage = 10;
        this.randomIndex = null;
    }

    addQuote(quote) {
        this.quotes.push(quote);
    }

    getQuotes() {
        return this.quotes;
    }

    getUniqueTags() {
        const tags = this.quotes.flatMap(quote => quote.tags);
        const uniqueTags = [...new Set(tags)];
        // console.log("All tags:", tags);  // Debugging
        // console.log("Unique tags:", uniqueTags);  // Debugging
        return uniqueTags;
    }

    filterByTags(tag) {
        return this.quotes.filter(quote => quote.tags.includes(tag));
    }

    setRandomIndex() {
        this.randomIndex = Math.floor(Math.random() * this.quotes.length);
        // console.log("Random index:", this.randomIndex); // Debugging
    }

    getRandomQuotes(count) {
        if (this.quotes.length === 0) {
            return [];
        }
        const randomQuotes = [];
        const usedIndexes = new Set();
        while (randomQuotes.length < count && usedIndexes.size < this.quotes.length) {
            const randomIndex = Math.floor(Math.random() * this.quotes.length);
            if (!usedIndexes.has(randomIndex)) {
                randomQuotes.push(this.quotes[randomIndex]);
                usedIndexes.add(randomIndex);
            }
        }
        // console.log('randomQuotes in getRandomQuotes:', randomQuotes);
        return randomQuotes;
    }
    
    

    // methods related to pagination
    getTotalPages() {
        const totalPages = Math.ceil(this.quotes.length / this.quotesPerPage);
        // console.log("Total pages:", totalPages);  // Debugging
        return totalPages;
    }

    getCurrentPageQuotes() {
        const startIndex = (this.currentPage - 1) * this.quotesPerPage;
        const endIndex = startIndex + this.quotesPerPage;
        return this.quotes.slice(startIndex, endIndex);
    }

    nextPage() {
        if(this.currentPage < this.getTotalPages()) {
            this.currentPage++;
            // app.uiManager.currentpage++;
            // console.log("currentPage: ", app.uiManager.currentpage); //debugging
            // console.log("currentPage: ", this.currentPage); //debugging
            return true;
        }
        return false;
    }

    prevPage() {
        if(this.currentPage > 1) {
            this.currentPage--;
            return true;
        }
        return false;
    }
}

// UIManager class
class UIManager {
    constructor() {
        this.tagsContainer = document.getElementById('tagsContainer');
        this.quotesContainer = document.getElementById('quotesContainer');
        this.paginationContainer = document.getElementById('paginationContainer');
    }

    displayTags(tags) {
        // console.log("Displaying tags:", tags);  // Debugging
        this.tagsContainer.innerHTML = '';

        tags.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.classList.add("tags");
            tagButton.textContent = tag;
            
            tagButton.addEventListener('click', () => {
                const filteredQuotes = app.quoteManager.filterByTags(tag);
                app.uiManager.displayQuotes(filteredQuotes);
            });
            
            this.tagsContainer.appendChild(tagButton);
        });
    }

    displayQuotes(quotes) {
        this.quotesContainer.innerHTML = '';
        quotes.forEach(quote => {
            const quoteElement = document.createElement('div');
            quoteElement.innerHTML = quote.display();
            this.quotesContainer.appendChild(quoteElement);
        });
    }    

    // pagination controls
    displayPagination() {
        const totalPages = app.quoteManager.getTotalPages();
        var currentpage = app.quoteManager.currentPage;

        // Clear previous pagination controls
        this.paginationContainer.innerHTML = '';

        // prev btn
        const prevButton = document.createElement("button");
        prevButton.textContent = "Prev";
        prevButton.addEventListener("click", () => {
            if(app.quoteManager.prevPage()) {
                currentpage = app.quoteManager.currentPage;
                pageIndicator.textContent = `Page ${currentpage} of ${totalPages}`;
                this.displayQuotes(app.quoteManager.getCurrentPageQuotes());
            }
        });
        this.paginationContainer.appendChild(prevButton);

        // current page indicatior
        const pageIndicator = document.createElement("span");
        pageIndicator.textContent = `Page ${currentpage} of ${totalPages}`;
        this.paginationContainer.appendChild(pageIndicator);

        // next button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            if(app.quoteManager.nextPage()) {
                currentpage = app.quoteManager.currentPage;
                pageIndicator.textContent = `Page ${currentpage} of ${totalPages}`;
                this.displayQuotes(app.quoteManager.getCurrentPageQuotes());
            }
        });
        this.paginationContainer.appendChild(nextButton);
    }
}

// App class
class App {
    constructor() {
        this.quoteManager = new QuoteManager();
        this.uiManager = new UIManager();
    }

    displayRandomQuotes(count) {
        const randomQuotes = this.quoteManager.getRandomQuotes(count);
        this.uiManager.displayQuotes(randomQuotes);
    }

    init() {
        this.loadQuotes();
        this.displayRandomQuotes(10); // Call displayRandomQuote after loading quotes
        this.uiManager.displayPagination();
    }

    loadQuotes() {
        fetch("data.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                data.quotes.forEach(quoteData => {
                    const quote = new Quote(quoteData.id, quoteData.text, quoteData.author, quoteData.tags);
                    this.quoteManager.addQuote(quote);
                });

                this.uiManager.displayTags(this.quoteManager.getUniqueTags());
                this.uiManager.displayQuotes(this.quoteManager.getCurrentPageQuotes());
                this.uiManager.displayPagination();
            })
            .catch(error => {
                console.error("Error loading quotes: ", error);
            });
    }

    displayRandomQuote() {
        this.loadQuotes();
        // console.log("Quotes array: in displayRandomQuote", this.quoteManager.getQuotes()); // Debugging
        const randomQuote = this.quoteManager.getRandomQuote();
        // console.log("Random quote:  in displayRandomQuote", randomQuote); // Debugging
        if (randomQuote) {
            this.uiManager.displayQuotes([randomQuote]);
        }
    }
    
}

// Initialize app
const app = new App();
app.init();
