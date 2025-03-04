async function fetchExchangeRate(baseCurrency) {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    const data = await response.json();

    return data.rates;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    return null;
  }
}

window.convertPrices = async function () {
  chrome.storage.sync.get(["selectedCurrency"], async (result) => {
    const selectedCurrency = result.selectedCurrency || "INR"; // Default to INR
    const rates = await fetchExchangeRate("USD");
    if (!rates || !rates[selectedCurrency]) {
      console.error("Exchange rate not found for", selectedCurrency);
      return;
    }

    const rate = rates[selectedCurrency];
    console.log(`Using exchange rate: 1 USD = ${rate} ${selectedCurrency}`);

    function replacePrices(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const oldText = node.textContent;
        const regex = /\$\s?(\d+(\.\d+)?)/g;

        if (regex.test(oldText)) {
          const newText = oldText.replace(regex, (match, amount) => {
            const converted = (parseFloat(amount) * rate).toFixed(2);
            return `${selectedCurrency} ${converted}`;
          });

          if (oldText !== newText) {
            const span = document.createElement("span");
            span.innerText = newText;
            span.classList.add("flash-effect"); // Apply flash effect
            node.parentNode.replaceChild(span, node);
          }
        }
      }
    }

    function scanAndReplace(element) {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      let node;
      while ((node = walker.nextNode())) {
        replacePrices(node);
      }
    }

    scanAndReplace(document.body);

    // Start observing DOM before running convertPrices()
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            replacePrices(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            scanAndReplace(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Run immediately and at intervals (handles dynamic price updates)
    scanAndReplace(document.body);

    let intervalId = setInterval(() => scanAndReplace(document.body), 50);

    // Stop the interval after 5 seconds
    setTimeout(() => {
      clearInterval(intervalId);
      console.log("Interval stopped after 5 seconds.");
    }, 59000);

    console.log("Follow on github: https://github.com/04amanrajj");
  });
};

// Ensure script runs after page loads
window.addEventListener("load", () => {
  convertPrices();
});
