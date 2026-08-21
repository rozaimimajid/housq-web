/* Hous-Q Education Facility Engine v1.1 */
(()=>{
const $=id=>document.getElementById(id);
const num=v=>Number(String(v??'').replace(/,/g,''))||0;
const fmt=n=>Number(n||0).toLocaleString('en-US');
let busy=false;
function findEducationCard(){return [...document.querySelectorAll('#communityCards .community-card')].find(card=>{const t=card.querySelector('.community-type')?.textContent.trim()||'';return t==='Pendidikan'||t==='Kemudahan Pendidikan'})}
function enhance(){if(busy)return;const card=findEducationCard();if(!card)return;busy=true;
 const units=num($('totalUnits')?.textContent),tadika=units>0?Math.ceil(units/200):0;
 const result=card.querySelector('.community-result'),rows=card.querySelectorAll('.facility-row strong'),note=card.querySelector('.facility-note'),src=card.querySelector('.community-source');
 if(!result||rows.length<3){busy=false;return}
 let schoolName=card.dataset.efeSchoolName,schoolCount=Number(card.dataset.efeSchoolCount||0),schoolArea=card.dataset.efeSchoolArea,schoolTotal=card.dataset.efeSchoolTotal;
 if(!schoolName){schoolName=result.textContent.trim();schoolCount=num(rows[0].textContent);schoolArea=rows[1].textContent.trim();schoolTotal=rows[2].textContent.trim();card.dataset.efeSchoolName=schoolName;card.dataset.efeSchoolCount=String(schoolCount);card.dataset.efeSchoolArea=schoolArea;card.dataset.efeSchoolTotal=schoolTotal}
 const hasSchool=schoolName&&!/^Tidak perlu disediakan$/i.test(schoolName);
 result.textContent=`Prasekolah / Tadika: ${fmt(tadika)} unit${hasSchool?' • '+schoolName:''}`;
 rows[0].textContent=`${fmt(tadika+schoolCount)} unit`;
 rows[1].textContent=`Tadika: Rujuk GP027${hasSchool?' | '+schoolArea:''}`;
 rows[2].textContent=`Tadika: Rujuk GP027${hasSchool?' | '+schoolTotal:''}`;
 if(note)note.textContent='Education Facility Engine v1.1: Tadika dianggarkan 1 bagi setiap 200 unit kediaman. Prasekolah KPM boleh diintegrasikan dalam Sekolah Rendah; tadika/prasekolah berasingan tertakluk GP027 dan pengesahan PBT.';
 if(src)src.textContent='GP027 — GPP Perancangan dan Penubuhan Tadika dan TASKA 2017, Jadual 2 • GP004-A 2022';
 const type=card.querySelector('.community-type');if(type&&type.textContent.trim()==='Pendidikan')type.textContent='Kemudahan Pendidikan';
 busy=false;
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(enhance))}
function init(){schedule();const target=$('communityCards');if(target)new MutationObserver(m=>{if(busy)return;const replaced=m.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&n.classList?.contains('community-card')));if(replaced)schedule()}).observe(target,{childList:true});['totalUnits','housingTable'].forEach(id=>{const e=$(id);if(e)new MutationObserver(schedule).observe(e,{childList:true,subtree:true,characterData:true})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
