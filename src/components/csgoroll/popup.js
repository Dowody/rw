document.addEventListener('DOMContentLoaded', function() {
    const cookieContainer = document.getElementById('cookie-value');
    const copyButton = document.getElementById('copy-button');
    const statusMessage = document.getElementById('status-message');
    const domainButtons = document.querySelectorAll('.domain-btn');
    
    let currentDomain = 'csgoroll.com';
    let sessionCookie = null;
    
    fetchSessionCookie();
    
    domainButtons.forEach(button => {
      button.addEventListener('click', function() {
        domainButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentDomain = this.dataset.domain;
        fetchSessionCookie();
      });
    });
    
    copyButton.addEventListener('click', function() {
      if (!sessionCookie) return;
      
      navigator.clipboard.writeText(sessionCookie).then(() => {
        statusMessage.textContent = 'Cookie copied to clipboard!';
        setTimeout(() => {
          statusMessage.textContent = '';
        }, 2000);
      }).catch(err => {
        statusMessage.textContent = 'Failed to copy: ' + err;
      });
    });
    
    function fetchSessionCookie() {
      chrome.cookies.getAll({ domain: currentDomain }, function(cookies) {
        sessionCookie = null;
        
        for (let cookie of cookies) {
          if (cookie.name === 'session') {
            sessionCookie = cookie.value;
            break;
          }
        }
        
        if (sessionCookie) {
          cookieContainer.innerHTML = sessionCookie;
          copyButton.disabled = false;
        } else {
          cookieContainer.innerHTML = '<div class="empty-message">No session cookie found for ' + currentDomain + '. Please visit the site first.</div>';
          copyButton.disabled = true;
        }
      });
    }
  });