/* ==========================================================================
   ApexForge Corporate Manufacturing — Live Plant Telemetry & Machine Hub
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPlantTelemetry();
});

function initPlantTelemetry() {
  const oeeDisplay = document.getElementById('liveOeeDisplay');
  const spindleRpmDisplay = document.getElementById('liveSpindleRpm');
  const activeJobsDisplay = document.getElementById('liveActiveJobs');
  const machineCenters = document.querySelectorAll('.machine-status-card');

  if (!oeeDisplay && !machineCenters.length) return;

  // Realistic minor stochastic fluctuations simulating live Industry 4.0 telemetry
  setInterval(() => {
    // OEE between 99.2% and 99.6%
    if (oeeDisplay) {
      const randOee = (99.2 + Math.random() * 0.4).toFixed(1);
      oeeDisplay.textContent = `${randOee}%`;
    }

    // Spindle RPM between 17,900 and 18,300
    if (spindleRpmDisplay) {
      const randRpm = Math.floor(17900 + Math.random() * 450);
      spindleRpmDisplay.textContent = `${randRpm.toLocaleString()} RPM`;
    }

    // Jobs completed today
    if (activeJobsDisplay) {
      const current = parseInt(activeJobsDisplay.textContent || '412', 10);
      if (Math.random() > 0.7) {
        activeJobsDisplay.textContent = (current + 1).toString();
      }
    }
  }, 4000);

  // Machine card interactive tooltips / status toggle
  machineCenters.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const pulseDot = card.querySelector('.status-dot');
      if (pulseDot) {
        pulseDot.style.transform = 'scale(1.4)';
      }
    });

    card.addEventListener('mouseleave', () => {
      const pulseDot = card.querySelector('.status-dot');
      if (pulseDot) {
        pulseDot.style.transform = 'scale(1)';
      }
    });
  });
}
