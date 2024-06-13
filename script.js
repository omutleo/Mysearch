document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    fetch('articles.json')
        .then(response => response.json())
        .then(data => {
            const results = data.articles.filter(article => 
                article.title.toLowerCase().includes(query) || 
                article.content.toLowerCase().includes(query)
            );

            if (results.length > 0) {
                results.forEach(article => {
                    const articleElement = document.createElement('div');
                    articleElement.innerHTML = `<h2>${article.title}</h2><p>${article.content}</p>`;
                    resultsContainer.appendChild(articleElement);
                });
            } else {
                resultsContainer.innerHTML = '<p>No articles found</p>';
            }
        })
        .catch(error => console.error('Error fetching articles:', error));
});
