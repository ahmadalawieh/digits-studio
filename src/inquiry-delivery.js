export function initializeInquiryDelivery(){
  const form=document.querySelector('#inquiry-form'),button=document.querySelector('#inquiry-send-direct');
  if(!form||!button)return;
  const status=document.querySelector('#inquiry-delivery-status'),ar=document.documentElement.lang==='ar';
  const initial=button.textContent,startedAt=Date.now();let requestId=null,reviewed=null,sending=false;
  fetch('/api/inquiry',{headers:{Accept:'application/json'}}).then(response=>response.ok?response.json():null).then(config=>{if(config?.available)button.hidden=false;}).catch(()=>{});
  // Any edited field requires a fresh review before the direct-send action.
  const invalidate=()=>{requestId=null;reviewed=null;button.disabled=false;button.textContent=initial;status.textContent='';document.querySelector('#inquiry-result').hidden=true;};
  form.addEventListener('input',invalidate);
  form.addEventListener('change',invalidate);
  form.addEventListener('submit',()=>{
    if(!form.checkValidity())return;
    const fields=new FormData(form);
    reviewed={name:fields.get('name'),email:fields.get('email'),business:fields.get('business'),message:fields.get('message'),services:fields.getAll('service'),budget:fields.get('budget')||'',timing:fields.get('timing')||'',website_url:fields.get('website_url')||'',language:ar?'ar':'en',startedAt};
    requestId||=crypto.randomUUID();button.disabled=false;status.textContent='';
  });
  button.addEventListener('click',async()=>{
    if(sending)return;
    if(!reviewed||!requestId){status.textContent=ar?'راجع طلبك مجدداً قبل الإرسال.':'Prepare your updated brief before sending.';return;}
    sending=true;button.disabled=true;button.textContent=ar?'جارٍ الإرسال…':'Sending…';status.textContent='';
    try{
      const response=await fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...reviewed,requestId})});
      const result=await response.json();
      if(!response.ok||!result.sent)throw Error('delivery_failed');
      button.textContent=ar?'تم الإرسال':'Sent';
      status.textContent=ar?'وصل طلبك إلى الاستوديو. شكراً لمشاركة مشروعك.':'Your brief has been sent to the studio. Thank you for sharing your project.';
      window.dispatchEvent(new CustomEvent('digits:inquiry-sent'));
    }catch{button.disabled=false;button.textContent=initial;status.textContent=ar?'تعذّر إرسال البريد. طلبك محفوظ في هذه الصفحة؛ يمكنك استخدام واتساب أو البريد أدناه.':'Email could not be sent. Your brief is still here; you can use WhatsApp or your email app below.';}
    finally{sending=false;}
  });
}
