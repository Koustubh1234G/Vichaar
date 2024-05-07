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
                <blockquote class="quoteText">${this.renderMarkdown(this.text)}</blockquote >
                <div class="row">
                    <div id="author">
                        <p class="extraText">~${this.author}</p>
                    </div>
                    <div class="row" id="share">
                        <button class="shareBtn" id="facebookShareBtn"><i class="fa fa-facebook"></i></button>
                        <button class="shareBtn" id="twitterShareBtn"><i class="fa fa-twitter"></i></button>
                        <button class="shareBtn" id="whatsappShareBtn"><i class="fa fa-whatsapp "></i></button>
                        <button class="shareBtn" id="allShareBtn"><i class="fa fa-share-alt"></i></button>
                        <!-- Add more share options as needed -->
                    </div>
                </div>
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
        this.shareBtn = document.querySelectorAll('#shareBtn')
        this.paginationContainer = document.getElementById('paginationContainer');
        // this.allShareBtn = document.getElementById('allShareBtn');
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

    // In your UIManager class or wherever appropriate
    shareViaSites(site, text, author) {
        const promotion = 'https://koustubh1234g.github.io/Vichaar/';
        const message = `${text}\n${author}\n\nQuote by: ${promotion}`;
        let url = '';
        switch (site) {
            case 'whatsapp': {
                const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
                const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                url = navigator.userAgent.match(/Android/i) ? whatsappAppUrl : whatsappWebUrl;
                break;
            }
            case 'twitter': {
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
                break;
            }
            case 'facebook': {
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message)}`;
                break;
            }
            case 'all': {
                alert("This feature is not yet Implemented.");
                break;
            }
            default: {
                // Handle unsupported site or default case
                break;
            }
        }
        if (url) {
            window.open(url, '_blank');
        }
    }
    

    attachShareEventListeners(quoteElement) {
        const whatsappShareBtn = quoteElement.querySelector('#whatsappShareBtn');
        const facebookShareBtn = quoteElement.querySelector('#facebookShareBtn');
        const twitterShareBtn = quoteElement.querySelector('#twitterShareBtn');
        const allShareBtn = quoteElement.querySelector('#allShareBtn');

        // Attach event listener for WhatsApp share button
        whatsappShareBtn.addEventListener('click', () => {
            const quoteTextHTML = quoteElement.querySelector('blockquote').innerHTML;
            const authorText = quoteElement.querySelector('.extraText').textContent;
            const quoteText = this.stripHtmlTags(quoteTextHTML);
            this.shareViaSites('whatsapp', quoteText, authorText);
        });

        // Attach event listener for Facebook share button
        facebookShareBtn.addEventListener('click', () => {
            const quoteTextHTML = quoteElement.querySelector('blockquote').innerHTML;
            const authorText = quoteElement.querySelector('.extraText').textContent;
            const quoteText = this.stripHtmlTags(quoteTextHTML);
            this.shareViaSites('facebook', quoteText, authorText);
        });

        // Attach event listener for Twitter share button
        twitterShareBtn.addEventListener('click', () => {
            const quoteTextHTML = quoteElement.querySelector('blockquote').innerHTML;
            const authorText = quoteElement.querySelector('.extraText').textContent;
            const quoteText = this.stripHtmlTags(quoteTextHTML);
            this.shareViaSites('twitter', quoteText, authorText);
        });

        // Attach event listener for all share button
        allShareBtn.addEventListener('click', () => {
            const quoteTextHTML = quoteElement.querySelector('blockquote').innerHTML;
            const authorText = quoteElement.querySelector('.extraText').textContent;
            const quoteText = this.stripHtmlTags(quoteTextHTML);
            this.shareViaSites('all', quoteText, authorText);
        });
    }

    stripHtmlTags(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    }

    displayQuotes(quotes) {
        this.quotesContainer.innerHTML = '';
        quotes.forEach(quote => {
            const quoteElement = document.createElement('div');
            quoteElement.innerHTML = quote.display();
            this.attachShareEventListeners(quoteElement); // Attach share event listener
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
