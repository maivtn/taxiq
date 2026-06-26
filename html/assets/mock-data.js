(function(){
  const script = document.currentScript;
  const src = script && script.src
    ? script.src.replace(/mock-data\.js(\?.*)?$/, "mock-data.json$1")
    : "mock-data.json";

  window.TaxIQMockData = null;
  window.TaxIQDataReady = fetch(src, { cache: "no-store" })
    .then(response => {
      if(!response.ok) throw new Error("Unable to load mock data: " + response.status);
      return response.json();
    })
    .then(data => {
      window.TaxIQMockData = data;
      return data;
    })
    .catch(error => {
      window.TaxIQDataLoadError = error;
      console.error(error);
      return null;
    });
})();
