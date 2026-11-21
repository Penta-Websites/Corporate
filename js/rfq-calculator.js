/* ==========================================================================
   ApexForge Corporate Manufacturing — Instant Cost & RFQ Estimator
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initRfqCalculator();
  initCadUploader();
});

const PRICING_DB = {
  materials: {
    'al-6061': { name: 'Aluminum 6061-T6', factor: 1.0, machinability: 'High', leadDays: 0 },
    'al-7075': { name: 'Aerospace Al 7075-T6', factor: 1.35, machinability: 'Medium-High', leadDays: 1 },
    'ss-304': { name: 'Stainless Steel 304', factor: 1.45, machinability: 'Medium', leadDays: 1 },
    'ss-316l': { name: 'Marine Stainless 316L', factor: 1.75, machinability: 'Tough', leadDays: 2 },
    'ti-gr5': { name: 'Titanium Grade 5 (Ti-6Al-4V)', factor: 3.40, machinability: 'Demanding', leadDays: 3 },
    'inconel-718': { name: 'Inconel 718 Superalloy', factor: 4.80, machinability: 'Extreme', leadDays: 4 },
    'brass-c360': { name: 'High-Speed Brass C360', factor: 1.25, machinability: 'Very High', leadDays: 0 },
    'pom-delrin': { name: 'Delrin / POM Polymer', factor: 0.90, machinability: 'Rapid', leadDays: 0 }
  },
  processes: {
    'cnc-5axis': { name: '5-Axis Simultaneous Milling', baseCost: 145, cycleMultiplier: 1.0 },
    'cnc-3axis': { name: '3-Axis High-Speed CNC', baseCost: 95, cycleMultiplier: 0.75 },
    'cnc-swiss': { name: 'Precision CNC Swiss Turning', baseCost: 85, cycleMultiplier: 0.65 },
    'laser-sheet': { name: 'Fiber Laser & Press Brake', baseCost: 65, cycleMultiplier: 0.45 },
    'dmls-additive': { name: 'DMLS Metal 3D Printing', baseCost: 260, cycleMultiplier: 1.6 }
  },
  tolerances: {
    'standard': { name: 'Standard (±0.1 mm / ±0.004")', factor: 1.0 },
    'precision': { name: 'Precision (±0.025 mm / ±0.001")', factor: 1.28 },
    'aerospace': { name: 'Ultra-Aerospace (±0.005 mm / ±0.0002")', factor: 1.75 }
  },
  finishes: {
    'as-machined': { name: 'As-Machined (Ra 3.2µm)', costPerUnit: 0 },
    'bead-blast': { name: 'Bead Blast Fine (Ra 1.6µm)', costPerUnit: 8.5 },
    'anodize-type2': { name: 'Color Anodizing Type II', costPerUnit: 14.0 },
    'anodize-type3': { name: 'Hardcoat Anodizing Type III (Mil-A-8625)', costPerUnit: 22.0 },
    'electropolish': { name: 'Electropolish Mirror Finish', costPerUnit: 26.0 },
    'black-oxide': { name: 'Chemical Black Oxide', costPerUnit: 9.0 }
  },
  turnarounds: {
    'standard': { name: 'Standard Production (10-12 Days)', factor: 1.0, days: 10 },
    'expedited': { name: 'Expedited Priority (5-7 Days)', factor: 1.35, days: 6 },
    'rush': { name: 'Critical Emergency Line (48-72h)', factor: 1.85, days: 2 }
  }
};

function initRfqCalculator() {
  const calcWidget = document.querySelector('.rfq-calculator-widget');
  if (!calcWidget) return;

  const materialSelect = calcWidget.querySelector('#calcMaterial');
  const processSelect = calcWidget.querySelector('#calcProcess');
  const toleranceSelect = calcWidget.querySelector('#calcTolerance');
  const finishSelect = calcWidget.querySelector('#calcFinish');
  const qtyRange = calcWidget.querySelector('#calcQtyRange');
  const qtyInput = calcWidget.querySelector('#calcQtyInput');
  const speedSelect = calcWidget.querySelector('#calcSpeed');

  // Outputs
  const outUnitPrice = calcWidget.querySelector('#calcUnitPrice');
  const outTotalPrice = calcWidget.querySelector('#calcTotalPrice');
  const outLeadDays = calcWidget.querySelector('#calcLeadDays');
  const outCycleTime = calcWidget.querySelector('#calcCycleTime');
  const outQtyDisplay = calcWidget.querySelector('#calcQtyDisplay');
  const outMaterialDisplay = calcWidget.querySelector('#calcSelectedMaterial');

  const updateCalculations = () => {
    const matKey = materialSelect ? materialSelect.value : 'al-6061';
    const procKey = processSelect ? processSelect.value : 'cnc-5axis';
    const tolKey = toleranceSelect ? toleranceSelect.value : 'precision';
    const finKey = finishSelect ? finishSelect.value : 'as-machined';
    const spdKey = speedSelect ? speedSelect.value : 'standard';
    const qty = parseInt(qtyInput ? qtyInput.value : '50', 10) || 1;

    const mat = PRICING_DB.materials[matKey] || PRICING_DB.materials['al-6061'];
    const proc = PRICING_DB.processes[procKey] || PRICING_DB.processes['cnc-5axis'];
    const tol = PRICING_DB.tolerances[tolKey] || PRICING_DB.tolerances['precision'];
    const fin = PRICING_DB.finishes[finKey] || PRICING_DB.finishes['as-machined'];
    const spd = PRICING_DB.turnarounds[spdKey] || PRICING_DB.turnarounds['standard'];

    // Setup cost amortized over volume
    const fixedSetupCost = 180 + (proc.baseCost * 0.7);
    const unitSetup = fixedSetupCost / qty;

    // Volume discount factor curve: 1 = 1.0, 50 = 0.62, 500 = 0.45, 2000 = 0.38
    const volumeFactor = Math.max(0.36, 1.0 - (Math.log10(Math.max(qty, 1)) * 0.18));

    // Base machining unit rate
    const rawUnitMachining = (proc.baseCost * mat.factor * tol.factor * volumeFactor);
    const unitFinish = fin.costPerUnit;

    const baseUnitPrice = (unitSetup + rawUnitMachining + unitFinish) * spd.factor;
    const roundedUnitPrice = Math.max(12, Math.round(baseUnitPrice * 100) / 100);
    const totalBatchPrice = Math.round(roundedUnitPrice * qty);

    const estimatedLeadDays = Math.max(2, spd.days + mat.leadDays);
    const estimatedCycleMins = Math.round(18 * proc.cycleMultiplier * mat.factor);

    if (outUnitPrice) outUnitPrice.textContent = `$${roundedUnitPrice.toFixed(2)}`;
    if (outTotalPrice) outTotalPrice.textContent = `$${totalBatchPrice.toLocaleString()}`;
    if (outLeadDays) outLeadDays.textContent = `${estimatedLeadDays} Business Days`;
    if (outCycleTime) outCycleTime.textContent = `~${estimatedCycleMins} mins/part`;
    if (outQtyDisplay) outQtyDisplay.textContent = `${qty} Units`;
    if (outMaterialDisplay) outMaterialDisplay.textContent = mat.name;
  };

  // Sync inputs
  if (qtyRange && qtyInput) {
    qtyRange.addEventListener('input', (e) => {
      qtyInput.value = e.target.value;
      updateCalculations();
    });

    qtyInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 5000) val = 5000;
      qtyRange.value = val;
      updateCalculations();
    });
  }

  [materialSelect, processSelect, toleranceSelect, finishSelect, speedSelect].forEach(select => {
    if (select) select.addEventListener('change', updateCalculations);
  });

  // Initial calculate
  updateCalculations();

  // Export quote / Lock Rate button
  const lockRateBtn = calcWidget.querySelector('#btnLockRate');
  if (lockRateBtn) {
    lockRateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const quoteDetails = {
        material: materialSelect ? materialSelect.options[materialSelect.selectedIndex].text : '',
        process: processSelect ? processSelect.options[processSelect.selectedIndex].text : '',
        quantity: qtyInput ? qtyInput.value : '50',
        unitPrice: outUnitPrice ? outUnitPrice.textContent : '',
        totalPrice: outTotalPrice ? outTotalPrice.textContent : '',
        leadDays: outLeadDays ? outLeadDays.textContent : ''
      };

      try {
        sessionStorage.setItem('apexforge_locked_quote', JSON.stringify(quoteDetails));
      } catch (e) {}

      window.location.href = 'rfq-quote.html?locked=true';
    });
  }
}

/* --------------------------------------------------------------------------
   CAD File Drag & Drop Simulation Engine
   -------------------------------------------------------------------------- */
function initCadUploader() {
  const dropzone = document.getElementById('cadDropzone');
  const fileInput = document.getElementById('cadFileInput');
  const fileListContainer = document.getElementById('cadFileList');

  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-active');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    if (!files.length || !fileListContainer) return;

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop().toUpperCase();
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

      const fileItem = document.createElement('div');
      fileItem.className = 'cad-file-item';
      fileItem.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.85rem 1.25rem;
        margin-top: 0.75rem;
        animation: fadeIn 0.3s ease;
      `;

      fileItem.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.85rem;">
          <div style="background:#0f1e36; color:#ffffff; font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:700; padding:0.3rem 0.5rem; border-radius:4px;">
            ${ext}
          </div>
          <div>
            <div style="font-weight:600; font-size:0.925rem; color:#0f1e36;">${file.name}</div>
            <div style="font-size:0.78rem; color:#64748b;">${sizeMb} MB • Ready for DFM Analysis</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span class="badge badge-success">Parsed OK</span>
          <button type="button" class="btn-remove-file" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.1rem; padding:0.2rem;">&times;</button>
        </div>
      `;

      fileItem.querySelector('.btn-remove-file').addEventListener('click', () => {
        fileItem.remove();
      });

      fileListContainer.appendChild(fileItem);
    });

    if (window.showToast) {
      window.showToast(`${files.length} CAD model(s) verified for automatic toolpath calculation!`, 'success');
    }
  }
}
