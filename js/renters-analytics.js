(() => {
  if(location.hostname!=='www.billlayneinsurance.com')return;
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  window.gtag('js',new Date());window.gtag('config','G-N37THY37CR');
  const ga=document.createElement('script');ga.async=true;ga.src='https://www.googletagmanager.com/gtag/js?id=G-N37THY37CR';document.head.append(ga);
  const clarity=()=>{
    window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments);};
    const script=document.createElement('script');script.async=true;script.src='https://www.clarity.ms/tag/vo5s3jhhub';document.head.append(script);
  };
  const idle=()=>('requestIdleCallback'in window)?requestIdleCallback(clarity,{timeout:4000}):setTimeout(clarity,1500);
  if(document.readyState==='complete')idle();else window.addEventListener('load',idle,{once:true});
})();
