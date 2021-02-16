// The scope of this js is just the popup below the extension button.
// So, in order to access to the real DOM we need to send a Reuest and handle it in content.js.
document.addEventListener('DOMContentLoaded', function() {
    
    // when opening extension, make the calculation
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {action: "get-saldo"}, function(response) {} );
    });

    var checkPageButton = document.getElementById('checkPage');
    var checkSaldoButton = document.getElementById('check-saldo');
    var prefillButton = document.getElementById('prefill');
    var createTradeButton = document.getElementById('create-trade');
    [checkPageButton, checkSaldoButton, prefillButton, createTradeButton]
        .forEach( (btn) => {
        
        btn.addEventListener('click', function(e) {
            chrome.tabs.getSelected(null, function(tab) {
                switch (e.target.getAttribute('id')) {
                    case 'checkPage':
                        console.log('Export signal data' + tab.id)
                        // Send a request to the content.js to create the copy paste snippet.
                        chrome.tabs.sendRequest(tab.id, {action: "getDOM"}, function(response) {
                            if (!response) {
                                alert('no reponse');
                                return;
                            }
                            console.log('tab id: '+tab.id, response.dom);
                        });
                    break;
                    case 'check-saldo':
                        // send request to update the saldo. Loginc and output in content.js
                        chrome.tabs.sendRequest(tab.id, {action: "get-saldo"}, function(response) {
                            return;
                        });
                        break;
                    case 'prefill':
                        chrome.tabs.sendRequest(tab.id, {action: "get-prefill-data"}, function(response) {
                            if (!response) {
                                alert('no reponse');
                                return;
                            }
                            // prefill the input #base-price with the price LAST of current currency
                            var { current_last } = response;
                            document.querySelector('#base-price').value = current_last;
                        });
                    break;

                    // for Manual trding at profitfarmers.trailingcrypto.com
                    case 'create-trade':
                        var prefillButton = document.getElementById('prefill');
                        var buy_price = prefillButton.value;
                        chrome.tabs.getSelected(null, function(tab) {
                            chrome.tabs.sendRequest(tab.id, {action: "trigger-orders", buy_price: buy_price}, function(response) {
                                if (!response) {
                                    alert('no reponse');
                                    return;
                                }
                                alert('Orders triggered.');
                            });
                        });
                    break;
                    default:
                    break;
                }
                
                
            });
        }, false);
    }); 




}, false);
