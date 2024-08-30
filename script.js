const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results');

function searchArticles() {
  const query = searchInput.value.toLowerCase();
  resultsContainer.innerHTML = '';

  fetch('articles.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const results = data.articles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.content.toLowerCase().includes(query)
      );

      if (results.length > 0) {
        results.forEach(article => {
          const articleElement = document.createElement('div');
          const formattedContent = article.content
            .replace(/\n/g, '<br>')
            .replace(/(Почта:[^<]*)/g, '<strong>$1</strong>') // Выделение жирным "Почта:" и значений
            .replace(/(Стасус проверки поставщика:[^<]*)/g, '<strong>$1</strong>')
            .replace(/(Контактное лицо:[^<]*)/g, '<strong>$1</strong>'); // Выделение жирным "Контактное лицо:" и значений
          articleElement.innerHTML = `<h2>${article.title}</h2><p>${formattedContent}</p>`;
          resultsContainer.appendChild(articleElement);
        });
      } else {
        resultsContainer.innerHTML = '<p>No articles found</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching articles:', error);
      resultsContainer.innerHTML = '<p>Error fetching articles</p>';
    });
}

searchButton.addEventListener('click', searchArticles);

searchInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    searchArticles();
  }
});
