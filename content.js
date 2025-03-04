async function fetchExchangeRate() {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await response.json();
    return data.rates["INR"];  // Convert to INR, change as needed
}

async function convertPrices() {
    const rate = await fetchExchangeRate();
    document.body.innerHTML = document.body.innerHTML.replace(/\$\s?(\d+(\.\d+)?)/g, (match, amount) => {
        const converted = (parseFloat(amount) * rate).toFixed(2);
        return `₹ ${converted}`;
    });
}

convertPrices();
