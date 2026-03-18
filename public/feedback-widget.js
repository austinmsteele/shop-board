const SITE_FEEDBACK_CATEGORIES = [
  { value: 'site bug', label: 'Site bug' },
  { value: 'new feature', label: 'New feature' },
  { value: 'other', label: 'Other' }
];

function createSiteFeedbackWidgetMarkup() {
  return `
    <button id="site-feedback-launcher" class="site-feedback-launcher" type="button">Send Feedback</button>
    <dialog id="site-feedback-dialog" class="new-board-dialog site-feedback-dialog">
      <form id="site-feedback-form" method="dialog" class="new-board-form site-feedback-form">
        <h2>Send feedback</h2>
        <label>
          Feedback type
          <select id="site-feedback-category" required>
            ${SITE_FEEDBACK_CATEGORIES.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}
          </select>
        </label>
        <label>
          Message
          <textarea id="site-feedback-message" maxlength="2000" placeholder="Type your feedback here..." required></textarea>
        </label>
        <p id="site-feedback-status" class="site-feedback-status" hidden aria-live="polite"></p>
        <menu>
          <button id="site-feedback-cancel" type="button" class="cancel-btn">Cancel</button>
          <button id="site-feedback-submit" type="submit">Submit</button>
        </menu>
      </form>
    </dialog>
    <dialog id="site-feedback-followup-dialog" class="new-board-dialog site-feedback-dialog">
      <form method="dialog" class="new-board-form site-feedback-form site-feedback-followup-form">
        <h2>Thank You</h2>
        <p class="site-feedback-followup-copy">Would you like to submit more feedback?</p>
        <menu>
          <button id="site-feedback-followup-no" type="button" class="cancel-btn">No</button>
          <button id="site-feedback-followup-yes" type="button">Yes</button>
        </menu>
      </form>
    </dialog>
  `;
}

function initSiteFeedbackWidget() {
  if (!document.body || document.querySelector('#site-feedback-launcher')) return;

  document.body.insertAdjacentHTML('beforeend', createSiteFeedbackWidgetMarkup());

  const launcher = document.querySelector('#site-feedback-launcher');
  const dialog = document.querySelector('#site-feedback-dialog');
  const form = document.querySelector('#site-feedback-form');
  const categoryField = document.querySelector('#site-feedback-category');
  const messageField = document.querySelector('#site-feedback-message');
  const statusField = document.querySelector('#site-feedback-status');
  const cancelBtn = document.querySelector('#site-feedback-cancel');
  const submitBtn = document.querySelector('#site-feedback-submit');
  const followupDialog = document.querySelector('#site-feedback-followup-dialog');
  const followupYesBtn = document.querySelector('#site-feedback-followup-yes');
  const followupNoBtn = document.querySelector('#site-feedback-followup-no');

  if (
    !launcher
    || !dialog
    || !form
    || !categoryField
    || !messageField
    || !statusField
    || !cancelBtn
    || !submitBtn
    || !followupDialog
    || !followupYesBtn
    || !followupNoBtn
  ) {
    return;
  }

  function resetForm() {
    categoryField.value = SITE_FEEDBACK_CATEGORIES[0]?.value || 'site bug';
    messageField.value = '';
    statusField.hidden = true;
    statusField.textContent = '';
    submitBtn.disabled = false;
  }

  function focusMessageField() {
    window.setTimeout(() => {
      messageField.focus();
      messageField.setSelectionRange(messageField.value.length, messageField.value.length);
    }, 0);
  }

  function openFeedbackDialog() {
    resetForm();
    if (!dialog.open) dialog.showModal();
    focusMessageField();
  }

  launcher.addEventListener('click', () => {
    openFeedbackDialog();
  });

  cancelBtn.addEventListener('click', () => {
    dialog.close();
  });

  followupNoBtn.addEventListener('click', () => {
    followupDialog.close();
  });

  followupYesBtn.addEventListener('click', () => {
    followupDialog.close();
    openFeedbackDialog();
  });

  dialog.addEventListener('close', () => {
    resetForm();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const category = String(categoryField.value || '').trim();
    const message = String(messageField.value || '').trim();
    if (!message) {
      statusField.textContent = 'Please enter your feedback message.';
      statusField.hidden = false;
      focusMessageField();
      return;
    }

    submitBtn.disabled = true;
    statusField.hidden = true;
    statusField.textContent = '';

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          message,
          pageUrl: window.location.href,
          pageTitle: document.title
        })
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(String(payload?.error || `Request failed (${response.status})`));
      }

      dialog.close();
      if (!followupDialog.open) followupDialog.showModal();
    } catch (error) {
      statusField.textContent = error instanceof Error ? error.message : 'Could not send feedback right now.';
      statusField.hidden = false;
      submitBtn.disabled = false;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteFeedbackWidget, { once: true });
} else {
  initSiteFeedbackWidget();
}
