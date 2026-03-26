const HISTORY_LIMIT = 120;
const TEXT_HISTORY_IDLE_MS = 500;
const REMOTE_SYNC_INTERVAL_MS = 4000;
const SESSION_DB_NAME = 'interview-timestamps-editor';
const SESSION_STORE_NAME = 'sessions';
const SESSION_RECORD_KEY = 'current';
const MAX_SPEAKERS = 10;
const FILTER_VALUES = ['red', 'yellow', 'green', 'unmarked', 'comments'];

const state = {
  audioBlob: null,
  audioFileName: '',
  audioFingerprint: '',
  audioNeedsRemoteSync: false,
  audioRemoteUrl: '',
  audioUrl: '',
  transcriptFileName: '',
  transcriptWarning: '',
  bites: [],
  projectName: '',
  projectNameDraft: '',
  shareProjectId: '',
  remoteVersion: 0,
  speakerAssignments: [],
  speakerStatus: '',
  speakerEditorOpen: true,
  activeFilters: [],
  hasUnsavedChanges: false,
  saveStatus: ''
};

const landingPanel = document.querySelector('#landing-panel');
const workspace = document.querySelector('#workspace');
const audioInput = document.querySelector('#audio-input');
const transcriptInput = document.querySelector('#transcript-input');
const audioUploadBtn = document.querySelector('#audio-upload-btn');
const transcriptUploadBtn = document.querySelector('#transcript-upload-btn');
const undoBtn = document.querySelector('#undo-btn');
const redoBtn = document.querySelector('#redo-btn');
const saveBtn = document.querySelector('#save-btn');
const shareBtn = document.querySelector('#share-btn');
const shareMenu = document.querySelector('#share-menu');
const shareLinkBtn = document.querySelector('#share-link-btn');
const downloadPdfBtn = document.querySelector('#download-pdf-btn');
const startOverBtn = document.querySelector('#start-over-btn');
const projectTitleBtn = document.querySelector('#project-title-btn');
const projectTitleInput = document.querySelector('#project-title-input');
const speakerSummaryBtn = document.querySelector('#speaker-summary-btn');
const setupPanel = document.querySelector('#setup-panel');
const speakerEditorPanel = document.querySelector('#speaker-editor-panel');
const speakerFields = document.querySelector('#speaker-fields');
const speakerConfirmBtn = document.querySelector('#speaker-confirm-btn');
const speakerStatus = document.querySelector('#speaker-status');
const filterBtn = document.querySelector('#filter-btn');
const filterMenu = document.querySelector('#filter-menu');
const filterCheckboxes = Array.from(document.querySelectorAll('.filter-checkbox'));
const audioFileName = document.querySelector('#audio-file-name');
const transcriptFileName = document.querySelector('#transcript-file-name');
const audioPlayer = document.querySelector('#audio-player');
const audioPlayBtn = document.querySelector('#audio-play-btn');
const audioPlayIcon = document.querySelector('#audio-play-icon');
const audioMuteBtn = document.querySelector('#audio-mute-btn');
const audioVolumeIcon = document.querySelector('#audio-volume-icon');
const audioTimeLabel = document.querySelector('#audio-time-label');
const audioScrubber = document.querySelector('#audio-scrubber');
const transcriptSummary = document.querySelector('#transcript-summary');
const statusMessage = document.querySelector('#status-message');
const emptyState = document.querySelector('#empty-state');
const bitesList = document.querySelector('#bites-list');
const biteTemplate = document.querySelector('#bite-template');

const undoStack = [];
const redoStack = [];
const textEditTimers = new Map();
const textEditLocks = new Set();

let draggedBiteId = '';
let lastSavedSignature = '';
let isEditingProjectName = false;
let isFilterMenuOpen = false;
let isShareMenuOpen = false;
let activePlaybackBiteId = '';
let activeAudioObjectUrl = '';
let remoteSyncTimerId = 0;
let remoteSyncInFlight = false;

audioUploadBtn.addEventListener('click', () => audioInput.click());
transcriptUploadBtn.addEventListener('click', () => transcriptInput.click());
undoBtn.addEventListener('click', () => undo());
redoBtn.addEventListener('click', () => redo());
saveBtn.addEventListener('click', () => {
  void saveSession();
});
shareBtn.addEventListener('click', () => {
  if (shareBtn.disabled) return;
  isShareMenuOpen = !isShareMenuOpen;
  if (isShareMenuOpen) {
    isFilterMenuOpen = false;
  }
  renderFilterMenu();
  renderShareMenu();
});
shareLinkBtn.addEventListener('click', () => {
  isShareMenuOpen = false;
  renderShareMenu();
  void shareProjectLink();
});
downloadPdfBtn.addEventListener('click', () => {
  isShareMenuOpen = false;
  renderShareMenu();
  void downloadTranscriptPdf();
});

filterBtn.addEventListener('click', () => {
  isFilterMenuOpen = !isFilterMenuOpen;
  if (isFilterMenuOpen) {
    isShareMenuOpen = false;
  }
  renderFilterMenu();
  renderShareMenu();
});

for (const checkbox of filterCheckboxes) {
  checkbox.addEventListener('change', () => {
    state.activeFilters = filterCheckboxes.filter((input) => input.checked).map((input) => input.value);
    updateDirtyState();
    render();
  });
}

audioPlayer.addEventListener('timeupdate', () => {
  syncAudioControls();
  syncPlaybackHighlight();
});

audioPlayer.addEventListener('seeked', () => {
  syncAudioControls();
  syncPlaybackHighlight();
});

audioPlayer.addEventListener('play', () => {
  syncAudioControls();
  syncPlaybackHighlight();
});

audioPlayer.addEventListener('pause', () => {
  syncAudioControls();
  syncPlaybackHighlight();
});

audioPlayer.addEventListener('ended', () => {
  activePlaybackBiteId = '';
  syncAudioControls();
  syncPlaybackHighlight();
});

audioPlayer.addEventListener('loadedmetadata', () => {
  syncAudioControls();
});

audioPlayer.addEventListener('durationchange', () => {
  syncAudioControls();
});

audioPlayer.addEventListener('volumechange', () => {
  syncAudioControls();
});

audioPlayBtn.addEventListener('click', () => {
  if (!audioPlayer.src) return;
  if (audioPlayer.paused) {
    void audioPlayer.play().catch(() => {});
    return;
  }
  audioPlayer.pause();
});

audioMuteBtn.addEventListener('click', () => {
  audioPlayer.muted = !audioPlayer.muted;
});

audioScrubber.addEventListener('input', (event) => {
  const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
  if (duration <= 0) return;
  const ratio = Math.max(0, Math.min(1, Number(event.target.value) || 0));
  audioPlayer.currentTime = duration * ratio;
  syncAudioControls();
  syncPlaybackHighlight();
});

audioInput.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  loadAudioFile(file);
  audioInput.value = '';
});

transcriptInput.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  await loadTranscriptFile(file);
  transcriptInput.value = '';
});

projectTitleBtn.addEventListener('click', () => {
  beginProjectNameEdit();
});

projectTitleInput.addEventListener('input', (event) => {
  state.projectNameDraft = event.target.value;
  updateDirtyState();
  renderTopControls();
});

projectTitleInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    commitProjectNameEdit();
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    cancelProjectNameEdit();
  }
});

projectTitleInput.addEventListener('blur', () => {
  if (!isEditingProjectName) return;
  commitProjectNameEdit();
});

speakerConfirmBtn.addEventListener('click', () => {
  pushUndoState();
  for (const assignment of state.speakerAssignments) {
    assignment.name = collapseWhitespace(assignment.draft) || assignment.label;
    assignment.draft = assignment.name;
  }
  state.speakerStatus = '';
  state.speakerEditorOpen = false;
  state.saveStatus = '';
  updateDirtyState();
  render();
});

speakerSummaryBtn.addEventListener('click', () => {
  state.speakerEditorOpen = true;
  state.speakerStatus = '';
  render();
});

startOverBtn.addEventListener('click', async () => {
  if (!window.confirm('Clear the uploaded audio, transcript, project name, speaker names, and saved progress?')) return;
  await resetWorkspace();
});

window.addEventListener('keydown', (event) => {
  const metaKeyPressed = event.metaKey || event.ctrlKey;
  if (!metaKeyPressed) return;

  const normalizedKey = event.key.toLowerCase();
  if (normalizedKey === 's') {
    event.preventDefault();
    void saveSession();
    return;
  }

  if (normalizedKey === 'z' && !event.shiftKey) {
    event.preventDefault();
    undo();
    return;
  }

  if ((normalizedKey === 'z' && event.shiftKey) || normalizedKey === 'y') {
    event.preventDefault();
    redo();
  }
});

window.addEventListener('beforeunload', (event) => {
  if (activeAudioObjectUrl) {
    URL.revokeObjectURL(activeAudioObjectUrl);
    activeAudioObjectUrl = '';
  }

  if (state.hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue = '';
  }
});

document.addEventListener('click', (event) => {
  if (!filterMenu.contains(event.target) && !filterBtn.contains(event.target)) {
    isFilterMenuOpen = false;
    renderFilterMenu();
  }
  if (!shareMenu.contains(event.target) && !shareBtn.contains(event.target)) {
    isShareMenuOpen = false;
    renderShareMenu();
  }
});

void initializeApp();

async function initializeApp() {
  const sharedProjectId = readSharedProjectIdFromUrl();
  const restored = sharedProjectId
    ? await loadRemoteProject(sharedProjectId)
    : await restoreSavedSession();
  if (restored) {
    state.saveStatus = sharedProjectId ? 'Shared project loaded.' : 'Saved progress restored.';
  }
  if (state.shareProjectId) {
    startRemoteSync();
  }
  render();
  syncAudioControls();
}

function loadAudioFile(file) {
  pushUndoState();
  setAudioSource(file, file.name, '', buildAudioFingerprint(file));
  state.audioNeedsRemoteSync = true;

  if (!collapseWhitespace(state.projectNameDraft)) {
    const defaultProjectName = deriveProjectName(file.name);
    state.projectNameDraft = defaultProjectName;
    if (!collapseWhitespace(state.projectName)) {
      state.projectName = defaultProjectName;
    }
  }

  state.saveStatus = '';
  updateDirtyState();
  render();
}

async function loadTranscriptFile(file) {
  const rawText = await file.text();
  const parsedTranscript = parseTranscript(rawText);

  pushUndoState();
  state.transcriptFileName = file.name;
  state.transcriptWarning = parsedTranscript.warning;
  state.bites = parsedTranscript.bites;
  state.speakerAssignments = buildSpeakerAssignments(parsedTranscript.bites, state.speakerAssignments);
  state.speakerStatus = '';
  state.speakerEditorOpen = state.speakerAssignments.length > 0;
  state.saveStatus = '';
  updateDirtyState();
  render();
}

async function resetWorkspace() {
  clearTextEditTracking();
  undoStack.length = 0;
  redoStack.length = 0;
  lastSavedSignature = '';
  draggedBiteId = '';
  stopRemoteSync();
  clearState();
  state.hasUnsavedChanges = false;
  state.saveStatus = '';
  await clearSavedSession();
  clearSharedProjectIdFromUrl();
  render();
}

function clearState() {
  setAudioSource(null, '', '');
  state.transcriptFileName = '';
  state.transcriptWarning = '';
  state.bites = [];
  state.projectName = '';
  state.projectNameDraft = '';
  state.shareProjectId = '';
  state.remoteVersion = 0;
  state.speakerAssignments = [];
  state.speakerStatus = '';
  state.speakerEditorOpen = true;
  state.activeFilters = [];
  state.audioNeedsRemoteSync = false;
}

function setAudioSource(blob, fileName, remoteUrl = '', fingerprint = '') {
  if (activeAudioObjectUrl) {
    URL.revokeObjectURL(activeAudioObjectUrl);
    activeAudioObjectUrl = '';
  }

  state.audioBlob = blob || null;
  state.audioFileName = fileName || '';
  state.audioRemoteUrl = blob ? '' : String(remoteUrl || '');
  state.audioFingerprint = String(fingerprint || '').trim() || fileName || '';
  state.audioUrl = blob ? URL.createObjectURL(blob) : state.audioRemoteUrl;
  if (blob) {
    activeAudioObjectUrl = state.audioUrl;
  }

  if (state.audioUrl) {
    audioPlayer.src = state.audioUrl;
  } else {
    audioPlayer.removeAttribute('src');
    audioPlayer.load();
  }
  syncAudioControls();
}

function render() {
  const isReady = hasReadyWorkspace();

  audioFileName.textContent = state.audioUrl ? state.audioFileName : '';
  transcriptFileName.textContent = state.transcriptFileName || '';

  landingPanel.classList.toggle('hidden', isReady);
  workspace.classList.toggle('hidden', !isReady);

  renderTopControls(isReady);
  syncAudioControls();

  if (!isReady) return;

  renderPromptPanel();
  renderProjectTitle();
  renderFilterMenu();

  const visibleBites = getVisibleBites();
  transcriptSummary.textContent = buildTranscriptSummary(visibleBites.length, state.bites.length);

  if (state.transcriptWarning) {
    statusMessage.textContent = state.transcriptWarning;
    statusMessage.classList.remove('hidden');
  } else {
    statusMessage.textContent = '';
    statusMessage.classList.add('hidden');
  }

  emptyState.textContent = state.bites.length > 0 ? 'No sound bites match the selected filters.' : 'No transcript bites were created from this file yet.';
  emptyState.classList.toggle('hidden', visibleBites.length > 0);
  renderBites(visibleBites);
}

function syncAudioControls() {
  const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
  const currentTime = Math.min(duration || 0, Math.max(0, Number(audioPlayer.currentTime) || 0));
  const ratio = duration > 0 ? currentTime / duration : 0;
  const progressPercent = `${Math.max(0, Math.min(100, ratio * 100))}%`;

  audioScrubber.disabled = !audioPlayer.src || duration <= 0;
  audioScrubber.value = String(ratio);
  audioScrubber.style.setProperty('--scrubber-progress', progressPercent);
  audioTimeLabel.textContent = `${formatPlayerTimestamp(currentTime)} / ${formatPlayerTimestamp(duration)}`;

  if (audioPlayer.paused || audioPlayer.ended) {
    audioPlayBtn.setAttribute('aria-label', 'Play audio');
    audioPlayBtn.setAttribute('title', 'Play audio');
    audioPlayIcon.setAttribute('viewBox', '0 0 24 24');
    audioPlayIcon.innerHTML = '<path d="M8 6l10 6-10 6z"></path>';
  } else {
    audioPlayBtn.setAttribute('aria-label', 'Pause audio');
    audioPlayBtn.setAttribute('title', 'Pause audio');
    audioPlayIcon.setAttribute('viewBox', '0 0 24 24');
    audioPlayIcon.innerHTML = '<path d="M8 6h3v12H8z"></path><path d="M13 6h3v12h-3z"></path>';
  }

  const isMuted = audioPlayer.muted || audioPlayer.volume === 0;
  audioMuteBtn.setAttribute('aria-label', isMuted ? 'Unmute audio' : 'Mute audio');
  audioMuteBtn.setAttribute('title', isMuted ? 'Unmute audio' : 'Mute audio');
  audioVolumeIcon.innerHTML = isMuted
    ? '<path d="M5 10h4l5-4v12l-5-4H5z"></path><path d="M17 9l4 6"></path><path d="M21 9l-4 6"></path>'
    : '<path d="M5 10h4l5-4v12l-5-4H5z"></path><path d="M17 9c1.6 1.6 1.6 4.4 0 6"></path><path d="M19.5 6.5c3 3 3 8 0 11"></path>';
}

function formatPlayerTimestamp(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderTopControls(isReady = hasReadyWorkspace()) {
  undoBtn.disabled = undoStack.length === 0;
  redoBtn.disabled = redoStack.length === 0;
  saveBtn.disabled = !isReady || !state.hasUnsavedChanges;
  shareBtn.disabled = !isReady;
  renderShareMenu();
}

function renderPromptPanel() {
  const showSpeakerEditor = state.speakerEditorOpen && state.speakerAssignments.length > 0;
  setupPanel.classList.toggle('hidden', !showSpeakerEditor);
  renderPromptStatuses();
  renderSpeakerSummary();
  renderSpeakerFields();
  speakerEditorPanel.classList.toggle('hidden', !showSpeakerEditor);
}

function renderFilterMenu() {
  filterBtn.setAttribute('aria-expanded', String(isFilterMenuOpen));
  filterMenu.classList.toggle('hidden', !isFilterMenuOpen);
  filterBtn.textContent = state.activeFilters.length ? `Filter (${state.activeFilters.length})` : 'Filter';

  for (const checkbox of filterCheckboxes) {
    checkbox.checked = state.activeFilters.includes(checkbox.value);
  }
}

function renderShareMenu() {
  shareBtn.setAttribute('aria-expanded', String(isShareMenuOpen));
  shareMenu.classList.toggle('hidden', !isShareMenuOpen || shareBtn.disabled);
}

function renderPromptStatuses() {
  if (state.speakerStatus) {
    speakerStatus.textContent = state.speakerStatus;
    speakerStatus.classList.remove('hidden');
  } else {
    speakerStatus.textContent = '';
    speakerStatus.classList.add('hidden');
  }
}

function renderSpeakerSummary() {
  const speakerNames = state.speakerAssignments
    .map((assignment) => collapseWhitespace(assignment.name) || assignment.label)
    .filter(Boolean);

  if (!speakerNames.length) {
    speakerSummaryBtn.textContent = '';
    speakerSummaryBtn.classList.add('hidden');
    return;
  }

  speakerSummaryBtn.textContent = `Speakers: ${speakerNames.join(', ')}`;
  speakerSummaryBtn.classList.remove('hidden');
}

function renderProjectTitle() {
  const projectName = collapseWhitespace(state.projectNameDraft) || collapseWhitespace(state.projectName) || deriveProjectName(state.audioFileName) || 'Untitled Project';
  projectTitleBtn.textContent = projectName;
  projectTitleInput.value = state.projectNameDraft || projectName;
  projectTitleBtn.classList.toggle('hidden', isEditingProjectName);
  projectTitleInput.classList.toggle('hidden', !isEditingProjectName);
}

function beginProjectNameEdit() {
  isEditingProjectName = true;
  renderProjectTitle();
  window.requestAnimationFrame(() => {
    projectTitleInput.focus();
    projectTitleInput.select();
  });
}

function commitProjectNameEdit() {
  const nextProjectName = collapseWhitespace(state.projectNameDraft) || deriveProjectName(state.audioFileName) || 'Untitled Project';
  if (nextProjectName !== state.projectName) {
    pushUndoState();
    state.projectName = nextProjectName;
  }
  state.projectNameDraft = nextProjectName;
  state.saveStatus = '';
  isEditingProjectName = false;
  updateDirtyState();
  render();
}

function cancelProjectNameEdit() {
  state.projectNameDraft = state.projectName || deriveProjectName(state.audioFileName) || '';
  isEditingProjectName = false;
  updateDirtyState();
  render();
}

function renderSpeakerFields() {
  speakerFields.replaceChildren();
  speakerFields.classList.toggle('single-speaker-fields', state.speakerAssignments.length <= 1);

  if (!state.speakerAssignments.length) {
    const emptyCopy = document.createElement('p');
    emptyCopy.className = 'speaker-empty-copy';
    emptyCopy.textContent = 'No speaker labels were detected in this transcript.';
    speakerFields.append(emptyCopy);
    speakerConfirmBtn.disabled = true;
    return;
  }

  speakerConfirmBtn.disabled = false;

  for (const assignment of state.speakerAssignments) {
    const field = document.createElement('label');
    field.className = 'speaker-field';

    const caption = document.createElement('span');
    caption.className = 'speaker-field-label';
    caption.textContent = assignment.label;

    const input = document.createElement('input');
    input.className = 'prompt-input speaker-input';
    input.type = 'text';
    input.value = assignment.draft;
    input.placeholder = assignment.label;
    input.addEventListener('input', (event) => {
      assignment.draft = event.target.value;
      state.speakerStatus = '';
      updateDirtyState();
      renderTopControls();
      renderPromptStatuses();
    });

    field.append(caption, input);
    speakerFields.append(field);
  }
}

function renderBites(visibleBites = state.bites) {
  bitesList.replaceChildren();

  for (const [index, bite] of visibleBites.entries()) {
    bite.text = capitalizeSoundbite(bite.text);
    const fragment = biteTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.bite-card');
    const orderLabel = fragment.querySelector('.bite-order');
    const timecodeBtn = fragment.querySelector('.timecode-btn');
    const speakerChip = fragment.querySelector('.speaker-chip');
    const textarea = fragment.querySelector('.bite-text');
    const producerNoteToggle = fragment.querySelector('.producer-note-toggle');
    const producerNoteInput = fragment.querySelector('.producer-note-input');
    const toneButtons = Array.from(fragment.querySelectorAll('.tone-btn'));
    const moveUpBtn = fragment.querySelector('.move-up-btn');
    const moveDownBtn = fragment.querySelector('.move-down-btn');
    const deleteBtn = fragment.querySelector('.delete-btn');

    card.dataset.id = bite.id;
    card.classList.toggle('tone-red', bite.tone === 'red');
    card.classList.toggle('tone-yellow', bite.tone === 'yellow');
    card.classList.toggle('tone-green', bite.tone === 'green');
    card.classList.toggle('is-playing', bite.id === activePlaybackBiteId);

    orderLabel.textContent = `Bite ${index + 1}`;
    timecodeBtn.textContent = formatTimeRange(bite);
    timecodeBtn.disabled = bite.startSeconds == null;
    timecodeBtn.addEventListener('click', () => {
      if (bite.startSeconds == null) return;
      audioPlayer.currentTime = bite.startSeconds;
      void audioPlayer.play().catch(() => {});
    });

    const speakerName = getSpeakerDisplayName(bite);
    if (speakerName) {
      speakerChip.textContent = speakerName;
      speakerChip.classList.remove('hidden');
    } else {
      speakerChip.textContent = '';
      speakerChip.classList.add('hidden');
    }

    textarea.value = bite.text;
    textarea.addEventListener('focus', () => {
      card.classList.add('is-text-active');
    });
    textarea.addEventListener('click', () => {
      card.classList.add('is-text-active');
    });
    textarea.addEventListener('input', (event) => {
      handleTextEdit(bite.id, event.target.value);
    });
    textarea.addEventListener('blur', () => {
      card.classList.remove('is-text-active');
      const normalizedText = capitalizeSoundbite(bite.text);
      if (normalizedText !== bite.text) {
        bite.text = normalizedText;
        render();
      }
    });

    producerNoteToggle.addEventListener('click', () => {
      bite.notesOpen = bite.notesOpen !== true;
      render();
    });

    producerNoteToggle.classList.toggle('hidden', bite.notesOpen === true);
    producerNoteInput.classList.toggle('hidden', bite.notesOpen !== true);
    producerNoteInput.value = Array.isArray(bite.comments) ? bite.comments[0] || '' : '';
    producerNoteInput.addEventListener('input', (event) => {
      handleProducerNoteEdit(bite.id, event.target.value);
    });
    producerNoteInput.addEventListener('focus', () => {
      bite.notesOpen = true;
    });

    for (const button of toneButtons) {
      const isActive = button.dataset.tone === bite.tone;
      button.classList.toggle('is-active', isActive);
      button.addEventListener('click', () => {
        pushUndoState();
        bite.tone = isActive ? 'none' : button.dataset.tone;
        state.saveStatus = '';
        updateDirtyState();
        render();
      });
    }

    moveUpBtn.disabled = index === 0;
    moveUpBtn.addEventListener('click', () => {
      const currentIndex = state.bites.findIndex((entry) => entry.id === bite.id);
      moveBite(currentIndex, currentIndex - 1);
    });

    moveDownBtn.disabled = index === visibleBites.length - 1;
    moveDownBtn.addEventListener('click', () => {
      const currentIndex = state.bites.findIndex((entry) => entry.id === bite.id);
      moveBite(currentIndex, currentIndex + 1);
    });

    deleteBtn.addEventListener('click', () => {
      pushUndoState();
      state.bites = state.bites.filter((entry) => entry.id !== bite.id);
      state.speakerAssignments = buildSpeakerAssignments(state.bites, state.speakerAssignments);
      state.saveStatus = '';
      updateDirtyState();
      render();
    });

    attachDragHandlers(card, bite.id);
    bitesList.append(card);
  }

  syncPlaybackHighlight();
}

function getVisibleBites() {
  if (!state.activeFilters.length) {
    return state.bites;
  }

  return state.bites.filter((bite) => biteMatchesFilters(bite));
}

function biteMatchesFilters(bite) {
  return state.activeFilters.some((filter) => {
    if (filter === 'unmarked') {
      return !bite.tone || bite.tone === 'none';
    }

    if (filter === 'comments') {
      return Array.isArray(bite.comments) && bite.comments.length > 0;
    }

    return bite.tone === filter;
  });
}

function buildTranscriptSummary(visibleCount, totalCount) {
  if (!state.activeFilters.length) {
    return `${totalCount} sound ${totalCount === 1 ? 'bite' : 'bites'}`;
  }

  return `${visibleCount} of ${totalCount} sound ${totalCount === 1 ? 'bite' : 'bites'}`;
}

function syncPlaybackHighlight() {
  const nextActiveBiteId = getActivePlaybackBiteId(audioPlayer.currentTime);
  activePlaybackBiteId = nextActiveBiteId;

  for (const card of bitesList.querySelectorAll('.bite-card')) {
    card.classList.toggle('is-playing', card.dataset.id === activePlaybackBiteId);
  }
}

function getActivePlaybackBiteId(currentTimeSeconds) {
  if (!Number.isFinite(currentTimeSeconds) || currentTimeSeconds < 0) {
    return '';
  }

  for (let index = 0; index < state.bites.length; index += 1) {
    const bite = state.bites[index];
    if (bite.startSeconds == null) continue;

    const nextTimedBite = state.bites.slice(index + 1).find((entry) => entry.startSeconds != null);
    const biteEndSeconds = bite.endSeconds ?? nextTimedBite?.startSeconds ?? Number.POSITIVE_INFINITY;

    if (currentTimeSeconds >= bite.startSeconds && currentTimeSeconds < biteEndSeconds) {
      return bite.id;
    }
  }

  return '';
}

function getSpeakerDisplayName(bite) {
  if (!bite.speakerKey) return '';
  const assignment = state.speakerAssignments.find((entry) => entry.key === bite.speakerKey);
  return assignment?.name || bite.speakerLabel || '';
}

function handleTextEdit(biteId, value) {
  if (!textEditLocks.has(biteId)) {
    pushUndoState();
    textEditLocks.add(biteId);
  }

  const bite = state.bites.find((entry) => entry.id === biteId);
  if (!bite) return;

  bite.text = value;
  state.saveStatus = '';
  updateDirtyState();
  renderTopControls();

  window.clearTimeout(textEditTimers.get(biteId));
  textEditTimers.set(
    biteId,
    window.setTimeout(() => {
      textEditLocks.delete(biteId);
      textEditTimers.delete(biteId);
    }, TEXT_HISTORY_IDLE_MS)
  );
}

function handleProducerNoteEdit(biteId, value) {
  const lockKey = `comment:${biteId}`;
  if (!textEditLocks.has(lockKey)) {
    pushUndoState();
    textEditLocks.add(lockKey);
  }

  const bite = state.bites.find((entry) => entry.id === biteId);
  if (!bite) return;

  const nextValue = String(value || '').replace(/\r\n/g, '\n');
  bite.comments = collapseWhitespace(nextValue) ? [nextValue] : [];
  state.saveStatus = '';
  updateDirtyState();
  renderTopControls();

  window.clearTimeout(textEditTimers.get(lockKey));
  textEditTimers.set(
    lockKey,
    window.setTimeout(() => {
      textEditLocks.delete(lockKey);
      textEditTimers.delete(lockKey);
    }, TEXT_HISTORY_IDLE_MS)
  );
}

function attachDragHandlers(card, biteId) {
  card.addEventListener('dragstart', (event) => {
    draggedBiteId = biteId;
    card.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', biteId);
  });

  card.addEventListener('dragend', () => {
    draggedBiteId = '';
    clearDropTargets();
    card.classList.remove('dragging');
  });

  card.addEventListener('dragover', (event) => {
    if (!draggedBiteId || draggedBiteId === biteId) return;
    event.preventDefault();
    clearDropTargets();

    const midpoint = card.getBoundingClientRect().top + card.offsetHeight / 2;
    card.classList.add(event.clientY < midpoint ? 'drop-before' : 'drop-after');
  });

  card.addEventListener('dragleave', () => {
    card.classList.remove('drop-before', 'drop-after');
  });

  card.addEventListener('drop', (event) => {
    if (!draggedBiteId || draggedBiteId === biteId) return;
    event.preventDefault();

    const sourceIndex = state.bites.findIndex((bite) => bite.id === draggedBiteId);
    const targetIndex = state.bites.findIndex((bite) => bite.id === biteId);
    const midpoint = card.getBoundingClientRect().top + card.offsetHeight / 2;
    const insertAt = event.clientY < midpoint ? targetIndex : targetIndex + 1;

    if (sourceIndex === -1 || targetIndex === -1) return;

    pushUndoState();
    const [movedBite] = state.bites.splice(sourceIndex, 1);
    const adjustedIndex = sourceIndex < insertAt ? insertAt - 1 : insertAt;
    state.bites.splice(adjustedIndex, 0, movedBite);

    state.saveStatus = '';
    clearDropTargets();
    updateDirtyState();
    render();
  });
}

function clearDropTargets() {
  for (const card of bitesList.querySelectorAll('.bite-card')) {
    card.classList.remove('drop-before', 'drop-after');
  }
}

function moveBite(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= state.bites.length) return;
  pushUndoState();
  const [bite] = state.bites.splice(fromIndex, 1);
  state.bites.splice(toIndex, 0, bite);
  state.saveStatus = '';
  updateDirtyState();
  render();
}

function undo() {
  if (!undoStack.length) return;
  clearTextEditTracking();
  redoStack.push(createSnapshot());
  const snapshot = undoStack.pop();
  applySnapshot(snapshot);
  state.saveStatus = '';
  state.speakerStatus = '';
  updateDirtyState();
  render();
}

function redo() {
  if (!redoStack.length) return;
  clearTextEditTracking();
  undoStack.push(createSnapshot());
  const snapshot = redoStack.pop();
  applySnapshot(snapshot);
  state.saveStatus = '';
  state.speakerStatus = '';
  updateDirtyState();
  render();
}

async function saveSession() {
  if (!hasReadyWorkspace()) return;

  state.saveStatus = 'Saving...';
  renderTopControls();

  try {
    const sharedProject = await saveRemoteProject();
    applyRemoteProject(sharedProject, { preserveFilters: true });
    const snapshot = createSnapshot();
    await writeSavedSession(snapshot);
    lastSavedSignature = getSnapshotSignature(snapshot);
    state.hasUnsavedChanges = false;
    state.saveStatus = 'Saved.';
    startRemoteSync();
  } catch (error) {
    state.saveStatus = error instanceof Error ? error.message : 'Save failed.';
  }

  renderTopControls();
}

function pushUndoState() {
  clearTextEditTracking();
  undoStack.push(createSnapshot());
  if (undoStack.length > HISTORY_LIMIT) {
    undoStack.shift();
  }
  redoStack.length = 0;
}

function createSnapshot() {
  return {
    audioBlob: state.audioBlob,
    audioFileName: state.audioFileName,
    audioFingerprint: state.audioFingerprint,
    audioNeedsRemoteSync: state.audioNeedsRemoteSync,
    audioRemoteUrl: state.audioRemoteUrl,
    transcriptFileName: state.transcriptFileName,
    transcriptWarning: state.transcriptWarning,
    projectName: state.projectName,
    projectNameDraft: state.projectNameDraft,
    shareProjectId: state.shareProjectId,
    remoteVersion: state.remoteVersion,
    speakerEditorOpen: state.speakerEditorOpen,
    activeFilters: [...state.activeFilters],
    speakerAssignments: state.speakerAssignments.map(cloneSpeakerAssignment),
    bites: state.bites.map(cloneBite)
  };
}

function applySnapshot(snapshot) {
  setAudioSource(
    snapshot.audioBlob || null,
    snapshot.audioFileName || '',
    snapshot.audioRemoteUrl || '',
    snapshot.audioFingerprint || snapshot.audioFileName || ''
  );
  state.audioNeedsRemoteSync = snapshot.audioNeedsRemoteSync === true;
  state.transcriptFileName = snapshot.transcriptFileName || '';
  state.transcriptWarning = snapshot.transcriptWarning || '';
  state.projectName = snapshot.projectName || '';
  state.projectNameDraft = snapshot.projectNameDraft || '';
  state.shareProjectId = snapshot.shareProjectId || '';
  state.remoteVersion = Math.max(0, Number(snapshot.remoteVersion) || 0);
  state.speakerEditorOpen = snapshot.speakerEditorOpen ?? true;
  state.activeFilters = Array.isArray(snapshot.activeFilters)
    ? snapshot.activeFilters.filter((value) => FILTER_VALUES.includes(value))
    : [];
  state.bites = (snapshot.bites || []).map(normalizeLoadedBite);
  state.speakerAssignments = buildSpeakerAssignments(state.bites, (snapshot.speakerAssignments || []).map(cloneSpeakerAssignment));
  if (state.shareProjectId) {
    startRemoteSync();
  } else {
    stopRemoteSync();
  }
}

function cloneBite(bite) {
  return {
    id: bite.id,
    startSeconds: bite.startSeconds,
    endSeconds: bite.endSeconds,
    text: bite.text,
    tone: bite.tone,
    speakerKey: bite.speakerKey || '',
    speakerLabel: bite.speakerLabel || '',
    comments: Array.isArray(bite.comments) ? bite.comments.map((entry) => String(entry || '')) : []
  };
}

function normalizeLoadedBite(bite) {
  const clonedBite = cloneBite(bite);
  if (clonedBite.speakerKey || !clonedBite.text) {
    return clonedBite;
  }

  const speakerInfo = extractSpeakerInfo(clonedBite.text);
  return {
    ...clonedBite,
    text: speakerInfo.text,
    speakerKey: speakerInfo.speakerKey,
    speakerLabel: speakerInfo.speakerLabel
  };
}

function cloneSpeakerAssignment(assignment) {
  return {
    key: assignment.key,
    label: assignment.label,
    name: assignment.name,
    draft: assignment.draft
  };
}

function updateDirtyState() {
  state.hasUnsavedChanges = getSnapshotSignature(createSnapshot()) !== lastSavedSignature;
}

function getSnapshotSignature(snapshot) {
  return JSON.stringify({
    hasAudio: Boolean(snapshot.audioBlob || snapshot.audioRemoteUrl),
    audioFileName: snapshot.audioFileName,
    audioFingerprint: snapshot.audioFingerprint,
    audioRemoteUrl: snapshot.audioRemoteUrl,
    transcriptFileName: snapshot.transcriptFileName,
    transcriptWarning: snapshot.transcriptWarning,
    projectName: snapshot.projectName,
    projectNameDraft: snapshot.projectNameDraft,
    shareProjectId: snapshot.shareProjectId,
    speakerEditorOpen: snapshot.speakerEditorOpen,
    activeFilters: snapshot.activeFilters,
    speakerAssignments: snapshot.speakerAssignments.map((assignment) => ({
      key: assignment.key,
      label: assignment.label,
      name: assignment.name,
      draft: assignment.draft
    })),
    bites: snapshot.bites.map((bite) => ({
      id: bite.id,
      startSeconds: bite.startSeconds,
      endSeconds: bite.endSeconds,
      text: bite.text,
      tone: bite.tone,
      speakerKey: bite.speakerKey,
      speakerLabel: bite.speakerLabel,
      comments: Array.isArray(bite.comments) ? bite.comments.map((entry) => String(entry || '')) : []
    }))
  });
}

function clearTextEditTracking() {
  for (const timerId of textEditTimers.values()) {
    window.clearTimeout(timerId);
  }
  textEditTimers.clear();
  textEditLocks.clear();
}

function hasReadyWorkspace() {
  return Boolean(state.audioUrl) && Boolean(state.transcriptFileName);
}

async function restoreSavedSession() {
  try {
    const snapshot = await readSavedSession();
    if (!snapshot) return false;
    applySnapshot(snapshot);
    lastSavedSignature = getSnapshotSignature(snapshot);
    state.hasUnsavedChanges = false;
    return true;
  } catch {
    return false;
  }
}

async function shareProjectLink() {
  try {
    if (!state.shareProjectId) {
      if (!hasReadyWorkspace()) return;
      const sharedProject = await saveRemoteProject();
      applyRemoteProject(sharedProject, { preserveFilters: true });
      const snapshot = createSnapshot();
      await writeSavedSession(snapshot);
      lastSavedSignature = getSnapshotSignature(snapshot);
      state.hasUnsavedChanges = false;
      startRemoteSync();
      renderTopControls();
    }

    const shareUrl = buildShareUrl(state.shareProjectId);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Keep going and show the link either way.
    }

    window.prompt('Copy this project link', shareUrl);
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'Could not create share link.');
  }
}

async function downloadTranscriptPdf() {
  if (!hasReadyWorkspace()) return;

  const pdfBytes = buildTranscriptPdfBytes();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');

  downloadLink.href = downloadUrl;
  downloadLink.download = buildTranscriptPdfFileName();
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1_000);
}

function buildTranscriptPdfFileName() {
  const title = collapseWhitespace(state.projectNameDraft)
    || collapseWhitespace(state.projectName)
    || stripFileExtension(state.transcriptFileName)
    || 'transcript';
  return `${sanitizeFileName(title)}.pdf`;
}

function buildTranscriptPdfBytes() {
  const pageWidth = 612;
  const pageHeight = 792;
  const leftMargin = 54;
  const rightMargin = 54;
  const topMargin = 56;
  const bottomMargin = 56;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  const measureContext = createPdfMeasureContext();
  const pages = [];
  const title = collapseWhitespace(state.projectNameDraft)
    || collapseWhitespace(state.projectName)
    || stripFileExtension(state.transcriptFileName)
    || 'Transcript';
  const exportDate = formatPdfExportDate(new Date());
  let commands = [];
  let cursorY = topMargin;

  function beginPage() {
    commands = [];
    pages.push(commands);
    cursorY = topMargin;
  }

  function ensureSpace(height) {
    if (!pages.length) {
      beginPage();
    }
    if (cursorY + height <= pageHeight - bottomMargin) {
      return;
    }
    beginPage();
  }

  beginPage();
  drawPdfText(commands, pageHeight, title, leftMargin, cursorY, {
    font: 'F2',
    size: 22,
    color: [17, 17, 17]
  });
  cursorY += 30;

  drawPdfText(commands, pageHeight, exportDate, leftMargin, cursorY, {
    font: 'F1',
    size: 10,
    color: [107, 107, 107]
  });
  cursorY += 28;

  for (const bite of state.bites) {
    const timeLabel = formatTimeRange(bite);
    const speakerName = getSpeakerDisplayName(bite);
    const toneMeta = getToneMeta(bite.tone);
    const wrappedLines = wrapPdfTextForPdf(
      capitalizeSoundbite(bite.text) || '',
      contentWidth,
      12,
      '400',
      measureContext
    );
    const headerHeight = speakerName ? 30 : 16;
    const bodyHeight = Math.max(1, wrappedLines.length) * 16;
    const toneHeight = toneMeta ? 28 : 0;
    const blockHeight = headerHeight + bodyHeight + toneHeight + 22;

    ensureSpace(blockHeight);

    drawPdfText(commands, pageHeight, timeLabel, leftMargin, cursorY, {
      font: 'F2',
      size: 11,
      color: [17, 17, 17]
    });
    cursorY += 16;

    if (speakerName) {
      drawPdfText(commands, pageHeight, speakerName, leftMargin, cursorY, {
        font: 'F1',
        size: 10,
        color: [107, 107, 107]
      });
      cursorY += 14;
    }

    for (const line of wrappedLines) {
      drawPdfText(commands, pageHeight, line, leftMargin, cursorY, {
        font: 'F1',
        size: 12,
        color: [17, 17, 17]
      });
      cursorY += 16;
    }

    if (toneMeta) {
      const labelWidth = Math.max(78, measurePdfText(toneMeta.label, 10, '700', measureContext) + 18);
      drawPdfRect(commands, pageHeight, leftMargin, cursorY + 4, labelWidth, 18, {
        fillColor: toneMeta.fillColor,
        strokeColor: toneMeta.strokeColor
      });
      drawPdfText(commands, pageHeight, toneMeta.label, leftMargin + 9, cursorY + 8, {
        font: 'F2',
        size: 10,
        color: toneMeta.textColor
      });
      cursorY += 28;
    } else {
      cursorY += 10;
    }

    drawPdfLine(commands, pageHeight, leftMargin, cursorY, pageWidth - rightMargin, cursorY, {
      color: [217, 217, 217],
      width: 1
    });
    cursorY += 18;
  }

  return buildPdfDocument(pages, pageWidth, pageHeight);
}

function createPdfMeasureContext() {
  const canvas = document.createElement('canvas');
  return canvas.getContext('2d');
}

function wrapPdfTextForPdf(text, maxWidth, fontSize, fontWeight, measureContext) {
  const normalizedText = sanitizePdfText(text).replace(/\s+/g, ' ').trim();
  if (!normalizedText) {
    return [''];
  }

  const words = normalizedText.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (measurePdfText(nextLine, fontSize, fontWeight, measureContext) <= maxWidth) {
      currentLine = nextLine;
      continue;
    }

    if (!currentLine) {
      lines.push(...splitPdfWord(word, maxWidth, fontSize, fontWeight, measureContext));
      currentLine = '';
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function splitPdfWord(word, maxWidth, fontSize, fontWeight, measureContext) {
  const fragments = [];
  let currentFragment = '';

  for (const character of word) {
    const nextFragment = currentFragment + character;
    if (measurePdfText(nextFragment, fontSize, fontWeight, measureContext) <= maxWidth || !currentFragment) {
      currentFragment = nextFragment;
      continue;
    }
    fragments.push(currentFragment);
    currentFragment = character;
  }

  if (currentFragment) {
    fragments.push(currentFragment);
  }

  return fragments;
}

function measurePdfText(text, fontSize, fontWeight, measureContext) {
  measureContext.font = `${fontWeight} ${fontSize}px Helvetica, Arial, sans-serif`;
  return measureContext.measureText(sanitizePdfText(text)).width;
}

function getToneMeta(tone) {
  if (tone === 'red') {
    return {
      label: 'Must Have',
      fillColor: [255, 244, 243],
      strokeColor: [217, 75, 66],
      textColor: [142, 47, 41]
    };
  }

  if (tone === 'yellow') {
    return {
      label: 'High Priority',
      fillColor: [255, 249, 232],
      strokeColor: [201, 144, 0],
      textColor: [138, 103, 0]
    };
  }

  if (tone === 'green') {
    return {
      label: 'Good Bite',
      fillColor: [242, 251, 245],
      strokeColor: [31, 154, 85],
      textColor: [23, 107, 60]
    };
  }

  return null;
}

function drawPdfText(commands, pageHeight, text, x, y, options = {}) {
  const safeText = escapePdfText(sanitizePdfText(text));
  if (!safeText) return;

  const font = options.font || 'F1';
  const size = options.size || 12;
  const color = formatPdfColor(options.color || [0, 0, 0]);
  const pdfY = pageHeight - y - size;

  commands.push('BT');
  commands.push(`/${font} ${size} Tf`);
  commands.push(`${color} rg`);
  commands.push(`1 0 0 1 ${formatPdfNumber(x)} ${formatPdfNumber(pdfY)} Tm`);
  commands.push(`(${safeText}) Tj`);
  commands.push('ET');
}

function drawPdfRect(commands, pageHeight, x, y, width, height, options = {}) {
  const fillColor = formatPdfColor(options.fillColor || [255, 255, 255]);
  const strokeColor = formatPdfColor(options.strokeColor || [217, 217, 217]);
  const pdfY = pageHeight - y - height;

  commands.push('q');
  commands.push(`${fillColor} rg`);
  commands.push(`${strokeColor} RG`);
  commands.push('1 w');
  commands.push(`${formatPdfNumber(x)} ${formatPdfNumber(pdfY)} ${formatPdfNumber(width)} ${formatPdfNumber(height)} re`);
  commands.push('B');
  commands.push('Q');
}

function drawPdfLine(commands, pageHeight, x1, y1, x2, y2, options = {}) {
  const strokeColor = formatPdfColor(options.color || [217, 217, 217]);
  const width = options.width || 1;

  commands.push('q');
  commands.push(`${strokeColor} RG`);
  commands.push(`${formatPdfNumber(width)} w`);
  commands.push(`${formatPdfNumber(x1)} ${formatPdfNumber(pageHeight - y1)} m`);
  commands.push(`${formatPdfNumber(x2)} ${formatPdfNumber(pageHeight - y2)} l`);
  commands.push('S');
  commands.push('Q');
}

function buildPdfDocument(pages, pageWidth, pageHeight) {
  const objects = [];
  let nextObjectId = 1;
  const fontRegularId = nextObjectId++;
  const fontBoldId = nextObjectId++;
  const pageEntries = pages.map((commands) => ({
    contentId: nextObjectId++,
    pageId: nextObjectId++,
    content: commands.join('\n')
  }));
  const pagesId = nextObjectId++;
  const catalogId = nextObjectId++;

  objects[fontRegularId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[fontBoldId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

  for (const entry of pageEntries) {
    objects[entry.contentId] = `<< /Length ${entry.content.length} >>\nstream\n${entry.content}\nendstream`;
    objects[entry.pageId] = [
      '<< /Type /Page',
      `/Parent ${pagesId} 0 R`,
      `/MediaBox [0 0 ${pageWidth} ${pageHeight}]`,
      `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >>`,
      `/Contents ${entry.contentId} 0 R`,
      '>>'
    ].join('\n');
  }

  objects[pagesId] = `<< /Type /Pages /Kids [${pageEntries.map((entry) => `${entry.pageId} 0 R`).join(' ')}] /Count ${pageEntries.length} >>`;
  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    offsets[objectId] = pdf.length;
    pdf += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

function formatPdfColor(rgb) {
  return rgb.map((value) => formatPdfNumber((Math.max(0, Math.min(255, Number(value) || 0))) / 255)).join(' ');
}

function formatPdfNumber(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, '');
}

function escapePdfText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function sanitizePdfText(value) {
  return String(value || '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '');
}

function stripFileExtension(fileName) {
  return String(fileName || '').replace(/\.[^.]+$/, '');
}

function sanitizeFileName(value) {
  return String(value || 'transcript')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
    || 'transcript';
}

function formatPdfExportDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

function buildRemoteProjectPayload() {
  return {
    projectName: collapseWhitespace(state.projectNameDraft) || collapseWhitespace(state.projectName) || deriveProjectName(state.audioFileName) || 'Untitled Project',
    transcriptFileName: state.transcriptFileName,
    transcriptWarning: state.transcriptWarning,
    speakerEditorOpen: state.speakerEditorOpen,
    speakerAssignments: state.speakerAssignments.map(cloneSpeakerAssignment),
    bites: state.bites.map(cloneBite)
  };
}

async function saveRemoteProject() {
  let projectId = state.shareProjectId;
  if (!projectId) {
    const createResponse = await fetch('/api/interview-projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const created = await parseJsonResponse(createResponse, 'Could not create shared project.');
    projectId = String(created?.project?.id || '').trim();
    if (!projectId) {
      throw new Error('Could not create shared project.');
    }
    state.shareProjectId = projectId;
    replaceUrlWithSharedProjectId(projectId);
  }

  if (state.audioBlob && state.audioNeedsRemoteSync) {
    const uploadUrl = `/api/interview-projects/${encodeURIComponent(projectId)}/audio?filename=${encodeURIComponent(state.audioFileName || 'audio')}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': state.audioBlob.type || 'application/octet-stream'
      },
      body: state.audioBlob
    });
    if (!uploadResponse.ok) {
      throw new Error('Could not upload interview audio.');
    }
  }

  const saveResponse = await fetch(`/api/interview-projects/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildRemoteProjectPayload())
  });
  const payload = await parseJsonResponse(saveResponse, 'Could not save shared project.');
  return payload?.project;
}

async function loadRemoteProject(projectId) {
  try {
    const project = await fetchRemoteProject(projectId);
    applyRemoteProject(project, { preserveFilters: true });
    lastSavedSignature = getSnapshotSignature(createSnapshot());
    state.hasUnsavedChanges = false;
    return true;
  } catch (error) {
    state.saveStatus = error instanceof Error ? error.message : 'Could not load shared project.';
    return false;
  }
}

async function fetchRemoteProject(projectId) {
  const response = await fetch(`/api/interview-projects/${encodeURIComponent(projectId)}`);
  const payload = await parseJsonResponse(response, 'Could not load shared project.');
  if (!payload?.project) {
    throw new Error('Shared project not found.');
  }
  return payload.project;
}

function applyRemoteProject(project, { preserveFilters = false } = {}) {
  const preservedFilters = preserveFilters ? [...state.activeFilters] : [];
  const normalizedProjectName = collapseWhitespace(project?.projectName) || deriveProjectName(project?.audioFileName) || 'Untitled Project';
  const projectId = String(project?.id || '').trim();
  const remoteVersion = Math.max(0, Number(project?.version) || 0);
  const remoteAudioUrl = projectId && project?.audioAvailable
    ? buildRemoteAudioUrl(projectId, remoteVersion)
    : '';

  setAudioSource(null, project?.audioFileName || state.audioFileName, remoteAudioUrl, `${projectId}:${remoteVersion}:${project?.audioFileName || ''}`);
  state.audioNeedsRemoteSync = false;
  state.shareProjectId = projectId;
  state.remoteVersion = remoteVersion;
  state.transcriptFileName = String(project?.transcriptFileName || '').trim();
  state.transcriptWarning = String(project?.transcriptWarning || '').trim();
  state.projectName = normalizedProjectName;
  state.projectNameDraft = normalizedProjectName;
  state.speakerEditorOpen = project?.speakerEditorOpen !== false;
  state.bites = Array.isArray(project?.bites) ? project.bites.map(normalizeLoadedBite) : [];
  state.speakerAssignments = buildSpeakerAssignments(
    state.bites,
    Array.isArray(project?.speakerAssignments) ? project.speakerAssignments.map(cloneSpeakerAssignment) : []
  );
  state.speakerStatus = '';
  state.saveStatus = '';
  if (preserveFilters) {
    state.activeFilters = preservedFilters;
  }
  if (projectId) {
    replaceUrlWithSharedProjectId(projectId);
  }
}

function startRemoteSync() {
  stopRemoteSync();
  if (!state.shareProjectId) return;
  remoteSyncTimerId = window.setInterval(() => {
    void pollRemoteProject();
  }, REMOTE_SYNC_INTERVAL_MS);
}

function stopRemoteSync() {
  if (!remoteSyncTimerId) return;
  window.clearInterval(remoteSyncTimerId);
  remoteSyncTimerId = 0;
}

async function pollRemoteProject() {
  if (remoteSyncInFlight || !state.shareProjectId || state.hasUnsavedChanges) return;
  remoteSyncInFlight = true;
  try {
    const project = await fetchRemoteProject(state.shareProjectId);
    const remoteVersion = Math.max(0, Number(project?.version) || 0);
    if (remoteVersion > state.remoteVersion) {
      applyRemoteProject(project, { preserveFilters: true });
      lastSavedSignature = getSnapshotSignature(createSnapshot());
      state.hasUnsavedChanges = false;
      state.saveStatus = 'Changes synced.';
      render();
    }
  } catch {
    // Ignore transient polling errors.
  } finally {
    remoteSyncInFlight = false;
  }
}

function readSharedProjectIdFromUrl() {
  const url = new URL(window.location.href);
  return String(url.searchParams.get('project') || '').trim();
}

function replaceUrlWithSharedProjectId(projectId) {
  const url = new URL(window.location.href);
  url.searchParams.set('project', projectId);
  window.history.replaceState({}, '', url);
}

function clearSharedProjectIdFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('project');
  window.history.replaceState({}, '', url);
}

function buildShareUrl(projectId) {
  const url = new URL(window.location.href);
  url.searchParams.set('project', projectId);
  return url.toString();
}

function buildRemoteAudioUrl(projectId, version) {
  return `/api/interview-projects/${encodeURIComponent(projectId)}/audio?v=${encodeURIComponent(String(version || 0))}`;
}

function buildAudioFingerprint(file) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

async function parseJsonResponse(response, fallbackMessage) {
  const payload = safeJsonParse(await response.text(), {});
  if (response.ok) {
    return payload;
  }
  throw new Error(String(payload?.error || fallbackMessage || 'Request failed.'));
}

function safeJsonParse(raw, fallback = {}) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function openSessionDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(SESSION_DB_NAME, 1);

    request.addEventListener('upgradeneeded', () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(SESSION_STORE_NAME)) {
        database.createObjectStore(SESSION_STORE_NAME);
      }
    });

    request.addEventListener('success', () => {
      resolve(request.result);
    });

    request.addEventListener('error', () => {
      reject(request.error);
    });
  });
}

async function readSavedSession() {
  const database = await openSessionDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SESSION_STORE_NAME, 'readonly');
    const store = transaction.objectStore(SESSION_STORE_NAME);
    const request = store.get(SESSION_RECORD_KEY);

    request.addEventListener('success', () => {
      resolve(request.result || null);
    });

    request.addEventListener('error', () => {
      reject(request.error);
    });
  });
}

async function writeSavedSession(snapshot) {
  const database = await openSessionDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SESSION_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(SESSION_STORE_NAME);
    const request = store.put(snapshot, SESSION_RECORD_KEY);

    request.addEventListener('success', () => {
      resolve();
    });

    request.addEventListener('error', () => {
      reject(request.error);
    });
  });
}

async function clearSavedSession() {
  const database = await openSessionDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SESSION_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(SESSION_STORE_NAME);
    const request = store.delete(SESSION_RECORD_KEY);

    request.addEventListener('success', () => {
      resolve();
    });

    request.addEventListener('error', () => {
      reject(request.error);
    });
  });
}

function parseTranscript(rawText) {
  const normalizedText = rawText.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();

  if (!normalizedText) {
    return {
      bites: [],
      warning: 'The transcript file was empty.'
    };
  }

  const timedBlocks = parseTimedBlocks(normalizedText);
  if (timedBlocks.length > 0) {
    return {
      bites: timedBlocks.map(createBite),
      warning: ''
    };
  }

  const paragraphBlocks = normalizedText
    .split(/\n{2,}/)
    .map((block) => collapseWhitespace(block))
    .filter(Boolean);

  return {
    bites: paragraphBlocks.map((text) =>
      createBite({
        startSeconds: null,
        endSeconds: null,
        text
      })
    ),
    warning: 'No timecodes were detected, so the transcript was split into paragraph bites.'
  };
}

function parseTimedBlocks(text) {
  const bites = [];
  const blockList = text.split(/\n{2,}/);

  for (const block of blockList) {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length || lines[0] === 'WEBVTT') continue;

    const adjustedLines = [...lines];
    if (/^\d+$/.test(adjustedLines[0]) && adjustedLines[1] && hasTimingRange(adjustedLines[1])) {
      adjustedLines.shift();
    }

    if (adjustedLines[0] && hasTimingRange(adjustedLines[0])) {
      const timing = parseTimingRange(adjustedLines[0]);
      const cueText = cleanCueText(adjustedLines.slice(1).join(' '));
      if (timing && cueText) {
        bites.push({
          startSeconds: timing.startSeconds,
          endSeconds: timing.endSeconds,
          text: cueText
        });
      }
      continue;
    }

    const parsedInline = parseInlineTimedLines(adjustedLines);
    if (parsedInline.length > 0) {
      bites.push(...parsedInline);
    }
  }

  return bites;
}

function parseInlineTimedLines(lines) {
  const bites = [];
  let currentBite = null;

  for (const line of lines) {
    const timedLineMatch = line.match(/^(?:\d+\s*[-–—]\s*)?\[?((?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?)\]?(?:\s*(?:-->|[-–—])\s*\[?((?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?)\]?)?(?:\s*(?:[-–—:])\s*|\s+)?(.*)$/);

    if (timedLineMatch) {
      if (currentBite && currentBite.text) {
        bites.push(currentBite);
      }

      currentBite = {
        startSeconds: parseTimestamp(timedLineMatch[1]),
        endSeconds: parseTimestamp(timedLineMatch[2]),
        text: cleanCueText(timedLineMatch[3] || '')
      };
      continue;
    }

    if (!currentBite) {
      return [];
    }

    currentBite.text = cleanCueText(`${currentBite.text} ${line}`);
  }

  if (currentBite && currentBite.text) {
    bites.push(currentBite);
  }

  return bites;
}

function hasTimingRange(value) {
  return /^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?\s*(?:-->|[-–—])\s*(?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?\s*$/.test(value);
}

function parseTimingRange(value) {
  const match = value.match(/^\s*((?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?)\s*(?:-->|[-–—])\s*((?:\d{1,2}:)?\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?)\s*$/);
  if (!match) return null;

  return {
    startSeconds: parseTimestamp(match[1]),
    endSeconds: parseTimestamp(match[2])
  };
}

function parseTimestamp(value) {
  if (!value) return null;

  const normalized = value.replace(',', '.').trim();
  const parts = normalized.split(':');
  if (parts.length < 2 || parts.length > 4) return null;

  const numericParts = parts.map((part) => Number(part));
  if (numericParts.some((part) => Number.isNaN(part))) return null;

  if (numericParts.length === 2) {
    return numericParts[0] * 60 + numericParts[1];
  }

  if (numericParts.length === 4) {
    return numericParts[0] * 3600 + numericParts[1] * 60 + numericParts[2];
  }

  return numericParts[0] * 3600 + numericParts[1] * 60 + numericParts[2];
}

function formatTimeRange(bite) {
  if (bite.startSeconds == null && bite.endSeconds == null) return 'No timecode';
  const startLabel = bite.startSeconds == null ? '00:00' : formatTimestamp(bite.startSeconds);
  const endLabel = bite.endSeconds == null ? startLabel : formatTimestamp(bite.endSeconds);
  return `${startLabel} - ${endLabel}`;
}

function formatTimestamp(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanCueText(value) {
  return capitalizeSoundbite(
    collapseWhitespace(
      value
        .replace(/^\s*\d+\s*[-–—]\s*\d{1,2}:\d{2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?\s*/, '')
        .replace(/^\s*\d{1,2}:\d{2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?\s*[-–—:]\s*/, '')
    )
  );
}

function capitalizeSoundbite(value) {
  const text = String(value || '');
  const match = text.match(/^(\s*)([a-z])(.*)$/s);
  if (!match) return text;

  return `${match[1]}${match[2].toUpperCase()}${match[3]}`;
}

function createBite({ startSeconds, endSeconds, text }) {
  const speakerInfo = extractSpeakerInfo(text);
  return {
    id: crypto.randomUUID(),
    startSeconds,
    endSeconds,
    text: speakerInfo.text,
    tone: 'none',
    speakerKey: speakerInfo.speakerKey,
    speakerLabel: speakerInfo.speakerLabel,
    comments: []
  };
}

function extractSpeakerInfo(rawText) {
  const text = collapseWhitespace(rawText);
  if (!text) {
    return { text: '', speakerKey: '', speakerLabel: '' };
  }

  const speakerMatch = text.match(/^((?:speaker|spk)\s*(?:\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten))\b(?:\s*[:\-]\s*|\s+)(.+)$/i);
  if (speakerMatch) {
    const label = formatSpeakerLabel(speakerMatch[1]);
    return {
      text: collapseWhitespace(speakerMatch[2]),
      speakerKey: normalizeSpeakerKey(label),
      speakerLabel: label
    };
  }

  const roleMatch = text.match(/^((?:producer|host|interviewer|interviewee|guest|narrator))\b(?:\s*[:\-]\s*|\s+)(.+)$/i);
  if (roleMatch) {
    const label = formatSpeakerLabel(roleMatch[1]);
    return {
      text: collapseWhitespace(roleMatch[2]),
      speakerKey: normalizeSpeakerKey(label),
      speakerLabel: label
    };
  }

  const namedColonMatch = text.match(/^([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})\s*:\s*(.+)$/);
  if (namedColonMatch) {
    const label = collapseWhitespace(namedColonMatch[1]);
    return {
      text: collapseWhitespace(namedColonMatch[2]),
      speakerKey: normalizeSpeakerKey(label),
      speakerLabel: label
    };
  }

  return {
    text,
    speakerKey: '',
    speakerLabel: ''
  };
}

function buildSpeakerAssignments(bites, existingAssignments = []) {
  const existingMap = new Map(existingAssignments.map((assignment) => [assignment.key, assignment]));
  const orderedAssignments = [];
  const seenKeys = new Set();

  for (const bite of bites) {
    if (!bite.speakerKey || seenKeys.has(bite.speakerKey)) continue;
    seenKeys.add(bite.speakerKey);
    if (orderedAssignments.length >= MAX_SPEAKERS) break;

    const existingAssignment = existingMap.get(bite.speakerKey);
    orderedAssignments.push({
      key: bite.speakerKey,
      label: bite.speakerLabel,
      name: existingAssignment?.name || bite.speakerLabel,
      draft: existingAssignment?.draft || existingAssignment?.name || bite.speakerLabel
    });
  }

  return orderedAssignments;
}

function deriveProjectName(fileName) {
  return String(fileName || '').replace(/\.[^.]+$/, '').trim();
}

function normalizeSpeakerKey(value) {
  return collapseWhitespace(String(value || '')).toLowerCase();
}

function formatSpeakerLabel(value) {
  return collapseWhitespace(String(value || '')).replace(/\b\w/g, (char) => char.toUpperCase());
}
