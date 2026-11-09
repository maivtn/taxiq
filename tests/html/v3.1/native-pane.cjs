/* Exercise copied document code in its DOM region, without requiring an iframe. */
function nativePane(page,selector='#communityPane'){
  const host=page.locator(selector);
  function invoke(element,{source,argument}){
    const api=element.communityModule;
    if(!api)throw Error('Native pane is not ready: '+element.id);
    return new Function('window','document','location','parent','argument','with(window){return ('+source+')(argument)}')(api.window,api.document,api.window.location,api.window.parent,argument);
  }
  return {
    locator:selector=>host.locator(selector==='body'?'.native-body':selector),
    getByRole:(...args)=>host.getByRole(...args),getByText:(...args)=>host.getByText(...args),
    evaluate:(fn,argument)=>host.evaluate(invoke,{source:String(fn),argument}),
    async waitForFunction(fn,argument,options={}){
      const deadline=Date.now()+(options.timeout||12000);
      while(Date.now()<deadline){if(await host.evaluate(invoke,{source:String(fn),argument}))return;await page.waitForTimeout(50);}
      throw Error('Native pane condition timed out: '+String(fn));
    },
    waitForTimeout:delay=>page.waitForTimeout(delay)
  };
}
module.exports={nativePane};
