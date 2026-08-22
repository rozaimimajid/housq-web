/* Hous-Q Health Facility Display v1.1 */
(()=>{
let busy=false;
function findHealthCard(){return [...document.querySelectorAll('#communityCards .community-card')].find(card=>{const t=card.querySelector('.community-type')?.textContent.trim()||'';return t==='Kesihatan'||t==='Kemudahan Kesihatan'})}
function enhance(){if(busy)return;const card=findHealthCard();if(!card)return;const result=card.querySelector('.community-result'),rows=card.querySelectorAll('.facility-row strong'),note=card.querySelector('.facility-note');if(!result||rows.length<3)return;busy=true;
 const original=result.textContent.trim();let category='';
 if(/Jenis 1\s*,\s*2\s*&\s*3/i.test(original))category='Jenis 1 / 2 / 3';
 else if(/Jenis 4\s*&\s*5/i.test(original))category='Jenis 4 / 5';
 else if(/Jenis 6\s*&\s*7/i.test(original))category='Jenis 6 / 7';
 if(category){result.textContent='Klinik Kesihatan';rows[0].textContent='1 unit';
   let stats=card.querySelector('.facility-stats');let existing=card.querySelector('.hq-health-type-row');
   if(!existing&&stats){existing=document.createElement('div');existing.className='facility-row hq-health-type-row';existing.innerHTML='<span>Jenis sebenar</span><strong></strong>';stats.insertBefore(existing,stats.children[1]||null)}
   if(existing){const strong=existing.querySelector('strong');if(strong)strong.textContent=`${category} — Rujuk KKM`}
   if(note)note.textContent=`Kategori ${category.replaceAll(' / ',' , ')} ialah pilihan kategori klinik mengikut tadahan penduduk dan pengesahan KKM; bukan kemudahan berasingan. Saiz tapak perlu pengesahan KKM.`;
 } else {const old=card.querySelector('.hq-health-type-row');if(old)old.remove()}
 const type=card.querySelector('.community-type');if(type&&type.textContent.trim()==='Kesihatan')type.textContent='Kemudahan Kesihatan';busy=false;
}
function renameWaterReserve(){document.querySelectorAll('#utilities .utility-title').forEach(el=>{if(el.textContent.trim()==='Rezab Air')el.textContent='Rizab Tangki Air'})}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(()=>{enhance();renameWaterReserve()}))}
function init(){renameWaterReserve();schedule();const target=document.getElementById('communityCards');if(target)new MutationObserver(m=>{if(busy)return;if(m.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&n.classList?.contains('community-card'))))schedule()}).observe(target,{childList:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();