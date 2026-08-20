/* Hous-Q Parking Calculation Engine v2.0
   Residential rates: GP011-A Jadual 19 / ms.72 (as locked in Hous-Q Master Database).
   Shop house / shop office rates: GP011-A Perdagangan / ms.73.
*/
(()=>{
  const $=id=>document.getElementById(id);
  const fmt=(n,d=0)=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
  const RATES={
    'Rumah Sesebuah':{tlk:2,visitor:0,tlm:0},
    'Rumah Berkembar':{tlk:2,visitor:0,tlm:0},
    'Rumah Teres':{tlk:2,visitor:0,tlm:0},
    'Rumah Bandar':{tlk:1,visitor:0,tlm:0},
    'Pangsapuri Kos Rendah':{tlk:1,visitor:.10,tlm:.50},
    'Pangsapuri Kos Sederhana':{tlk:1,visitor:.10,tlm:.20},
    'Kondominium / Pangsapuri Mewah':{tlk:2,visitor:.10,tlm:.10}
  };
  let busy=false;

  function renumberSections(){
    const nav=document.querySelector('.menu');
    if(nav){
      const utilitiesLink=nav.querySelector('a[href="#utilities"]');
      const businessLink=nav.querySelector('a[href="#business"]');
      const communityLink=nav.querySelector('a[href="#community"]');
      const referencesLink=nav.querySelector('a[href="#references"]');
      if(utilitiesLink) utilitiesLink.textContent='ϟ 04 Keperluan Utiliti';
      if(!nav.querySelector('a[href="#parkingBreakdown"]') && businessLink){
        const parkingLink=document.createElement('a');
        parkingLink.href='#parkingBreakdown';
        parkingLink.textContent='▣ 05 Pengiraan Parkir';
        nav.insertBefore(parkingLink,businessLink);
      }
      if(businessLink) businessLink.textContent='▦ 06 Keperluan Perniagaan';
      if(communityLink) communityLink.textContent='♙ 07 Kemudahan Masyarakat';
      if(referencesLink) referencesLink.textContent='▤ 08 Rujukan Piawaian';
    }
    const businessTitle=document.querySelector('#business .section-title');
    const communityTitle=document.querySelector('#community .section-title');
    const referencesTitle=document.querySelector('#references .section-title');
    if(businessTitle) businessTitle.textContent='06 — Keperluan Perniagaan';
    if(communityTitle) communityTitle.textContent='07 — Kemudahan Masyarakat';
    if(referencesTitle) referencesTitle.textContent='08 — Rujukan Piawaian';
  }

  function ensureUI(){
    const version=document.querySelector('.version');
    if(version && !version.textContent.includes('Parking Calculation Engine v2.0')) version.textContent+=' • Parking Calculation Engine v2.0';
    const business=$('business');
    if(business && !$('shopParkingControls')){
      const box=document.createElement('div');
      box.id='shopParkingControls';
      box.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px';
      box.innerHTML=`<div class="field"><label>Bilangan Tingkat Rumah Kedai</label><input id="shopHouseFloors" type="number" min="1" step="1" value="2"></div><div class="field"><label>Luas Lantai / Unit / Tingkat (m²)</label><input id="shopHouseFloorArea" type="number" min="1" step="1" value="130"></div><div class="note" style="grid-column:1/-1;margin:0">Untuk pengiraan parkir rumah kedai, GP011-A menggunakan keluasan ruang lantai. Nilai 130 m²/unit/tingkat ialah <strong>andaian awal Hous-Q yang boleh diubah pengguna</strong>; masukkan keluasan sebenar jika tersedia.</div>`;
      business.appendChild(box);
      $('shopHouseFloors').addEventListener('input',schedule);
      $('shopHouseFloorArea').addEventListener('input',schedule);
    }
    const utilities=$('utilities');
    if(utilities && !$('parkingBreakdown')){
      const wrap=document.createElement('div');
      wrap.id='parkingBreakdown';
      wrap.style.cssText='margin-top:16px;padding-top:14px;border-top:1px solid #dce3ea';
      wrap.innerHTML=`<h3 class="section-title" style="margin:0 0 10px">05 — Pengiraan Parkir</h3><div style="font-size:12px;font-weight:bold;color:#0d3157;margin:0 0 9px">Pecahan Keperluan TLK & TLM</div><div class="table-wrapper" style="background:#fff"><table style="min-width:760px;background:#fff"><thead><tr><th>Komponen</th><th>Unit</th><th>Tingkat</th><th>TLK Asas/Penghuni</th><th>TLK Pelawat</th><th>Jumlah TLK</th><th>TLM</th></tr></thead><tbody id="parkingBreakdownBody" style="background:#fff"></tbody><tfoot style="background:#fff"><tr style="background:#fff"><td><strong>JUMLAH</strong></td><td>—</td><td>—</td><td id="pkBaseTotal">0</td><td id="pkVisitorTotal">0</td><td id="pkTLKTotal"><strong>0</strong></td><td id="pkTLMTotal"><strong>0</strong></td></tr></tfoot></table></div><div class="note" style="margin-top:8px"><strong>Parking Calculation Engine v2.0:</strong> Kediaman menggunakan kadar GP011-A Jadual 19 / ms.72. Rumah Kedai menggunakan GP011-A Perdagangan / ms.73: 1 TLK/46.4 m² ruang lantai, 1 TLM/84 m² ruang lantai dan tambahan 10% TLK untuk pelawat.</div>`;
      utilities.insertAdjacentElement('afterend',wrap);
    }
    renumberSections();
  }
  function parseHousing(){
    return [...document.querySelectorAll('#housingTable tr')].map(tr=>{
      const td=tr.querySelectorAll('td'); if(td.length<8)return null;
      const type=(td[0].querySelector('strong')?.textContent||td[0].textContent).trim();
      const units=Number((td[5].textContent||'0').replace(/,/g,''))||0;
      const f=(td[6].textContent||'—').trim().split(/\s+/)[0];
      return {type,units,floors:/^\d+$/.test(f)?Number(f):null};
    }).filter(Boolean);
  }
  function calculate(){
    if(busy)return; busy=true; ensureUI();
    const body=$('parkingBreakdownBody'); if(!body){busy=false;return;}
    let baseTotal=0,visitorTotal=0,tlmTotal=0; const out=[];
    parseHousing().forEach(x=>{
      const r=RATES[x.type]; if(!r)return;
      const base=Math.ceil(x.units*r.tlk),visitor=Math.ceil(x.units*r.visitor),tlm=Math.ceil(x.units*r.tlm);
      baseTotal+=base; visitorTotal+=visitor; tlmTotal+=tlm;
      out.push(`<tr style="background:#fff"><td style="background:#fff"><strong>${x.type}</strong></td><td style="background:#fff">${fmt(x.units)}</td><td style="background:#fff">${x.floors?fmt(x.floors):'—'}</td><td style="background:#fff">${fmt(base)}</td><td style="background:#fff">${fmt(visitor)}</td><td style="background:#fff"><strong>${fmt(base+visitor)}</strong></td><td style="background:#fff">${fmt(tlm)}</td></tr>`);
    });
    const shopCount=Number(($('shopHouseCount')?.textContent||'0').replace(/,/g,''))||0;
    const shopFloors=Math.max(1,Number($('shopHouseFloors')?.value)||2);
    const floorArea=Math.max(1,Number($('shopHouseFloorArea')?.value)||130);
    const shopGFA=shopCount*shopFloors*floorArea;
    const shopBase=shopCount>0?Math.ceil(shopGFA/46.4):0;
    const shopVisitor=shopCount>0?Math.ceil(shopBase*.10):0;
    const shopTLM=shopCount>0?Math.ceil(shopGFA/84):0;
    baseTotal+=shopBase; visitorTotal+=shopVisitor; tlmTotal+=shopTLM;
    out.push(`<tr style="background:#fff"><td style="background:#fff"><strong>Rumah Kedai</strong><span class="source-text">GFA ${fmt(shopGFA)} m²</span></td><td style="background:#fff">${fmt(shopCount)}</td><td style="background:#fff">${fmt(shopFloors)}</td><td style="background:#fff">${fmt(shopBase)}</td><td style="background:#fff">${fmt(shopVisitor)}</td><td style="background:#fff"><strong>${fmt(shopBase+shopVisitor)}</strong></td><td style="background:#fff">${fmt(shopTLM)}</td></tr>`);
    body.innerHTML=out.join('');
    const grand=baseTotal+visitorTotal;
    $('pkBaseTotal').textContent=fmt(baseTotal); $('pkVisitorTotal').textContent=fmt(visitorTotal);
    $('pkTLKTotal').innerHTML=`<strong>${fmt(grand)}</strong>`; $('pkTLMTotal').innerHTML=`<strong>${fmt(tlmTotal)}</strong>`;
    document.querySelectorAll('#parkingBreakdown tbody td,#parkingBreakdown tfoot td').forEach(td=>td.style.background='#fff');
    if($('parking')) $('parking').textContent=fmt(grand); if($('motorParking')) $('motorParking').textContent=fmt(tlmTotal);
    const pNote=$('parking')?.parentElement?.querySelector('.utility-note'); if(pNote)pNote.textContent='petak kediaman + rumah kedai';
    const mNote=$('motorParking')?.parentElement?.querySelector('.utility-note'); if(mNote)mNote.textContent='petak kediaman + rumah kedai';
    busy=false;
  }
  function schedule(){requestAnimationFrame(calculate)}
  document.addEventListener('DOMContentLoaded',()=>{
    ensureUI(); calculate();
    const h=$('housingTable'),s=$('shopHouseCount');
    if(h)new MutationObserver(schedule).observe(h,{childList:true,subtree:true,characterData:true});
    if(s)new MutationObserver(schedule).observe(s,{childList:true,subtree:true,characterData:true});
    document.addEventListener('input',e=>{if(e.target.matches('.pct-input,.density-input,#siteArea,#household,#shopHouseFloors,#shopHouseFloorArea'))schedule()});
    document.addEventListener('change',e=>{if(e.target.matches('#pbt,[data-t]'))schedule()});
  });
})();