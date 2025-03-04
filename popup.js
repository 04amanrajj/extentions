document.getElementById("save").addEventListener("click", () => {
    const currency = document.getElementById("currency").value;
    chrome.storage.sync.set({ selectedCurrency: currency }, () => {
        alert("Currency saved!");
    });
});
