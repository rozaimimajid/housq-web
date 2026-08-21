/* Hous-Q Education Facility Engine v1.1 */
(()=>{
const $=id=>document.getElementById(id);
const num=v=>Number(String(v??'').replace(/,/g,''))||0;
const fmt=n=>Number(n||0).toLocaleString('en-US');
let busy=false;
function findEducationCard(){return [...document.querySelectorAll('#communityCards .community-card')].find(card=>{const t=card.querySelector('.community-type')?.textContent.trim()||'';return t==='Pendidikan'||t==='Kemudahan Pendidikan'})}
function parseSchoolItems(name){if(!name||/^Tidak perlu disediakan$/i.test(name))return[];return name.split(/\s*[•|]\s*/).map(x=>x.trim()).filter(Boolean)}
function splitFacility(text){const m=text.match(/^(.+?):\s*([\d,]+)\s*unit$/i);return m?{name:m[1].trim(),count:Number(m[2].replace(/,/g,''))}:{name:text.trim(),count:null}}
function enhance(){if(busy)return;const card=findEducationCard();if(!card)return;busy=true;
 const units=num($('totalUnits')?.textContent),tadika=units>=200?Math.floor(units/200):0;
 const result=card.querySelector('.community-result'),rows=card.querySelectorAll('.facility-row strong'),note=card.querySelector('.facility-note'),src=card.querySelector('.community-source');
 if(!result||rows.length<3){busy=false;return}
 let schoolName=card.dataset.efeSchoolName,schoolCount=Number(card.dataset.efeSchoolCount||0),schoolArea=card.dataset.efeSchoolArea,schoolTotal=card.dataset.efeSchoolTotal;
 if(!schoolName){schoolName=result.textContent.trim();schoolCount=num(rows[0].textContent);schoolArea=rows[1].textContent.trim();schoolTotal=rows[2].textContent.trim();card.dataset.efeSchoolName=schoolName;card.dataset.efeSchoolCount=String(schoolCount);card.dataset.efeSchoolArea=schoolArea;card.dataset.efeSchoolTotal=schoolTotal}
 const hasSchool=schoolName&&!/^Tidak perlu disediakan$/i.test(schoolName);
 const schoolItems=hasSchool?parseSchoolItems(schoolName).map(splitFacility):[];
 const names=[];const counts=[];
 if(tadika>0){names.push('Prasekolah / Tadika');counts.push({name:'Prasekolah / Tadika',count:tadika})}
 schoolItems.forEach(x=>{names.push(x.name);if(x.count!==null)counts.push({name:x.name,count:x.count})});
 result.innerHTML=names.length?names.map(n=>`<span style="display:block;text-align:left;line-height:1.35;color:#0d3157;font-weight:800;">${n}</span>`).join(''):'Tidak perlu disediakan';
 result.style.cssText+='text-align:left;line-height:1.35;';
 rows[0].innerHTML=counts.length?counts.map((x,i)=>`<span style="display:flex;justify-content:space-between;gap:8px;text-align:left;line-height:1.5;color:${i===0?'#0d3157':'#172234'};font-weight:800;"><span>${x.name}</span><span style="white-space:nowrap;">${fmt(x.count)} unit</span></span>`).join(''):'0';
 rows[0].style.cssText='display:block;width:100%;color:#172234;font-weight:800;';
 const bilanganRow=rows[0].closest('.facility-row');if(bilanganRow){bilanganRow.style.alignItems='flex-start';bilanganRow.style.color='#172234'}
 rows[1].textContent=tadika>0?`Tadika: Rujuk GP027${hasSchool?' | '+schoolArea:''}`:(hasSchool?schoolArea:'—');
 rows[2].textContent=tadika>0?`Tadika: Rujuk GP027${hasSchool?' | '+schoolTotal:''}`:(hasSchool?schoolTotal:'—');
 if(note)note.textContent=tadika>0?'Education Facility Engine v1.1: Tadika dicetuskan mulai 200 unit kediaman, pada kadar 1 tadika bagi setiap blok lengkap 200 unit. Prasekolah KPM boleh diintegrasikan dalam Sekolah Rendah; tadika/prasekolah berasingan tertakluk GP027 dan pengesahan PBT.':'Education Facility Engine v1.1: Tadika tidak dicetuskan bagi projek di bawah 200 unit kediaman. Keperluan sekolah lain kekal mengikut tadahan penduduk dan rujukan GP004-A 2022.';
 if(src)src.textContent='GP027 — GPP Perancangan dan Penubuhan Tadika dan TASKA 2017, Jadual 2 • GP004-A 2022';
 const type=card.querySelector('.community-type');if(type&&type.textContent.trim()==='Pendidikan')type.textContent='Kemudahan Pendidikan';
 busy=false;
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(enhance))}
function init(){schedule();const target=$('communityCards');if(target)new MutationObserver(m=>{if(busy)return;const replaced=m.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&n.classList?.contains('community-card')));if(replaced)schedule()}).observe(target,{childList:true});['totalUnits','housingTable'].forEach(id=>{const e=$(id);if(e)new MutationObserver(schedule).observe(e,{childList:true,subtree:true,characterData:true})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();