// Hytale Javadoc JavaScript

var searchIndex = [];
var classIndex = [];
var packageIndex = [];

function OnLoad(frameset) {
    initializeIndices();
    setupSearch();
}

function initializeIndices() {
    // Load search index from JSON file
    var script = document.createElement('script');
    script.src = 'search-index.js';
    script.onload = function() {
        if (typeof searchData !== 'undefined') {
            searchIndex = searchData;
            populateIndices();
        }
    };
    document.head.appendChild(script);
}

function populateIndices() {
    // Populate class and package indices from search index
    for (var i = 0; i < searchIndex.length; i++) {
        var item = searchIndex[i];
        if (item.kind === 'class' || item.kind === 'interface') {
            classIndex.push(item);
        }
    }
    
    // Extract unique packages
    var packages = {};
    for (var i = 0; i < searchIndex.length; i++) {
        var item = searchIndex[i];
        packages[item.package] = true;
    }
    
    packageIndex = Object.keys(packages).sort();
}

function setupSearch() {
    // Setup search box if it exists
    var searchInput = document.getElementById('searchBox');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            var query = e.target.value.trim();
            if (query.length >= 2) {
                var results = searchDocumentation(query);
                showSearchResults(results, 'searchBox', 'searchResults');
            } else {
                hideSearchResults('searchResults');
            }
        });
        
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideSearchResults('searchResults');
                searchInput.blur();
            }
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.searchBox')) {
                hideSearchResults('searchResults');
            }
        });
    }
}

function searchDocumentation(query) {
    if (!query || query.length < 2 || searchIndex.length === 0) {
        return [];
    }
    
    query = query.toLowerCase();
    var results = [];
    
    // Search through index
    for (var i = 0; i < searchIndex.length; i++) {
        var item = searchIndex[i];
        var score = 0;
        
        // Check name (highest priority)
        if (item.name.toLowerCase().indexOf(query) !== -1) {
            score += 10;
            if (item.name.toLowerCase().startsWith(query)) {
                score += 5;
            }
        }
        
        // Check description
        if (item.description && item.description.toLowerCase().indexOf(query) !== -1) {
            score += 2;
        }
        
        // Check package
        if (item.package.toLowerCase().indexOf(query) !== -1) {
            score += 1;
        }
        
        if (score > 0) {
            results.push({
                name: item.name,
                href: item.href,
                kind: item.kind,
                package: item.package,
                score: score
            });
        }
    }
    
    // Sort by score
    results.sort(function(a, b) {
        return b.score - a.score;
    });
    
    return results.slice(0, 20);
}

function showSearchResults(results, inputId, resultsId) {
    var searchInput = document.getElementById(inputId);
    var resultsDiv = document.getElementById(resultsId);
    
    if (!searchInput || !resultsDiv) return;
    
    var rect = searchInput.getBoundingClientRect();
    resultsDiv.style.top = (rect.bottom + window.scrollY) + 'px';
    resultsDiv.style.left = rect.left + 'px';
    resultsDiv.style.width = rect.width + 'px';
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<div style="padding: 10px; color: #666;">No results found.</div>';
    } else {
        var html = '';
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var kindLabel = result.kind === 'class' ? 'Class' : 
                           result.kind === 'interface' ? 'Interface' : 
                           result.kind === 'method' ? 'Method' : 
                           result.kind === 'field' ? 'Field' : result.kind;
            html += '<a href="' + result.href + '">' +
                    '<strong>' + result.name + '</strong> ' +
                    '<span style="color: #666; font-size: 12px;">(' + kindLabel + ')</span>' +
                    '<br><span style="color: #999; font-size: 11px;">' + result.package + '</span>' +
                    '</a>';
        }
        resultsDiv.innerHTML = html;
    }
    
    resultsDiv.classList.add('show');
}

function hideSearchResults(resultsId) {
    var resultsDiv = document.getElementById(resultsId);
    if (resultsDiv) {
        resultsDiv.classList.remove('show');
    }
}

function copyCode(elementId) {
    var preElement = document.getElementById(elementId);
    if (preElement) {
        var text = preElement.textContent || preElement.innerText;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                showNotification('Code copied to clipboard!');
            }).catch(function(err) {
                console.error('Failed to copy:', err);
            });
        } else {
            // Fallback
            var textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification('Code copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
            document.body.removeChild(textArea);
        }
    }
}

function showNotification(message) {
    var notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.animation = 'fadeOut 0.3s';
        setTimeout(function() {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

function toggleSection(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        if (element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + F for search
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
        e.preventDefault();
        var searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.focus();
        }
    }
});

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        OnLoad();
        setupSearch();
    });
} else {
    OnLoad();
    setupSearch();
}
