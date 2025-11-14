document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('applicationForm');
  const applicantRadios = form.elements['applicantType'];
  const teacherFields = document.getElementById('teacherFields');
  const studentFields = document.getElementById('studentFields');
  const formMessage = document.getElementById('formMessage');

  function showConditional() {
    const val = form.elements['applicantType'].value;
    teacherFields.classList.toggle('hidden', val !== 'teacher' && val !== 'headteacher');
    studentFields.classList.toggle('hidden', val !== 'student');
  }

  // radio change listener (works for single selection radios)
  [...applicantRadios].forEach(r => r.addEventListener('change', showConditional));

  // file size and type checks
  function validateFiles() {
    const cv = document.getElementById('cv');
    const photo = document.getElementById('photo');
    if (cv.files.length) {
      const f = cv.files[0];
      if (f.size > 2 * 1024 * 1024) return 'CV file exceeds 2MB limit.';
      if (f.type !== 'application/pdf') return 'CV must be a PDF.';
    }
    if (photo.files.length) {
      const p = photo.files[0];
      if (p.size > 1 * 1024 * 1024) return 'Photo exceeds 1MB limit.';
      if (!['image/jpeg','image/png'].includes(p.type)) return 'Photo must be JPEG or PNG.';
    }
    return null;
  }

  // enhanced phone check
  function validatePhone(value) {
    return /^[0-9+()\- \s]{6,20}$/.test(value);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.textContent = '';
    // native validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // extra checks
    if (!validatePhone(form.elements['phone'].value)) {
      formMessage.textContent = 'Please enter a valid phone number.';
      return;
    }
    const fileErr = validateFiles();
    if (fileErr) {
      formMessage.textContent = fileErr;
      return;
    }

    // Prepare form data (supports file upload)
    const data = new FormData(form);

    // Provide feedback
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Adjust the endpoint below as needed
      const res = await fetch(form.action || '/api/apply', {
        method: 'POST',
        body: data
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Server error');
      }
      const result = await res.json();
      formMessage.textContent = result.message || 'Application submitted successfully.';
      form.reset();
      showConditional();
    } catch (err) {
      console.error(err);
      formMessage.textContent = 'Submission failed. Please try again later.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });

  // Initialize conditional view
  showConditional();
});
