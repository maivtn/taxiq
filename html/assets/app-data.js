(function(){
  const script = document.currentScript;
  const src = script && script.src
    ? script.src.replace(/app-data\.js(\?.*)?$/, "app-data.json$1")
    : "app-data.json";

  window.TaxIQAppData = null;
  window.TaxIQDataReady = fetch(src, { cache: "no-store" })
    .then(response => {
      if(!response.ok) throw new Error("Unable to load app data: " + response.status);
      return response.json();
    })
    .then(data => {
      window.TaxIQAppData = data;
      return data;
    })
    .catch(error => {
      window.TaxIQDataLoadError = error;
      console.error(error);
      return null;
    });
})();
