document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wizardForm');
  const steps = Array.from(document.querySelectorAll('.step'));
  const progressBar = document.getElementById('progressBar');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');

  let current = 0;

  function updateUI() {
    steps.forEach((s, i) => s.classList.toggle('active', i === current));
    const pct = Math.round(((current) / (steps.length - 1)) * 100);
    progressBar.style.width = pct + '%';
    prevBtn.disabled = current === 0;
    nextBtn.style.display = (current === steps.length - 1) ? 'none' : 'inline-block';
    submitBtn.style.display = (current === steps.length - 1) ? 'inline-block' : 'none';
  }

  function validateStep(index) {
    const step = steps[index];
    // Use constraint validation on inputs inside the step
    const inputs = Array.from(step.querySelectorAll('input,select,textarea')).filter(i => !i.disabled);
    for (const el of inputs) {
      // Skip optional file inputs during step validation; they are validated on submit
      if (el.type === 'file') continue;
      if (!el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    // Extra conditional checks
    // If gradeApplied is visible and required, ensure it's chosen
    return true;
  }

  // Show conditional role blocks when applicant type changes
  function updateConditionalBlocks() {
    const val = form.elements['applicantType'].value;
    const teacherBlock = document.getElementById('teacherBlock');
    const studentBlock = document.getElementById('studentBlock');
    teacherBlock.classList.toggle('hidden', !(val === 'teacher' || val === 'headteacher'));
    studentBlock.classList.toggle('hidden', !(val === 'student'));
    // Make gradeApplied required only for students
    const grade = document.getElementById('gradeApplied');
    if (grade) grade.required = (val === 'student');
  }

  // File checks
  function validateFilesOnSubmit() {
    const cv = document.getElementById('cv');
    const photo = document.getElementById('photo');
    if (cv && cv.files.length) {
      const f = cv.files[0];
      if (f.size > 2 * 1024 * 1024) return 'CV file exceeds 2MB limit.';
      if (f.type !== 'application/pdf') return 'CV must be a PDF.';
    }
    if (photo && photo.files.length) {
      const p = photo.files[0];
      if (p.size > 1 * 1024 * 1024) return 'Photo exceeds 1MB limit.';
      if (!['image/jpeg','image/png'].includes(p.type)) return 'Photo must be JPEG or PNG.';
    }
    return null;
  }

  // Basic phone validation
  function validatePhone(value) {
    return /^[0-9+()\- \s]{6,20}$/.test(value);
  }

  // Navigation
  nextBtn.addEventListener('click', () => {
    // Validate current step before moving forward
    if (!validateStep(current)) return;
    if (current === 0) updateConditionalBlocks();
    current = Math.min(current + 1, steps.length - 1);
    updateUI();
  });

  prevBtn.addEventListener('click', () => {
    current = Math.max(current - 1, 0);
    updateUI();
  });

  // Update conditional blocks when applicant type changes
  const applicantRadios = form.elements['applicantType'];
  if (applicantRadios) {
    Array.from(applicantRadios).forEach(r => r.addEventListener('change', updateConditionalBlocks));
  }

  // Reset handler
  form.addEventListener('reset', () => {
    setTimeout(() => {
      current = 0;
      updateConditionalBlocks();
      updateUI();
      formMessage.textContent = '';
    }, 50);
  });

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.textContent = '';

    // Run final validations
    // Check requireds across all steps
    if (!form.checkValidity()) {
      // Find the first invalid field and jump to its step
      const firstInvalid = form.querySelector(':invalid');
      const stepIndex = steps.findIndex(s => s.contains(firstInvalid));
      if (stepIndex >= 0) {
        current = stepIndex;
        updateUI();
        firstInvalid.reportValidity();
      }
      return;
    }
    // Phone check
    if (!validatePhone(form.elements['phone'].value)) {
      formMessage.textContent = 'Please enter a valid phone number.';
      // Jump to contact step (step 3 index 2)
      current = 2;
      updateUI();
      return;
    }
    // File checks
    const fileErr = validateFilesOnSubmit();
    if (fileErr) {
      formMessage.textContent = fileErr;
      return;
    }

    // Prepare FormData
    const data = new FormData(form);

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const res = await fetch(form.action || '/api/apply', {
        method: 'POST',
        body: data
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Server error');
      }
      const json = await res.json();
      formMessage.textContent = json.message || 'Application submitted successfully.';
      form.reset();
      updateConditionalBlocks();
      current = 0;
      updateUI();
    } catch (err) {
      console.error(err);
      formMessage.textContent = 'Submission failed. Please try again later.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });

  // Initialize
  updateConditionalBlocks();
  updateUI();
});
