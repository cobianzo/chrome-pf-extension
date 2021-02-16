console.log('%cINIT EXTENSION','color:orange');

// Action fetch relevant data, and paste them in the screen and copy to clipboard.
// sends response to popup.js when requested
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    
    // delete previous
    const prevTable = document.querySelector('.pf-table');
    if (prevTable) prevTable.remove();
    
    // ACTION getDOM: fetch pf info for Google Sheet copy-paste
    if (request.action == "getDOM") {
        const modal = document.querySelector('.signal-preview-wrapper');
        if (modal) {
            const formattedModal = document.createElement('table');
            formattedModal.classList.add('pf-table');
            formattedModal.setAttribute('border', '1' )

            const coin = modal.querySelector('.theme-coin-name span').textContent;
            var coinPair = ['a','b'];
            ['USDT', 'BTC'].forEach( coinBase => {
                if (coin.endsWith(coinBase)) {
                    coinPair = [coinBase, coin.replace(coinBase,'')]
            }} );
            const entry = modal.querySelector('.entry .item-value span').textContent;
            const targetListNode = modal.querySelectorAll('.targetLists .item-value');
            const targets = Array.from(targetListNode).map( node => node.textContent );
            const stopLoss = modal.querySelector('.stop-loss .item-value').textContent;

            const amount = 500; // $500
            const lastPrice = modal.querySelector('.theme-crypto-dates span:last-child b').textContent

            let i = 0;
            formattedModal.innerHTML = `
                    <tr><td>${entry}</td><td></td><td></td></tr>
                    <tr>
                        <td>${coinPair.join('/')}</td>
                        <td>T${i+1}</td>
                        <td>${ targets[i++]?? 0 }</td>
                    </tr>
                    <tr>
                        <td>${ amount }</td>
                        <td>T${i+1}</td>
                        <td>${ targets[i++]?? 0 }</td>
                    </tr>
                    <tr>
                        <td>${ lastPrice }</td>
                        <td>T${i+1}</td>
                        <td>${ targets[i++]?? 0 }</td>
                    </tr>
                    <tr>
                        <td>${'-'}</td>
                        <td>T${i+1}</td>
                        <td>${ targets[i++]?? 0 }</td>
                    </tr>     
                    <tr>
                        <td>${'-'}</td>
                        <td>SL</td>
                        <td>${ stopLoss }</td>
                    </tr>                                                        
            `;
            modal.prepend(formattedModal);
            selectElementContents(formattedModal);
            document.execCommand("copy");
            // now the table is in the clipboard
            sendResponse({dom: "FOUNDDD"});
        } else {
            alert('no signal modal popup to read.');
            sendResponse({dom: "The dom that you want to get"});
        }

        if (modal)
            sendResponse({dom: "The dom that you want to get"});

    } else 
    // ACTION getDOM: fetch pf info for Google Sheet copy-paste
    if (request.action == "get-saldo") {
        if (!document.querySelector('.balance-text')) return false;
        document.querySelector('.saldo-check')?.remove();
        const total = getSaldo();
        var newNode = document.createElement("span");
        newNode.classList.add('saldo-check');
        var html = `$${total} (earns: $${Math.round(total-3555)}`;
        newNode.innerHTML = html;
        document.querySelector('.main-content').prepend(newNode);
        sendResponse({status: total});
    }
    else
    // ACTION get LAST PRICE from page and copy in Extension popup.
    if (request.action == "get-prefill-data") {
        const response = {
            current_last: document.querySelector('#current-last').textContent
        };
        console.log('sending response for prefilling extension', response);
        sendResponse(response); 
    } else 
    if (request.action == "trigger-orders") {
        const buy_price = request.buy_price;
        if (!buy_price) {
            alert('Not buy price');
            sendResponse({});  return;
        }
        const dropdownOrder = document.querySelector('.nice-select.order-type');
        const MARKETBUY = document.querySelector('[data-value="MARKET_BUY"]');
        const coinBuy = document.querySelector('#volume-unit-options-container .dropdown-toggle');
        const coinBuyUSDT = document.querySelector('.volume-options [data-value="USDT"]');
        const quantityInput = document.querySelector('#trade-volume');
        const priceInput = document.querySelector('#trade-price');
        const submitBtn = document.querySelector('#btn-order-submit');
        // ORDER BUY MARKET with the specified price
        // 1 - select BUY market
        dropdownOrder.click();
        MARKETBUY.click();
        coinBuy.click();
        coinBuyUSDT.click();
        quantityInput.value = '500';
        priceInput.value = buy_price;        
        // PLACE ORDER
        submitBtn.click();

    }
    else
      sendResponse({}); // Send nothing..
});



// HELPERS 
    // BALANCE

    function getSaldo(){
        const allNodes = Array.from(document.querySelectorAll('.balance-text')).filter( n => n.textContent.includes('USDT'));
        var total = allNodes.reduce( (acc, n) => acc + parseFloat(n.textContent.replace(' USDT','')), 0)
        console.log('TOTAL:',total);
        if (!total) {
            return "Error'";
        }
        total = parseInt(total*100)/100;
        return total;
    }


    // select text for copy-paste
    function selectElementContents(el) {
        var body = document.body, range, sel;
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            sel = window.getSelection();
            sel.removeAllRanges();
            try {
                range.selectNodeContents(el);
                sel.addRange(range);
            } catch (e) {
                range.selectNode(el);
                sel.addRange(range);
            }
        } else if (body.createTextRange) {
            range = body.createTextRange();
            range.moveToElementText(el);
            range.select();
        }
    }
    