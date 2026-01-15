// Hytale Javadoc JavaScript

var searchIndex = [];
var classIndex = [];
var packageIndex = [];

function OnLoad(frameset) {
    initializeIndices();
}

function initializeIndices() {
    // Initialize search index from meta tags
    var metaTags = document.getElementsByTagName('meta');
    for (var i = 0; i < metaTags.length; i++) {
        var name = metaTags[i].getAttribute('name');
        if (name === 'searchIndex') {
            try {
                searchIndex = JSON.parse(metaTags[i].getAttribute('content'));
            } catch (e) {
                searchIndex = [];
            }
        }
    }
    
    // Populate class and package indices
    var allLinks = document.getElementsByTagName('a');
    for (var i = 0; i < allLinks.length; i++) {
        var href = allLinks[i].getAttribute('href');
        if (href && href.endsWith('.html')) {
            var text = allLinks[i].textContent || allLinks[i].innerText;
            if (href.indexOf('/package-') !== -1) {
                packageIndex.push({name: text, href: href});
            } else if (href.indexOf('.html') !== -1 && href.indexOf('/') !== -1) {
                classIndex.push({name: text, href: href});
            }
        }
    }
}

function searchDocumentation(query) {
    if (!query || query.length < 2) {
        return [];
    }
    
    query = query.toLowerCase();
    var results = [];
    
    // Search through indexed terms
    for (var i = 0; i < searchIndex.length; i++) {
        var item = searchIndex[i];
        if (item.terms && item.terms.some(function(term) {
            return term.toLowerCase().indexOf(query) !== -1;
        })) {
            results.push({
                name: item.name,
                href: item.href,
                type: item.type,
                score: item.terms.reduce(function(acc, term) {
                    return acc + (term.toLowerCase().indexOf(query) !== -1 ? 1 : 0);
                }, 0)
            });
        }
    }
    
    // Sort by score
    results.sort(function(a, b) {
        return b.score - a.score;
    });
    
    return results.slice(0, 20);
}

function showSearchResults(results, searchBoxId, resultsId) {
    var searchBox = document.getElementById(searchBoxId);
    var resultsDiv = document.getElementById(resultsId);
    
    if (!searchBox || !resultsDiv) return;
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
    } else {
        var html = '<ul>';
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var typeLabel = result.type === 'class' ? 'Class' : 
                           result.type === 'method' ? 'Method' : 
                           result.type === 'field' ? 'Field' : 'Package';
            html += '<li><a href="' + result.href + '">' + result.name + '</a> (' + typeLabel + ')</li>';
        }
        html += '</ul>';
        resultsDiv.innerHTML = html;
    }
    
    resultsDiv.style.display = 'block';
}

function hideSearchResults(resultsId) {
    var resultsDiv = document.getElementById(resultsId);
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
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
            // Fallback for older browsers
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
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#4D7A97;color:#fff;' +
                                 'padding:10px 20px;border-radius:4px;z-index:9999;animation:fadeIn 0.3s;';
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

function highlightSearchTerms(query) {
    if (!query || query.length < 2) return;
    
    query = query.toLowerCase();
    var elements = document.querySelectorAll('.methodName, .fieldName, .block p, .title');
    
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var text = element.textContent || element.innerText;
        if (text.toLowerCase().indexOf(query) !== -1) {
            element.style.backgroundColor = '#ffffcc';
            setTimeout(function(el) {
                el.style.backgroundColor = '';
            }, 2000, element);
        }
    }
}

function navigateToClass(className) {
    // Find the class in the class frame
    var classFrame = window.frames['classFrame'];
    if (classFrame) {
        classFrame.location.href = className + '.html';
    }
}

function showAllClasses() {
    var content = '<div class="indexContainer">' +
                  '<h2 title="Classes">All Classes and Interfaces</h2>' +
                  '<ul title="Classes">';
    
    classIndex.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    
    for (var i = 0; i < classIndex.length; i++) {
        content += '<li><a href="' + classIndex[i].href + '" target="classFrame">' + 
                   classIndex[i].name + '</a></li>';
    }
    
    content += '</ul></div>';
    document.body.innerHTML = content;
}

function showAllPackages() {
    var content = '<div class="indexContainer">' +
                  '<h2 title="Packages">All Packages</h2>' +
                  '<ul title="Packages">';
    
    packageIndex.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    
    for (var i = 0; i < packageIndex.length; i++) {
        content += '<li><a href="' + packageIndex[i].href + '" target="packageFrame">' + 
                   packageIndex[i].name + '</a></li>';
    }
    
    content += '</ul></div>';
    document.body.innerHTML = content;
}

// Add keyboard shortcuts
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
    document.addEventListener('DOMContentLoaded', initializeIndices);
} else {
    initializeIndices();
}
