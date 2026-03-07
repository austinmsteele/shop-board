const DATA_KEY = 'shopping-organizer-data-v1';
const LEGACY_ITEMS_KEY = 'shopping-organizer-items';
const VIEW_STORAGE_KEY = 'shopping-organizer-view';
const DATA_BACKUP_KEY = 'shopping-organizer-data-v1-backup';
const BETA_WELCOME_FALLBACK_KEY = 'shopboard-beta-welcome-ack-v1';
const BETA_AUTH_MODE_SIGN_IN = 'sign-in';
const BETA_AUTH_MODE_SIGN_UP = 'sign-up';
const ITEM_NAME_MAX_LENGTH = 200;

const appShell = document.querySelector('#app-shell');
const homeScreen = document.querySelector('#home-screen');
const homeAuthBar = document.querySelector('#home-auth-bar');
const homeAuthBtn = document.querySelector('#home-auth-btn');
const boardScreen = document.querySelector('#board-screen');
const boardTitle = document.querySelector('#board-title');
const profileAvatar = document.querySelector('.profile-avatar');
const profileName = document.querySelector('.profile-name');

const betaGate = document.querySelector('#beta-gate');
const betaEnterBtn = document.querySelector('#beta-enter-btn');
const authDialog = document.querySelector('#auth-dialog');
const authDialogCloseBtn = document.querySelector('#auth-dialog-close-btn');
const authDialogMessage = document.querySelector('#auth-dialog-message');
const betaAuthForm = document.querySelector('#beta-auth-form');
const betaAuthEmailInput = document.querySelector('#beta-auth-email');
const betaAuthPasswordInput = document.querySelector('#beta-auth-password');
const betaAuthSubmitBtn = document.querySelector('#beta-auth-submit');
const betaTabSignIn = document.querySelector('#beta-tab-sign-in');
const betaTabSignUp = document.querySelector('#beta-tab-sign-up');
const betaAuthStatus = document.querySelector('#beta-auth-status');
const betaGateStatus = document.querySelector('#beta-gate-status');

const boardsGrid = document.querySelector('#boards-grid');
const boardCardTemplate = document.querySelector('#board-card-template');
const newBoardTileTemplate = document.querySelector('#new-board-tile-template');
const backHomeBtn = document.querySelector('#back-home-btn');
const boardTitleWrap = document.querySelector('#board-title-wrap');
const boardTitleInput = document.querySelector('#board-title-input');
const categoryPanel = document.querySelector('#category-panel');
const categoryBreadcrumbs = document.querySelector('#category-breadcrumbs');
const categoryChildren = document.querySelector('#category-children');
const addCategoryBtn = document.querySelector('#add-category-btn');
const boardViewControls = document.querySelector('#board-view-controls');

const addForm = document.querySelector('#add-form');
const addItemPanel = document.querySelector('#add-item-panel');
const extractingOverlay = document.querySelector('#extracting-overlay');
const cancelExtractBtn = document.querySelector('#cancel-extract-btn');
const addCategorySelect = document.querySelector('#add-category-select');
const urlInput = document.querySelector('#product-url');
const addBtn = document.querySelector('#add-btn');
const hoverPreview = document.querySelector('#hover-preview');
const hoverPreviewImage = document.querySelector('#hover-preview-image');
const hoverPreviewThumbs = document.querySelector('#hover-preview-thumbs');
const hoverPreviewAddBtn = document.querySelector('#hover-preview-add-btn');
const hoverPreviewStar = document.querySelector('#hover-preview-star');
const hoverPreviewDelete = document.querySelector('#hover-preview-delete');
const hoverPreviewPrev = document.querySelector('#hover-preview-prev');
const hoverPreviewNext = document.querySelector('#hover-preview-next');
const hoverAddDialog = document.querySelector('#hover-add-dialog');
const hoverAddForm = document.querySelector('#hover-add-form');
const hoverAddCloseBtn = document.querySelector('#hover-add-close-btn');
const hoverAddUrl = document.querySelector('#hover-add-url');
const hoverAddDropZone = document.querySelector('#hover-add-drop-zone');
const hoverAddUrlBtn = document.querySelector('#hover-add-url-btn');
const hoverAddUploadBtn = document.querySelector('#hover-add-upload-btn');
const hoverAddUploadInput = document.querySelector('#hover-add-upload-input');
const itemsTable = document.querySelector('#items-table');
const body = document.querySelector('#items-body');
const cardsGrid = document.querySelector('#cards-grid');
const cardTemplate = document.querySelector('#card-template');
const listViewSection = document.querySelector('#list-view-section');
const imageViewSection = document.querySelector('#image-view-section');
const viewToggleButtons = new Set();

const editDialog = document.querySelector('#edit-dialog');
const editForm = document.querySelector('#edit-form');
const editCancelBtn = document.querySelector('#edit-cancel-btn');
const editBrand = document.querySelector('#edit-brand');
const editDescription = document.querySelector('#edit-description');
const editSeller = document.querySelector('#edit-seller');
const editPrice = document.querySelector('#edit-price');
const editImage = document.querySelector('#edit-image');
const editHighlights = document.querySelector('#edit-highlights');
const detailDialog = document.querySelector('#detail-dialog');
const detailCloseBtn = document.querySelector('#detail-close-btn');
const detailLink = document.querySelector('#detail-link');
const detailName = document.querySelector('#detail-name');
const detailPrice = document.querySelector('#detail-price');
const detailDynamicSections = document.querySelector('#detail-dynamic-sections');
const detailMainImage = document.querySelector('#detail-main-image');
const detailMainEmpty = document.querySelector('#detail-main-empty');
const detailThumbs = document.querySelector('#detail-thumbs');
const detailPrevBtn = document.querySelector('#detail-prev-btn');
const detailNextBtn = document.querySelector('#detail-next-btn');
const detailFeaturedBtn = document.querySelector('#detail-featured-btn');
const detailDeleteBtn = document.querySelector('#detail-delete-btn');
const detailAddImageBtn = document.querySelector('#detail-add-image-btn');
const detailFeedbackList = document.querySelector('#detail-feedback-list');
const detailFeedbackComposerInput = document.querySelector('#detail-feedback-input');
const detailFeedbackComposerGrid = document.querySelector('#detail-feedback-emoji-grid');
const detailFeedbackSaveBtn = document.querySelector('#detail-feedback-save');
const detailFeedbackCancelBtn = document.querySelector('#detail-feedback-cancel');
const imagePickerDialog = document.querySelector('#image-picker-dialog');
const imagePickerForm = document.querySelector('#image-picker-form');
const imagePickerGrid = document.querySelector('#image-picker-grid');
const imagePickerUrl = document.querySelector('#image-picker-url');
const imagePickerAddBtn = document.querySelector('#image-picker-add-btn');
const feedbackDialog = document.querySelector('#feedback-dialog');
const feedbackForm = document.querySelector('#feedback-form');
const feedbackInput = document.querySelector('#feedback-input');
const feedbackEmojiGrid = document.querySelector('#feedback-emoji-grid');
const feedbackCancelBtn = document.querySelector('#feedback-cancel-btn');
const categoryAddDialog = document.querySelector('#category-add-dialog');
const categoryAddForm = document.querySelector('#category-add-form');
const categoryAddNameInput = document.querySelector('#category-add-name');
const categoryAddCancelBtn = document.querySelector('#category-add-cancel-btn');
const categoryDeleteDialog = document.querySelector('#category-delete-dialog');
const categoryDeleteForm = document.querySelector('#category-delete-form');
const categoryDeleteMessage = document.querySelector('#category-delete-message');
const categoryDeleteNoBtn = document.querySelector('#category-delete-no-btn');
const boardDeleteDialog = document.querySelector('#board-delete-dialog');
const boardDeleteForm = document.querySelector('#board-delete-form');
const boardDeleteMessage = document.querySelector('#board-delete-message');
const boardDeleteNoBtn = document.querySelector('#board-delete-no-btn');
const errorDialog = document.querySelector('#error-dialog');
const errorDialogTitle = document.querySelector('#error-dialog-title');
const errorDialogMessage = document.querySelector('#error-dialog-message');
const errorDialogCloseBtn = document.querySelector('#error-dialog-close-btn');
const errorDialogOkBtn = document.querySelector('#error-dialog-ok-btn');
const newBoardDialog = document.querySelector('#new-board-dialog');
const newBoardForm = document.querySelector('#new-board-form');
const newBoardTitle = document.querySelector('#new-board-title');
const newBoardLabel = document.querySelector('#new-board-label');
const newBoardInput = document.querySelector('#new-board-input');
const newBoardCancelBtn = document.querySelector('#new-board-cancel-btn');
const boardEditDialog = document.querySelector('#board-edit-dialog');
const boardEditForm = document.querySelector('#board-edit-form');
const boardEditNameInput = document.querySelector('#board-edit-name');
const boardEditCandidatesContainer = document.querySelector('#board-edit-candidates');
const boardEditResetBtn = document.querySelector('#board-edit-reset-btn');
const boardEditCancelBtn = document.querySelector('#board-edit-cancel-btn');
const boardEditPreviewSlots = Array.from(document.querySelectorAll('[data-board-edit-slot]'));

let currentUserName = profileName?.textContent?.trim() || 'ShopBoard User';
const EMOJI_OPTIONS = ['👍', '👎', '❌', '🔥', '🏆', '🥇', '🥈', '🥉', '😎', '🤮', '❤️', '😕', '👀'];
const FAVORITE_RANK_OPTIONS = [
  { rank: 'gold', emoji: '🥇', label: 'Gold favorite' },
  { rank: 'silver', emoji: '🥈', label: 'Silver favorite' },
  { rank: 'bronze', emoji: '🥉', label: 'Bronze favorite' }
];
const DEFAULT_DATA_CATEGORIES = [
  { slug: 'image', label: 'Image', type: 'text', isDefault: true, isDeletable: false, defaultIndex: 0 },
  { slug: 'item_name', label: 'Item Name', type: 'text', isDefault: true, isDeletable: false, defaultIndex: 1 },
  { slug: 'seller', label: 'Seller (Website)', type: 'text', isDefault: true, isDeletable: false, defaultIndex: 2 },
  { slug: 'price', label: 'Price', type: 'text', isDefault: true, isDeletable: false, defaultIndex: 3 },
  { slug: 'highlights', label: 'Highlights', type: 'text', isDefault: true, isDeletable: false, defaultIndex: 4 },
  { slug: 'feedback', label: 'Feedback', type: 'text', isDefault: true, isDeletable: false, defaultIndex: 5 }
];
const CATEGORY_TYPE_OPTIONS = new Set(['text', 'number', 'boolean', 'select']);
const UNDO_HISTORY_LIMIT = 120;
let data = loadData();
let activeBoardId = null;
let activeView = loadView();
let initialShareIntent = readInitialShareIntent();
let activeSessionUser = null;
let betaWelcomeGateEnabled = true;
let betaAuthMode = BETA_AUTH_MODE_SIGN_IN;
let appReady = false;
let hasHydratedData = false;
let authRecoveryInProgress = false;
let pendingPostAuthAction = null;
let editingItemId = null;
let isEditingBoardTitle = false;
let draggingItemId = null;
let activeExtractController = null;
let activeDetailItemId = null;
let activeDetailImageIndex = 0;
let activeAddImageItemId = null;
let activeImagePickerItemId = null;
let activeFeedbackItemId = null;
let activeFeedbackEditingId = null;
let activeCategoryPath = [];
let activeImageRootCategoryId = '';
let createDialogMode = 'board';
let boardEditTargetId = null;
let boardEditPreviewDraft = ['', '', ''];
let boardEditActiveSlot = 0;
const expandedCategoryIds = new Set();
let draggingBoardId = null;
let addCategoryTargetValue = '';
let pendingCategoryDeleteResolve = null;
let pendingBoardDeleteResolve = null;
let pendingCategoryParentId = null;
let draggingCategoryItemId = null;
let draggingCategoryId = null;
let draggingCategorySourceCollection = null;
let lastExpandedCategoryId = '';
let hoverPreviewItemId = null;
let hoverPreviewImages = [];
let hoverPreviewIndex = 0;
let hoverPreviewHideTimer = null;
const BOARD_DROP_INDICATOR_WIDTH = 4;
const BOARD_DROP_VERTICAL_EXTENSION = 12;
let boardDropIndicator = null;
const extractionQueue = [];
let activeExtractionJob = null;
let categoryEditorDraft = [];
let isEditingCategoryHeaders = false;
let fieldEditorScopeCategoryId = '';
let draggingHeaderCategoryId = '';
let pendingHeaderDragCategoryId = '';
let headerPointerDragActive = false;
let headerPointerDragSourceCategoryId = '';
let headerPointerDragTargetCategoryId = '';
let headerPointerDragInsertAfter = false;
let headerPointerDragPointerId = null;
const boardCategoryLoadPromises = new Map();
const customValueSyncQueue = new Map();
let pendingBrokenImageRepairRender = false;
const rankMenu = document.createElement('div');
rankMenu.className = 'rank-dropdown hidden';
rankMenu.setAttribute('aria-hidden', 'true');
let rankMenuItemId = null;
let rankMenuTrigger = null;
let activeCategoryMenu = null;
let activeCategoryMenuToggle = null;
let activeBoardMenu = null;
let activeBoardMenuToggle = null;
const tableBodyDropEndState = new WeakMap();
const itemGridDropEndState = new WeakMap();
let undoHistory = [];
let redoHistory = [];
let lastSavedSnapshot = serializeDataSnapshot(data);
let pendingServerSnapshot = '';
let serverSnapshotPersistInFlight = false;

function isPromptInputTarget(target) {
  if (target instanceof HTMLTextAreaElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;
  const type = String(target.type || 'text').trim().toLowerCase();
  if (!type || type === 'text') return true;
  return type === 'search' || type === 'url' || type === 'email' || type === 'tel' || type === 'number';
}

function getInputIdentityPrefix(target) {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return 'input';
  const id = String(target.id || '').trim();
  if (id) return id;
  const name = String(target.getAttribute('name') || '').trim();
  if (name) return name;
  return target instanceof HTMLTextAreaElement ? 'textarea' : 'input';
}

function disableAutofill(target) {
  if (!target) return;
  if (target.tagName === 'FORM') {
    target.setAttribute('autocomplete', 'off');
    return;
  }
  if (!isPromptInputTarget(target)) return;
  const isInput = target instanceof HTMLInputElement;
  const isPlainText = target instanceof HTMLTextAreaElement || target.type === 'text' || target.type === 'search';
  // Safari may still offer OTP autofill with autocomplete="off" on plain text fields.
  target.setAttribute('autocomplete', isPlainText ? 'new-password' : 'off');
  if (isInput && isPlainText) target.setAttribute('inputmode', 'text');
  target.setAttribute('aria-autocomplete', 'none');
  target.setAttribute('autocorrect', 'off');
  target.setAttribute('autocapitalize', 'none');
  target.spellcheck = false;
  target.setAttribute('data-lpignore', 'true');
  target.setAttribute('data-1p-ignore', 'true');
  target.setAttribute('data-gramm', 'false');
  target.setAttribute('data-ms-editor', 'false');
}

function refreshInputAutocompleteIdentity(target, prefix = 'input') {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
  const safePrefix = String(prefix || 'input').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  target.setAttribute('name', `${safePrefix}-${crypto.randomUUID()}`);
  target.setAttribute('aria-autocomplete', 'none');
}

function applyAutofillGuards(target) {
  if (!target) return;
  disableAutofill(target);
  if (!isPromptInputTarget(target)) return;
  refreshInputAutocompleteIdentity(target, getInputIdentityPrefix(target));
}

function suppressNativeInputSuggestions(target) {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
  if (!isPromptInputTarget(target)) return;
  if (target.dataset.suppressingSuggestions === 'true') return;
  if (target.readOnly) return;
  target.dataset.suppressingSuggestions = 'true';
  target.readOnly = true;
  target.setAttribute('readonly', 'readonly');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (target.readOnly) {
        target.readOnly = false;
      }
      target.removeAttribute('readonly');
      delete target.dataset.suppressingSuggestions;
    });
  });
}

const autocompleteTargets = document.querySelectorAll('form, input, textarea');
autocompleteTargets.forEach((el) => {
  applyAutofillGuards(el);
});

document.addEventListener('focusin', (event) => {
  const target = event.target;
  if (!isPromptInputTarget(target)) return;
  applyAutofillGuards(target);
  suppressNativeInputSuggestions(target);
});

if (document.body) document.body.appendChild(rankMenu);

document.addEventListener('click', () => {
  if (activeCategoryMenu) {
    activeCategoryMenu.hidden = true;
    activeCategoryMenu = null;
    if (activeCategoryMenuToggle) {
      activeCategoryMenuToggle.setAttribute('aria-expanded', 'false');
      activeCategoryMenuToggle = null;
    }
  }
  closeBoardMenu();
});

betaEnterBtn?.addEventListener('click', () => {
  void handleBetaEnter();
});

betaTabSignIn?.addEventListener('click', () => {
  setBetaAuthMode(BETA_AUTH_MODE_SIGN_IN);
});

betaTabSignUp?.addEventListener('click', () => {
  setBetaAuthMode(BETA_AUTH_MODE_SIGN_UP);
});

betaAuthForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  void handleBetaAuthSubmit();
});

authDialogCloseBtn?.addEventListener('click', () => {
  closeAuthDialog();
});

authDialog?.addEventListener('click', (event) => {
  if (event.target === authDialog) closeAuthDialog();
});

authDialog?.addEventListener('close', () => {
  resetAuthDialogFeedback();
  if (betaAuthPasswordInput) betaAuthPasswordInput.value = '';
});

homeAuthBtn?.addEventListener('click', () => {
  void handleHomeAuthButtonClick();
});

backHomeBtn.addEventListener('click', () => {
  activeBoardId = null;
  activeCategoryPath = [];
  setStatus('');
  renderApp();
});

boardTitle.addEventListener('click', () => {
  startBoardTitleEdit();
});

boardTitle.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    startBoardTitleEdit();
  }
});

boardTitleInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    commitBoardTitleEdit();
  } else if (event.key === 'Escape') {
    cancelBoardTitleEdit();
  }
});

boardTitleInput.addEventListener('blur', () => {
  if (isEditingBoardTitle) commitBoardTitleEdit();
});

boardEditPreviewSlots.forEach((slot) => {
  if (!slot) return;
  slot.addEventListener('click', () => {
    const index = Number(slot.dataset.boardEditSlot);
    setBoardEditActiveSlot(Number.isNaN(index) ? 0 : index);
  });
});

boardEditResetBtn?.addEventListener('click', () => {
  handleBoardEditReset();
});

boardEditCancelBtn?.addEventListener('click', () => {
  boardEditDialog?.close();
});

boardEditForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  handleBoardEditSubmit();
});

boardEditDialog?.addEventListener('close', () => {
  boardEditTargetId = null;
  if (boardEditCandidatesContainer) {
    boardEditCandidatesContainer.innerHTML = '';
  }
});

addForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const board = getActiveBoard();
  if (!board) return;

  const rawUrl = urlInput.value.trim();
  const normalizedUrl = normalizeProductUrl(rawUrl);
  if (!normalizedUrl) {
    setStatus('Please enter a valid URL.', true);
    return;
  }
  const selectedCategory = String(addCategorySelect?.value || addCategoryTargetValue || '__auto__').trim() || '__auto__';
  extractionQueue.push({
    id: crypto.randomUUID(),
    boardId: board.id,
    url: normalizedUrl,
    categoryValue: selectedCategory
  });
  urlInput.value = '';
  if (!activeExtractionJob) {
    setStatus('Starting extraction...', false);
  } else {
    setStatus(`Added to queue. ${extractionQueue.length} waiting.`, false);
  }
  updateExtractionUi();
  processExtractionQueue();
});

if (cancelExtractBtn) {
  cancelExtractBtn.addEventListener('click', () => {
    if (activeExtractController) {
      activeExtractController.abort();
    }
  });
}

async function processExtractionQueue() {
  if (activeExtractionJob) return;
  const nextJob = extractionQueue.shift();
  if (!nextJob) {
    updateExtractionUi();
    return;
  }

  activeExtractionJob = nextJob;
  const controller = new AbortController();
  activeExtractController = controller;
  updateExtractionUi();

  try {
    await runExtractionJob(nextJob, controller.signal);
  } catch (error) {
    if (error?.name === 'AbortError') {
      setStatus('Extraction canceled.', false);
    } else {
      setStatus(error instanceof Error ? error.message : 'Could not add item.', true);
    }
  } finally {
    activeExtractController = null;
    activeExtractionJob = null;
    updateExtractionUi();
    processExtractionQueue();
  }
}

async function runExtractionJob(job, signal) {
  const board = data.boards.find((entry) => entry.id === job.boardId);
  if (!board) {
    setStatus('Skipped queued item because its board no longer exists.', true);
    return;
  }
  await loadBoardCategoryData(board.id).catch(() => {
    // fall back to local schema if category API is unavailable
  });

  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: job.url }),
    signal
  });

  const payload = await response.json();
  if (!response.ok) {
    const errorText = String(payload.error || '');
    if (shouldFallbackToBasicItem(errorText)) {
      const fallbackItem = buildFallbackItem(job.url);
      const target = getTargetCollectionForAdd(board, fallbackItem, job.url, job.categoryValue);
      target.collection.unshift(fallbackItem);
      saveData();
      if (activeBoardId === board.id) renderBoardDetail();
      setStatus(
        target.pathLabel
          ? `Retailer blocked auto-fetch. Added basic item to ${target.pathLabel}.`
          : 'Retailer blocked auto-fetch. Added item with basic details.',
        false
      );
      return;
    }
    throw new Error(payload.error || 'Could not extract this URL.');
  }

  const normalizedImages = normalizeImages(payload.images || payload.image || '');
  const preferredImage = String(payload.image || normalizedImages[0] || '').trim();
  const pinnedImages = pinPrimaryImage([preferredImage, ...normalizedImages], preferredImage || normalizedImages[0] || '');
  const overview = buildOverviewModel(payload, 500);

  const item = {
    id: crypto.randomUUID(),
    url: payload.url || job.url,
    brand: payload.brand || inferBrandFromDescription(payload.name || ''),
    name: normalizeItemName(payload.name || 'Untitled item', payload.url || job.url),
    image: pinnedImages[0] || '',
    images: pinnedImages,
    seller: payload.seller || '',
    price: formatPrice(payload.price || ''),
    highlights: (() => {
      const h = normalizeHighlights(payload.highlights || []);
      return h.length ? h : buildLocalHighlights(payload.name || '', payload.url || job.url);
    })(),
    description: String(payload.description || '').trim(),
    dimensions: normalizeDetailList(payload.dimensions || []),
    materials: normalizeDetailList(payload.materials || []),
    specs: normalizeDetailList(payload.specs || []),
    overview: overview.text,
    overviewBullets: overview.bullets,
    detailSections: normalizeDetailSections(payload.detailSections || []),
    customFieldValues: {},
    feedbacks: [],
    comments: []
  };

  autoPopulateCustomFieldValues(item, board, payload);

  const target = getTargetCollectionForAdd(board, item, job.url, job.categoryValue);
  target.collection.unshift(item);
  saveData();
  queueSyncAllCustomValues(board.id, item.id, item.customFieldValues || {});
  if (activeBoardId === board.id) renderBoardDetail();

  if (target.auto && target.pathLabel) {
    setStatus(`Item added to ${target.pathLabel} (auto-selected).`, false);
  } else if (target.pathLabel) {
    setStatus(`Item added to ${target.pathLabel}.`, false);
  } else {
    setStatus('Item added.', false);
  }
}

function autoPopulateCustomFieldValues(item, board, payload) {
  if (!item || !board || !payload) return;
  const categories = getCustomFieldCategories(board);
  if (!categories.length) return;

  const structured = buildStructuredScrapeLookup(payload);
  for (const category of categories) {
    const existing = item?.customFieldValues?.[category.id];
    if (existing?.source === 'user') continue;
    const lookupKeys = getCategoryLookupKeys(category);
    let candidate = '';
    let confidence = 0;
    for (const [index, key] of lookupKeys.entries()) {
      const value = structured.get(key);
      if (!value) continue;
      candidate = value;
      confidence = index === 0 ? 0.9 : 0.65;
      break;
    }
    if (!candidate) continue;
    const parsed = parseCustomFieldInput(category, candidate);
    if (!parsed.valid || parsed.value == null || parsed.value === '') continue;
    setItemCustomFieldValue(item, category, parsed.value, {
      source: 'scraped',
      confidence
    });
  }
}

function buildStructuredScrapeLookup(payload) {
  const lookup = new Map();
  const put = (rawKey, rawValue) => {
    const key = slugifyCategoryLabel(rawKey);
    const value = String(rawValue || '').trim();
    if (!key || !value || lookup.has(key)) return;
    lookup.set(key, value);
  };

  put('brand', payload.brand);
  put('seller', payload.seller);
  put('price', payload.price);
  put('item_name', payload.name);
  put('name', payload.name);
  put('description', payload.description);
  put('highlights', normalizeHighlights(payload.highlights || []).join(', '));

  const mergeKeyValueList = (entries) => {
    if (!Array.isArray(entries)) return;
    for (const row of entries) {
      const text = String(row || '').trim();
      if (!text) continue;
      const match = text.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        put(match[1], match[2]);
      } else {
        put(text, text);
      }
    }
  };

  mergeKeyValueList(payload.specs);
  mergeKeyValueList(payload.dimensions);
  mergeKeyValueList(payload.materials);
  const longText = [
    payload.name || '',
    payload.description || '',
    ...(Array.isArray(payload.specs) ? payload.specs : []),
    ...(Array.isArray(payload.dimensions) ? payload.dimensions : []),
    ...(Array.isArray(payload.materials) ? payload.materials : []),
    ...(Array.isArray(payload.highlights) ? payload.highlights : [])
  ]
    .map((entry) => String(entry || '').trim())
    .filter(Boolean)
    .join(' | ');
  mergeKnownAttributePatterns(longText, put);
  return lookup;
}

function getCategoryLookupKeys(category) {
  const keys = new Set();
  const slug = slugifyCategoryLabel(category?.slug || '');
  const labelKey = slugifyCategoryLabel(category?.label || '');
  if (slug) keys.add(slug);
  if (labelKey) keys.add(labelKey);
  const normalized = `${slug} ${labelKey}`.trim();
  if (/\bcolor\b|\bcolour\b|\bfinish\b/.test(normalized)) {
    keys.add('color');
    keys.add('colour');
    keys.add('finish');
    keys.add('finish_color');
  }
  if (/\bsize\b|\bdimension\b|\bwidth\b|\bheight\b|\bdepth\b/.test(normalized)) {
    keys.add('size');
    keys.add('dimensions');
    keys.add('dimension');
  }
  if (/\bmaterial\b|\bfabric\b|\bwood\b/.test(normalized)) {
    keys.add('material');
    keys.add('materials');
    keys.add('fabric');
    keys.add('wood_type');
  }
  if (/\bmodel\b|\bsku\b|\bitem_number\b/.test(normalized)) {
    keys.add('model');
    keys.add('sku');
  }
  return Array.from(keys);
}

function mergeKnownAttributePatterns(text, put) {
  const source = String(text || '');
  if (!source) return;
  const patterns = [
    { key: 'color', rx: /(?:^|[\s|,;])(color|colour|finish)\s*[:\-]\s*([a-z0-9][a-z0-9\s,/+#().'-]{1,48})/i },
    { key: 'size', rx: /(?:^|[\s|,;])(size|dimensions?)\s*[:\-]\s*([a-z0-9][a-z0-9\sx/"'.,+\-]{1,64})/i },
    { key: 'material', rx: /(?:^|[\s|,;])(material|fabric)\s*[:\-]\s*([a-z0-9][a-z0-9\s,/+#().'-]{1,64})/i },
    { key: 'model', rx: /(?:^|[\s|,;])(model|sku|item\s*#?)\s*[:\-]\s*([a-z0-9][a-z0-9\s/_#.-]{1,40})/i }
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern.rx);
    if (!match) continue;
    put(pattern.key, match[2]);
  }
}

function updateExtractionUi() {
  const isExtracting = Boolean(activeExtractionJob);
  setExtracting(isExtracting);
}

editCancelBtn.addEventListener('click', () => {
  editDialog.close();
});

if (detailCloseBtn) {
  detailCloseBtn.addEventListener('click', () => {
    detailDialog.close();
  });
}

if (detailDialog) {
  detailDialog.addEventListener('click', (event) => {
    if (event.target === detailDialog) detailDialog.close();
  });
  detailDialog.addEventListener('keydown', (event) => {
    if (!detailDialog.open) return;
    const target = event.target;
    if (target && target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      stepDetailImage(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      stepDetailImage(-1);
    }
  });
  detailDialog.addEventListener('close', () => {
    if (hoverAddDialog?.open && activeAddImageItemId != null && activeAddImageItemId === activeDetailItemId) {
      hoverAddDialog.close();
    }
    activeDetailItemId = null;
    activeDetailImageIndex = 0;
  });
}

if (detailPrevBtn) {
  detailPrevBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    stepDetailImage(-1);
  });
}

if (detailNextBtn) {
  detailNextBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    stepDetailImage(1);
  });
}

if (detailFeaturedBtn) {
  detailFeaturedBtn.addEventListener('click', () => {
    setFeaturedImageFromDetail();
  });
}

if (detailDeleteBtn) {
  detailDeleteBtn.addEventListener('click', () => {
    removeCurrentDetailImage();
  });
}

if (detailAddImageBtn) {
  detailAddImageBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (activeDetailItemId == null) return;
    openAddImageDialogForItem(activeDetailItemId);
  });
}

if (detailFeedbackSaveBtn) {
  detailFeedbackSaveBtn.addEventListener('click', () => {
    commitDetailFeedback();
  });
}

if (detailFeedbackCancelBtn) {
  detailFeedbackCancelBtn.addEventListener('click', () => {
    resetDetailFeedbackComposer();
  });
}

renderDetailFeedbackComposer();

if (imagePickerAddBtn) {
  imagePickerAddBtn.addEventListener('click', () => {
    addImageToPicker();
  });
}

if (imagePickerUrl) {
  imagePickerUrl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addImageToPicker();
    }
  });
}

if (imagePickerDialog) {
  imagePickerDialog.addEventListener('close', () => {
    activeImagePickerItemId = null;
    if (imagePickerGrid) imagePickerGrid.innerHTML = '';
    if (imagePickerUrl) imagePickerUrl.value = '';
  });
}

if (feedbackDialog) {
  feedbackDialog.addEventListener('close', () => {
    activeFeedbackItemId = null;
    activeFeedbackEditingId = null;
    if (feedbackInput) feedbackInput.value = '';
    if (feedbackEmojiGrid) feedbackEmojiGrid.innerHTML = '';
  });
}

if (feedbackCancelBtn) {
  feedbackCancelBtn.addEventListener('click', () => {
    feedbackDialog.close();
  });
}

if (feedbackForm) {
  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    commitFeedbackDialog();
  });
}

if (boardScreen) {
  boardScreen.addEventListener('pointerdown', (event) => {
    if (!isEditingCategoryHeaders) return;
    const target = event.target instanceof Element ? event.target : null;
    const handle = target ? target.closest('.category-header-move-btn') : null;
    if (!handle) return;
    const categoryId = String(handle.getAttribute('data-category-id') || '').trim();
    if (!categoryId) return;
    event.preventDefault();
    startCategoryHeaderPointerDrag(categoryId, event.pointerId);
  });

  boardScreen.addEventListener('mousedown', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const handle = target ? target.closest('.category-header-move-btn') : null;
    pendingHeaderDragCategoryId = String(handle?.getAttribute('data-category-id') || '').trim();
  });

  boardScreen.addEventListener('mouseup', () => {
    pendingHeaderDragCategoryId = '';
  });

  boardScreen.addEventListener('input', (event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target || !target.classList.contains('category-header-input')) return;
    const categoryId = String(target.dataset.categoryId || '');
    const category = categoryEditorDraft.find((entry) => entry.id === categoryId);
    if (!category) return;
    category.label = target.value;
    const mirrors = boardScreen.querySelectorAll(`.category-header-input[data-category-id="${escapeCssSelector(categoryId)}"]`);
    mirrors.forEach((input) => {
      if (input === target) return;
      input.value = target.value;
    });
  });

  boardScreen.addEventListener('focusin', (event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target || !target.classList.contains('category-header-input')) return;
    target.select();
  });

  boardScreen.addEventListener('click', (event) => {
    const targetElement = event.target instanceof Element ? event.target : null;
    if (!targetElement) return;

    const editTrigger = targetElement.closest('.edit-categories-btn');
    if (editTrigger) {
      event.preventDefault();
      const scopedCategoryId = String(
        editTrigger.getAttribute('data-field-scope-category-id')
          || editTrigger.closest('.category-card')?.getAttribute('data-category-id')
          || ''
      ).trim();
      if (isEditingFieldScope(scopedCategoryId)) return;
      startInlineCategoryHeaderEdit(scopedCategoryId);
      return;
    }

    const addTrigger = targetElement.closest('.add-category-inline-btn');
    if (addTrigger) {
      event.preventDefault();
      openAddCategoryDialog();
      return;
    }

    const saveTrigger = targetElement.closest('.save-categories-inline-btn');
    if (saveTrigger) {
      event.preventDefault();
      saveInlineCategoryHeaderEdit();
      return;
    }

    const cancelTrigger = targetElement.closest('.cancel-categories-inline-btn');
    if (cancelTrigger) {
      event.preventDefault();
      cancelInlineCategoryHeaderEdit();
      return;
    }

    const deleteTrigger = targetElement.closest('.category-header-delete-btn');
    if (deleteTrigger) {
      event.preventDefault();
      const categoryId = String(deleteTrigger.getAttribute('data-category-id') || '');
      if (categoryId) deleteCategoryFromHeaderDraft(categoryId);
    }
  });

  boardScreen.addEventListener('dragstart', (event) => {
    if (!isEditingCategoryHeaders) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const headerCell = target.closest('.category-edit-header-cell');
    if (!headerCell) return;
    const categoryId = String(headerCell.getAttribute('data-category-id') || '').trim();
    if (!categoryId) return;
    const startedFromHandle = Boolean(target.closest('.category-header-move-btn'));
    if (!startedFromHandle && pendingHeaderDragCategoryId !== categoryId) {
      event.preventDefault();
      return;
    }
    draggingHeaderCategoryId = categoryId;
    clearCategoryHeaderDragStyles();
    boardScreen.querySelectorAll(`.category-edit-header-cell[data-category-id="${escapeCssSelector(categoryId)}"]`).forEach((cell) => {
      cell.classList.add('is-dragging');
    });
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-category-id', categoryId);
    }
  });

  boardScreen.addEventListener('dragover', (event) => {
    if (!isEditingCategoryHeaders || !draggingHeaderCategoryId) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const headerCell = target.closest('.category-edit-header-cell');
    if (!headerCell) return;
    const targetCategoryId = String(headerCell.getAttribute('data-category-id') || '').trim();
    if (!targetCategoryId || targetCategoryId === draggingHeaderCategoryId) return;
    event.preventDefault();
    const bounds = headerCell.getBoundingClientRect();
    const insertAfter = event.clientX > bounds.left + bounds.width / 2;
    clearCategoryHeaderDragStyles();
    boardScreen.querySelectorAll(`.category-edit-header-cell[data-category-id="${escapeCssSelector(draggingHeaderCategoryId)}"]`).forEach((cell) => {
      cell.classList.add('is-dragging');
    });
    headerCell.classList.add(insertAfter ? 'drag-over-after' : 'drag-over-before');
  });

  boardScreen.addEventListener('drop', (event) => {
    if (!isEditingCategoryHeaders || !draggingHeaderCategoryId) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const headerCell = target.closest('.category-edit-header-cell');
    if (!headerCell) return;
    const targetCategoryId = String(headerCell.getAttribute('data-category-id') || '').trim();
    if (!targetCategoryId || targetCategoryId === draggingHeaderCategoryId) return;
    event.preventDefault();
    const bounds = headerCell.getBoundingClientRect();
    const insertAfter = event.clientX > bounds.left + bounds.width / 2;
    reorderCategoryDraft(draggingHeaderCategoryId, targetCategoryId, insertAfter);
    draggingHeaderCategoryId = '';
    pendingHeaderDragCategoryId = '';
    clearCategoryHeaderDragStyles();
    renderBoardDetail();
  });

  boardScreen.addEventListener('dragend', () => {
    draggingHeaderCategoryId = '';
    pendingHeaderDragCategoryId = '';
    clearCategoryHeaderDragStyles();
  });
}

if (categoryAddCancelBtn) {
  categoryAddCancelBtn.addEventListener('click', () => {
    if (categoryAddDialog?.open) categoryAddDialog.close();
  });
}

if (categoryAddForm) {
  categoryAddForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = String(categoryAddNameInput?.value || '').trim();
    if (!name) {
      setStatus('Field name is required.', true);
      return;
    }
    const lowerName = name.toLowerCase();
    if (categoryEditorDraft.some((entry) => String(entry.label || '').trim().toLowerCase() === lowerName)) {
      setStatus('Field name must be unique.', true);
      return;
    }
    const nextField = {
      id: `new-${crypto.randomUUID()}`,
      label: name,
      slug: slugifyCategoryLabel(name),
      scrapeKey: name,
      type: 'text',
      allowedOptions: [],
      isDefault: false,
      isDeletable: true,
      position: categoryEditorDraft.length,
      isNew: true
    };
    const feedbackIndex = categoryEditorDraft.findIndex((entry) => String(entry.slug || '').trim().toLowerCase() === 'feedback');
    if (feedbackIndex >= 0) {
      categoryEditorDraft.splice(feedbackIndex, 0, nextField);
    } else {
      categoryEditorDraft.push(nextField);
    }
    categoryEditorDraft = categoryEditorDraft.map((entry, index) => ({ ...entry, position: index }));
    if (categoryAddDialog?.open) categoryAddDialog.close();
    renderBoardDetail();
    showNoticeDialog('Custom field data is not auto-populated. Enter values manually.');
  });
}

if (categoryAddDialog) {
  categoryAddDialog.addEventListener('close', () => {
    if (categoryAddNameInput) categoryAddNameInput.value = '';
  });
}

if (categoryDeleteNoBtn) {
  categoryDeleteNoBtn.addEventListener('click', () => {
    if (pendingCategoryDeleteResolve) pendingCategoryDeleteResolve(false);
    pendingCategoryDeleteResolve = null;
    if (categoryDeleteDialog?.open) categoryDeleteDialog.close();
  });
}

if (categoryDeleteForm) {
  categoryDeleteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (pendingCategoryDeleteResolve) pendingCategoryDeleteResolve(true);
    pendingCategoryDeleteResolve = null;
    if (categoryDeleteDialog?.open) categoryDeleteDialog.close();
  });
}

if (categoryDeleteDialog) {
  categoryDeleteDialog.addEventListener('close', () => {
    if (pendingCategoryDeleteResolve) {
      pendingCategoryDeleteResolve(false);
      pendingCategoryDeleteResolve = null;
    }
  });
}

if (boardDeleteNoBtn) {
  boardDeleteNoBtn.addEventListener('click', () => {
    if (pendingBoardDeleteResolve) pendingBoardDeleteResolve(false);
    pendingBoardDeleteResolve = null;
    if (boardDeleteDialog?.open) boardDeleteDialog.close();
  });
}

if (boardDeleteForm) {
  boardDeleteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (pendingBoardDeleteResolve) pendingBoardDeleteResolve(true);
    pendingBoardDeleteResolve = null;
    if (boardDeleteDialog?.open) boardDeleteDialog.close();
  });
}

if (boardDeleteDialog) {
  boardDeleteDialog.addEventListener('close', () => {
    if (pendingBoardDeleteResolve) {
      pendingBoardDeleteResolve(false);
      pendingBoardDeleteResolve = null;
    }
  });
}

if (errorDialogCloseBtn) {
  errorDialogCloseBtn.addEventListener('click', () => {
    closeErrorDialog();
  });
}

if (errorDialogOkBtn) {
  errorDialogOkBtn.addEventListener('click', () => {
    closeErrorDialog();
  });
}

if (newBoardCancelBtn) {
  newBoardCancelBtn.addEventListener('click', () => {
    if (newBoardDialog?.open) newBoardDialog.close();
  });
}

if (newBoardForm) {
  newBoardForm.addEventListener('submit', (event) => {
    event.preventDefault();
    commitNewBoardDialog();
  });
}

if (addCategoryBtn) {
  addCategoryBtn.addEventListener('click', () => {
    openNewBoardDialog('category');
  });
}

if (categoryChildren) {
  categoryChildren.addEventListener('dragover', (event) => {
    const draggedCategoryId = getDraggedCategoryId(event);
    if (draggedCategoryId) return;
    const draggedId = getDraggedItemId(event);
    if (!draggedId) return;
    const card = event.target instanceof Element ? event.target.closest('.category-card') : null;
    if (!card) return;
    event.preventDefault();
    clearCategoryDropStyles();
    card.classList.add('category-drop-over');
  });

  categoryChildren.addEventListener('drop', (event) => {
    const draggedCategoryId = getDraggedCategoryId(event);
    if (draggedCategoryId) return;
    const draggedId = getDraggedItemId(event);
    if (!draggedId) return;
    const card = event.target instanceof Element ? event.target.closest('.category-card') : null;
    const targetCategoryId = card?.dataset?.categoryId || '';
    if (!targetCategoryId) return;
    event.preventDefault();
    clearCategoryDropStyles();
    moveItemToCategory(draggedId, targetCategoryId);
  });

  categoryChildren.addEventListener('dragleave', (event) => {
    const related = event.relatedTarget;
    if (related && categoryChildren.contains(related)) return;
    clearCategoryDropStyles();
  });
}

if (addCategorySelect) {
  addCategorySelect.addEventListener('change', () => {
    addCategoryTargetValue = addCategorySelect.value || '';
  });
}

if (hoverPreview) {
  hoverPreview.addEventListener('mouseenter', () => {
    cancelHoverPreviewHide();
  });
  hoverPreview.addEventListener('mouseleave', () => {
    scheduleHoverPreviewHide();
  });
}

if (hoverPreviewPrev) {
  hoverPreviewPrev.addEventListener('click', (event) => {
    event.stopPropagation();
    stepHoverPreview(-1);
  });
}

if (hoverPreviewNext) {
  hoverPreviewNext.addEventListener('click', (event) => {
    event.stopPropagation();
    stepHoverPreview(1);
  });
}

if (hoverPreviewImage) {
  hoverPreviewImage.addEventListener('click', (event) => {
    event.stopPropagation();
    stepHoverPreview(1);
  });
  hoverPreviewImage.addEventListener('error', () => {
    hideHoverPreview();
  });
}

if (hoverPreviewStar) {
  hoverPreviewStar.addEventListener('click', (event) => {
    event.stopPropagation();
    setCoverFromHoverPreview();
  });
}

if (hoverPreviewDelete) {
  hoverPreviewDelete.addEventListener('click', (event) => {
    event.stopPropagation();
    removeCurrentHoverPreviewImage();
  });
}

if (hoverPreviewAddBtn) {
  hoverPreviewAddBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!hoverPreviewItemId) return;
    openAddImageDialogForItem(hoverPreviewItemId);
  });
}

if (hoverAddForm) {
  hoverAddForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addImageUrlFromHoverPreview();
  });
}

if (hoverAddCloseBtn && hoverAddDialog) {
  hoverAddCloseBtn.addEventListener('click', (event) => {
    event.preventDefault();
    hoverAddDialog.close();
  });
}

if (hoverAddUploadBtn && hoverAddUploadInput) {
  hoverAddUploadBtn.addEventListener('click', (event) => {
    event.preventDefault();
    hoverAddUploadInput.click();
  });
  hoverAddUploadInput.addEventListener('change', () => {
    addUploadedImageFromHoverPreview();
  });
}

if (hoverAddDropZone && hoverAddUploadInput) {
  hoverAddDropZone.addEventListener('click', () => {
    hoverAddUploadInput.click();
  });
  hoverAddDropZone.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    hoverAddUploadInput.click();
  });
  hoverAddDropZone.addEventListener('dragenter', (event) => {
    event.preventDefault();
    hoverAddDropZone.classList.add('is-drag-over');
  });
  hoverAddDropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    hoverAddDropZone.classList.add('is-drag-over');
  });
  hoverAddDropZone.addEventListener('dragleave', (event) => {
    const related = event.relatedTarget;
    if (related instanceof Node && hoverAddDropZone.contains(related)) return;
    hoverAddDropZone.classList.remove('is-drag-over');
  });
  hoverAddDropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    hoverAddDropZone.classList.remove('is-drag-over');
    const { file, url } = getDroppedImageData(event.dataTransfer);
    if (file) {
      addUploadedImageFromHoverPreview(file);
      return;
    }
    if (url) addImageUrlFromHoverPreview(url);
  });
}

if (hoverAddDialog) {
  hoverAddDialog.addEventListener('close', () => {
    activeAddImageItemId = null;
    if (hoverAddUrl) hoverAddUrl.value = '';
    if (hoverAddUploadInput) hoverAddUploadInput.value = '';
    hoverAddDropZone?.classList.remove('is-drag-over');
  });
}

document.addEventListener('keydown', (event) => {
  if (!hoverPreview || hoverPreview.classList.contains('hidden')) return;
  const target = event.target;
  if (target && target.closest('input,textarea,select,button')) return;
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    stepHoverPreview(-1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    stepHoverPreview(1);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    hideHoverPreview();
  }
});

document.addEventListener('mousemove', (event) => {
  if (!hoverPreview || hoverPreview.classList.contains('hidden')) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest('#hover-preview') || target.closest('.item-hover-zoom')) {
    cancelHoverPreviewHide();
    return;
  }
  scheduleHoverPreviewHide();
});

document.addEventListener('mousedown', (event) => {
  if (!hoverPreview || hoverPreview.classList.contains('hidden')) return;
  const target = event.target;
  if (!(target instanceof Element)) {
    hideHoverPreview();
    return;
  }
  if (target.closest('#hover-preview') || target.closest('.item-hover-zoom')) return;
  hideHoverPreview();
});

document.addEventListener('mousedown', (event) => {
  if (rankMenu.classList.contains('hidden')) return;
  const target = event.target;
  if (!(target instanceof Element)) {
    closeRankMenu();
    return;
  }
  if (target.closest('.rank-dropdown') || target.closest('.row-rank-btn') || target.closest('.card-rank-btn')) return;
  closeRankMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!rankMenu.classList.contains('hidden')) closeRankMenu();
  closeBoardMenu();
});

document.addEventListener('keydown', (event) => {
  const undoShortcut = isUndoShortcut(event);
  const redoShortcut = isRedoShortcut(event);
  if (!undoShortcut && !redoShortcut) return;
  if (isNativeInputTarget(event.target)) return;
  event.preventDefault();
  if (redoShortcut) {
    redoLastChange();
    return;
  }
  undoLastChange();
});

window.addEventListener('pointermove', (event) => {
  updateCategoryHeaderPointerDrag(event);
});

window.addEventListener('pointerup', (event) => {
  finishCategoryHeaderPointerDrag(event.pointerId, false);
});

window.addEventListener('pointercancel', (event) => {
  finishCategoryHeaderPointerDrag(event.pointerId, true);
});

window.addEventListener('scroll', () => {
  closeRankMenu();
  closeBoardMenu();
  hideHoverPreview();
}, { passive: true });

window.addEventListener('blur', () => {
  closeRankMenu();
  closeBoardMenu();
  hideHoverPreview();
});

window.addEventListener('resize', () => {
  closeRankMenu();
  closeBoardMenu();
});

editForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const board = getActiveBoard();
  if (!board || !editingItemId) {
    editDialog.close();
    return;
  }

  const item = findItemInActiveCollection(board, editingItemId);
  if (!item) {
    editDialog.close();
    return;
  }

  const brand = editBrand.value.trim();
  const description = editDescription.value.trim() || 'Untitled item';
  item.brand = brand;
  item.name = normalizeItemName(description, item.url || '');
  item.seller = editSeller.value.trim() || item.seller || 'Unknown';
  item.price = formatPrice(editPrice.value);
  item.image = editImage.value.trim();
  item.images = pinPrimaryImage([item.image, ...(item.images || [])], item.image);
  item.highlights = parseHighlightsText(editHighlights.value);

  saveData();
  renderBoardDetail();
  editDialog.close();
  setStatus('Item updated.');
});

void bootstrapApplication();

async function bootstrapApplication() {
  setBetaAuthMode(betaAuthMode);
  const session = await fetchAuthSessionState();
  betaWelcomeGateEnabled = session.betaWelcomeGateEnabled !== false;
  activeSessionUser = session.authenticated ? normalizeSessionUser(session.user) : null;
  applySessionIdentity(activeSessionUser);

  if (shouldShowEntryGate(activeSessionUser)) {
    showBetaGate();
    setBetaGateMessage('');
    setTimeout(() => betaEnterBtn?.focus(), 0);
    return;
  }

  await enterAppShell();
}

function shouldShowEntryGate(user) {
  if (!betaWelcomeGateEnabled) return false;
  if (!user) return !hasLocalBetaWelcomeFallback();
  if (user.hasSeenBetaWelcome) return false;
  return !hasLocalBetaWelcomeFallback();
}

function showBetaGate() {
  if (appShell) appShell.classList.add('hidden');
  closeAuthDialog();
  betaGate?.classList.remove('hidden');
  document.body?.classList.add('beta-gate-active');
}

function hideBetaGate() {
  betaGate?.classList.add('hidden');
  document.body?.classList.remove('beta-gate-active');
}

function setAuthDialogPrompt(message, isError = false) {
  if (!authDialogMessage) return;
  const text = String(message || '').trim();
  authDialogMessage.textContent = text;
  authDialogMessage.classList.toggle('hidden', !text);
  authDialogMessage.classList.toggle('error', Boolean(text) && Boolean(isError));
}

function setAuthDialogMessage(message, isError = false) {
  if (!betaAuthStatus) return;
  const text = String(message || '').trim();
  betaAuthStatus.textContent = text;
  betaAuthStatus.classList.toggle('hidden', !text);
  betaAuthStatus.classList.toggle('error', Boolean(text) && Boolean(isError));
}

function resetAuthDialogFeedback() {
  setAuthDialogPrompt('');
  setAuthDialogMessage('');
}

function closeAuthDialog() {
  if (authDialog?.open) {
    authDialog.close();
    return;
  }
  resetAuthDialogFeedback();
}

function openAuthDialog(message = 'Sign in to continue.', isError = false) {
  setBetaAuthMode(BETA_AUTH_MODE_SIGN_IN);
  setAuthDialogPrompt(message, isError);
  setAuthDialogMessage('');
  if (authDialog && !authDialog.open) authDialog.showModal();
  setTimeout(() => betaAuthEmailInput?.focus(), 0);
}

function setBetaGateMessage(message, isError = false) {
  if (!betaGateStatus) return;
  const text = String(message || '').trim();
  betaGateStatus.textContent = text;
  betaGateStatus.classList.toggle('hidden', !text);
  betaGateStatus.classList.toggle('error', Boolean(text) && Boolean(isError));
}

function setBetaAuthMode(mode) {
  betaAuthMode = mode === BETA_AUTH_MODE_SIGN_UP ? BETA_AUTH_MODE_SIGN_UP : BETA_AUTH_MODE_SIGN_IN;
  const isSignUp = betaAuthMode === BETA_AUTH_MODE_SIGN_UP;
  if (betaAuthPasswordInput) {
    betaAuthPasswordInput.setAttribute('autocomplete', isSignUp ? 'new-password' : 'current-password');
  }
  if (betaTabSignIn) {
    betaTabSignIn.classList.toggle('active', !isSignUp);
    betaTabSignIn.setAttribute('aria-selected', !isSignUp ? 'true' : 'false');
  }
  if (betaTabSignUp) {
    betaTabSignUp.classList.toggle('active', isSignUp);
    betaTabSignUp.setAttribute('aria-selected', isSignUp ? 'true' : 'false');
  }
  if (betaAuthSubmitBtn) {
    betaAuthSubmitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
  }
}

async function handleBetaEnter() {
  if (activeSessionUser) {
    betaEnterBtn?.setAttribute('disabled', 'true');
    setBetaGateMessage('Checking your beta access...');
    const acknowledged = await ensureBetaWelcomeAcknowledged();
    betaEnterBtn?.removeAttribute('disabled');
    if (!acknowledged) return;
    await enterAppShell();
    return;
  }
  betaEnterBtn?.setAttribute('disabled', 'true');
  setBetaGateMessage('Loading ShopBoard...');
  persistLocalBetaWelcomeFallback();
  await enterAppShell();
  betaEnterBtn?.removeAttribute('disabled');
}

async function handleBetaAuthSubmit() {
  const email = String(betaAuthEmailInput?.value || '').trim().toLowerCase();
  const password = String(betaAuthPasswordInput?.value || '');
  const isSignUp = betaAuthMode === BETA_AUTH_MODE_SIGN_UP;
  if (!email || !password) {
    setAuthDialogMessage('Email and password are required.', true);
    return;
  }

  if (betaAuthSubmitBtn) {
    betaAuthSubmitBtn.setAttribute('disabled', 'true');
  }
  setAuthDialogMessage(isSignUp ? 'Creating your account...' : 'Signing you in...');

  try {
    const payload = {
      email,
      password
    };
    const endpoint = isSignUp ? '/api/auth/sign-up' : '/api/auth/sign-in';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    let parsed = null;
    let responseText = '';
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    try {
      if (contentType.includes('application/json')) {
        parsed = await response.json();
      } else {
        responseText = await response.text();
      }
    } catch {
      parsed = null;
      responseText = '';
    }
    if (!response.ok) {
      const message = String(
        parsed?.error
        || responseText
        || `Could not authenticate. (HTTP ${response.status})`
      ).trim();
      throw new Error(message || 'Could not authenticate.');
    }
    betaWelcomeGateEnabled = parsed?.betaWelcomeGateEnabled !== false;
    activeSessionUser = normalizeSessionUser(parsed?.user);
    applySessionIdentity(activeSessionUser);
    if (betaAuthPasswordInput) betaAuthPasswordInput.value = '';
    const acknowledged = await ensureBetaWelcomeAcknowledged();
    if (!acknowledged) return;
    await enterAppShell();
    closeAuthDialog();
    runPendingPostAuthAction();
  } catch (error) {
    setAuthDialogMessage(error instanceof Error ? error.message : 'Could not authenticate.', true);
  } finally {
    if (betaAuthSubmitBtn) {
      betaAuthSubmitBtn.removeAttribute('disabled');
    }
  }
}

function normalizeSessionUser(user) {
  if (!user || typeof user !== 'object') return null;
  return {
    id: String(user.id || '').trim(),
    email: String(user.email || '').trim(),
    displayName: String(user.displayName || '').trim() || 'ShopBoard User',
    hasSeenBetaWelcome: Boolean(user.hasSeenBetaWelcome),
    betaAccessAcknowledgedAt: user.betaAccessAcknowledgedAt || null
  };
}

function applySessionIdentity(user) {
  const fallbackName = user?.displayName || deriveNameFromEmail(user?.email) || 'ShopBoard User';
  currentUserName = fallbackName;
  if (homeAuthBar) {
    homeAuthBar.classList.remove('hidden');
  }
  if (homeAuthBtn) {
    const isAuthenticated = Boolean(user);
    homeAuthBtn.textContent = isAuthenticated ? 'Log Out' : 'Sign Up / Log In';
    homeAuthBtn.setAttribute(
      'aria-label',
      isAuthenticated ? 'Log out of your account' : 'Sign up or log in to your account'
    );
  }
  if (profileName) {
    profileName.textContent = fallbackName;
  }
  if (profileAvatar) {
    profileAvatar.textContent = getInitialsFromName(fallbackName) || 'S';
  }
}

async function handleHomeAuthButtonClick() {
  if (!activeSessionUser) {
    promptAuthForAction('Sign in or create an account to create and save your own boards.');
    return;
  }

  if (homeAuthBtn) {
    homeAuthBtn.setAttribute('disabled', 'true');
    homeAuthBtn.textContent = 'Signing Out...';
  }

  try {
    const response = await fetch('/api/auth/sign-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    activeSessionUser = null;
    applySessionIdentity(null);
    closeAuthDialog();
    setStatus('Signed out.');
  } catch (error) {
    applySessionIdentity(activeSessionUser);
    setStatus('Could not sign out right now.');
    console.warn('Could not sign out:', error);
  } finally {
    homeAuthBtn?.removeAttribute('disabled');
  }
}

async function fetchAuthSessionState() {
  try {
    const response = await fetch('/api/auth/session');
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return {
      authenticated: Boolean(payload?.authenticated),
      user: normalizeSessionUser(payload?.user),
      betaWelcomeGateEnabled: payload?.betaWelcomeGateEnabled !== false
    };
  } catch (error) {
    console.warn('Could not load auth session:', error);
    return {
      authenticated: false,
      user: null,
      betaWelcomeGateEnabled: true
    };
  }
}

async function ensureBetaWelcomeAcknowledged() {
  if (!activeSessionUser) {
    if (authDialog?.open) {
      setAuthDialogMessage('Sign in to continue.', true);
    } else {
      setBetaGateMessage('Sign in to continue.', true);
    }
    return false;
  }
  if (!betaWelcomeGateEnabled || activeSessionUser.hasSeenBetaWelcome) {
    persistLocalBetaWelcomeFallback();
    return true;
  }

  try {
    const response = await fetch('/api/beta/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
    if (!response.ok) {
      throw new Error(String(payload?.error || 'Could not update beta access.'));
    }
    const nextUser = normalizeSessionUser(payload?.user);
    if (nextUser) {
      activeSessionUser = nextUser;
      applySessionIdentity(activeSessionUser);
    }
    persistLocalBetaWelcomeFallback();
    return true;
  } catch (error) {
    console.warn('Could not persist beta welcome acknowledgment on account; using local fallback.', error);
    persistLocalBetaWelcomeFallback();
    return true;
  }
}

function hasLocalBetaWelcomeFallback() {
  try {
    return localStorage.getItem(BETA_WELCOME_FALLBACK_KEY) === '1';
  } catch {
    return false;
  }
}

function persistLocalBetaWelcomeFallback() {
  try {
    localStorage.setItem(BETA_WELCOME_FALLBACK_KEY, '1');
  } catch {
    // ignore storage quota failures for non-critical fallback state
  }
}

async function enterAppShell() {
  authRecoveryInProgress = false;
  hideBetaGate();
  if (appShell) appShell.classList.remove('hidden');
  if (!hasHydratedData) {
    hasHydratedData = true;
    await hydrateDataFromServer();
  }
  if (authRecoveryInProgress) return;
  if (!appReady) {
    appReady = true;
  }
  applyInitialShareLinkState();
  renderApp();
}

function promptAuthForAction(message = 'Sign in to continue.', onSuccess = null, isError = false) {
  pendingPostAuthAction = typeof onSuccess === 'function' ? onSuccess : null;
  openAuthDialog(message, isError);
}

function runPendingPostAuthAction() {
  if (typeof pendingPostAuthAction !== 'function') {
    pendingPostAuthAction = null;
    return;
  }
  const action = pendingPostAuthAction;
  pendingPostAuthAction = null;
  try {
    action();
  } catch (error) {
    console.warn('Post-auth action failed:', error);
  }
}

function beginAuthRecovery(message = 'Session expired. Sign in again to continue.') {
  if (authRecoveryInProgress) return;
  authRecoveryInProgress = true;
  activeSessionUser = null;
  applySessionIdentity(null);
  appReady = false;
  hasHydratedData = false;
  activeBoardId = null;
  activeCategoryPath = [];
  data = { boards: [] };
  undoHistory = [];
  redoHistory = [];
  lastSavedSnapshot = serializeDataSnapshot(data);
  promptAuthForAction(message, null, true);
}

function deriveNameFromEmail(email) {
  const local = String(email || '').split('@')[0] || '';
  if (!local) return '';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .slice(0, 60);
}

function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const boards = Array.isArray(parsed?.boards) ? parsed.boards : [];
      return {
        boards: boards.map(normalizeBoard)
      };
    }

    const legacyRaw = localStorage.getItem(LEGACY_ITEMS_KEY);
    if (legacyRaw) {
      const legacyItems = normalizeItems(JSON.parse(legacyRaw));
      const migrated = {
        boards: [
          {
            id: crypto.randomUUID(),
            name: 'My Items',
            items: legacyItems
          }
        ]
      };
      return {
        boards: migrated.boards.map(normalizeBoard)
      };
    }
  } catch {
    try {
      const backupRaw = localStorage.getItem(DATA_BACKUP_KEY);
      if (backupRaw) {
        const backupParsed = JSON.parse(backupRaw);
        const backupBoards = Array.isArray(backupParsed?.boards) ? backupParsed.boards : [];
        return {
          boards: backupBoards.map(normalizeBoard)
        };
      }
    } catch {
      // fall through
    }
  }

  return { boards: [] };
}

function mergeLocalAndServerBoards(localBoards = [], serverBoards = []) {
  const merged = [];
  const seenBoardIds = new Set();

  const appendBoard = (board) => {
    const normalized = normalizeBoard(board);
    const boardId = String(normalized?.id || '').trim();
    if (!boardId || seenBoardIds.has(boardId)) return;
    seenBoardIds.add(boardId);
    merged.push(normalized);
  };

  if (Array.isArray(localBoards)) {
    for (const board of localBoards) appendBoard(board);
  }
  if (Array.isArray(serverBoards)) {
    for (const board of serverBoards) appendBoard(board);
  }

  return merged;
}

async function hydrateDataFromServer() {
  try {
    const payload = await apiRequest('/api/data');
    const serverBoards = Array.isArray(payload?.boards) ? payload.boards : [];
    const normalizedServerData = { boards: serverBoards.map(normalizeBoard) };
    const hasServerData = normalizedServerData.boards.length > 0;
    const hasLocalData = Array.isArray(data?.boards) && data.boards.length > 0;

    if (hasServerData) {
      let nextData = normalizedServerData;
      let shouldClearLocalSnapshot = true;

      if (activeSessionUser && hasLocalData) {
        const mergedData = {
          boards: mergeLocalAndServerBoards(data.boards || [], normalizedServerData.boards || [])
        };
        const mergedSnapshot = serializeDataSnapshot(mergedData);
        const serverSnapshot = serializeDataSnapshot(normalizedServerData);
        if (mergedSnapshot && mergedSnapshot !== serverSnapshot) {
          nextData = mergedData;
          const persisted = await persistSnapshotToServer(mergedSnapshot);
          if (!persisted) {
            shouldClearLocalSnapshot = false;
            console.warn('Could not persist merged local boards to server; keeping local snapshot fallback.');
          }
        }
      }

      data = nextData;
      lastSavedSnapshot = serializeDataSnapshot(data);
      undoHistory = [];
      redoHistory = [];
      applyInitialShareLinkState();
      renderApp();
      if (shouldClearLocalSnapshot) clearLegacyLocalDataKeys();
      return;
    }

    if (hasLocalData) {
      if (!activeSessionUser) return;
      const migrated = await persistSnapshotToServer(lastSavedSnapshot || serializeDataSnapshot(data));
      if (migrated) clearLegacyLocalDataKeys();
      return;
    }

    if (activeSessionUser) {
      clearLegacyLocalDataKeys();
    }
  } catch (error) {
    console.warn('Could not hydrate app data from server:', error);
  }
}

function clearLegacyLocalDataKeys() {
  try {
    localStorage.removeItem(DATA_KEY);
    localStorage.removeItem(DATA_BACKUP_KEY);
    localStorage.removeItem(LEGACY_ITEMS_KEY);
  } catch {
    // ignore local storage cleanup failures
  }
}

function normalizeBoardPreviewImages(raw = []) {
  const list = Array.isArray(raw) ? raw : [];
  const normalized = [];
  for (let index = 0; index < 3; index += 1) {
    const value = String(list[index] || '').trim();
    normalized.push(normalizeImageCandidateUrl(value));
  }
  return normalized;
}

function normalizeBoard(board) {
  const hasExplicitCategories = Array.isArray(board?.categories) && board.categories.length > 0;
  const legacyItems = normalizeItems(board?.items || []);
  const migratedCategories = normalizeCategories(board?.categories || [], hasExplicitCategories ? [] : legacyItems);
  return {
    id: board?.id || crypto.randomUUID(),
    name: String(board?.name || 'Untitled Board').trim(),
    items: hasExplicitCategories ? legacyItems : [],
    categories: migratedCategories,
    previewImages: normalizeBoardPreviewImages(board?.previewImages || []),
    fieldCategories: mergeRequiredDefaultCategories(
      normalizeBoardFieldCategories(board?.fieldCategories || []),
      board?.id
    )
  };
}

function createDefaultFieldCategories(boardId = '') {
  return DEFAULT_DATA_CATEGORIES.map((entry, index) => ({
    id: `local-${boardId || 'board'}-${entry.slug}`,
    label: entry.label,
    slug: entry.slug,
    type: entry.type,
    allowedOptions: [],
    isDefault: true,
    isDeletable: false,
    position: index,
    createdAt: '',
    updatedAt: ''
  }));
}

function normalizeBoardFieldCategories(categories) {
  const list = Array.isArray(categories) ? categories : [];
  return list.map((entry, index) => normalizeBoardFieldCategory(entry, index));
}

function normalizeBoardFieldCategory(category, fallbackPosition = 0) {
  const slug = slugifyCategoryLabel(category?.slug || category?.key || category?.label || '');
  const defaultSpec = DEFAULT_DATA_CATEGORIES.find((entry) => entry.slug === slug);
  const normalizedType = normalizeCategoryType(category?.type || defaultSpec?.type || 'text');
  return {
    id: String(category?.id || `local-${slug || crypto.randomUUID()}`),
    label: String(category?.label || defaultSpec?.label || 'Category').trim() || 'Category',
    slug,
    type: normalizedType,
    allowedOptions: normalizedAllowedOptions(category?.allowedOptions || category?.allowed_options || []),
    isDefault: Boolean(category?.isDefault || category?.is_default || defaultSpec),
    isDeletable: typeof category?.isDeletable === 'boolean'
      ? category.isDeletable
      : typeof category?.is_deletable === 'number'
        ? Boolean(category.is_deletable)
        : !defaultSpec,
    position: Number.isFinite(Number(category?.position)) ? Number(category.position) : fallbackPosition,
    createdAt: String(category?.createdAt || category?.created_at || ''),
    updatedAt: String(category?.updatedAt || category?.updated_at || '')
  };
}

function mergeRequiredDefaultCategories(categories, boardId = '') {
  const merged = Array.isArray(categories) ? [...categories] : [];
  const bySlug = new Map(merged.map((entry) => [entry.slug, entry]));
  for (const defaultCategory of DEFAULT_DATA_CATEGORIES) {
    const existing = bySlug.get(defaultCategory.slug);
    if (existing) {
      existing.type = defaultCategory.type;
      existing.isDefault = true;
      existing.isDeletable = false;
      continue;
    }
    merged.push({
      id: `local-${boardId || 'board'}-${defaultCategory.slug}`,
      label: defaultCategory.label,
      slug: defaultCategory.slug,
      type: defaultCategory.type,
      allowedOptions: [],
      isDefault: true,
      isDeletable: false,
      position: defaultCategory.defaultIndex,
      createdAt: '',
      updatedAt: ''
    });
  }
  return merged
    .sort((a, b) => {
      const aPos = Number.isFinite(Number(a.position)) ? Number(a.position) : Number.MAX_SAFE_INTEGER;
      const bPos = Number.isFinite(Number(b.position)) ? Number(b.position) : Number.MAX_SAFE_INTEGER;
      if (aPos !== bPos) return aPos - bPos;
      return String(a.createdAt || a.id || '').localeCompare(String(b.createdAt || b.id || ''));
    })
    .map((entry, index) => ({ ...entry, position: index }));
}

function normalizeCategoryType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return CATEGORY_TYPE_OPTIONS.has(normalized) ? normalized : 'text';
}

function normalizedAllowedOptions(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of value) {
    const text = String(raw || '').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function slugifyCategoryLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

function normalizeCategories(categories, fallbackItems = []) {
  const list = Array.isArray(categories) ? categories : [];
  if (list.length) return list.map(normalizeCategoryNode);
  if (Array.isArray(fallbackItems) && fallbackItems.length) {
    return [
      {
        id: crypto.randomUUID(),
        name: 'All Items',
        children: [],
        items: fallbackItems
      }
    ];
  }
  return [];
}

function normalizeCategoryNode(node) {
  const id = node?.id || crypto.randomUUID();
  return {
    id,
    name: String(node?.name || 'Untitled Category').trim(),
    children: Array.isArray(node?.children) ? node.children.map(normalizeCategoryNode) : [],
    items: normalizeItems(node?.items || []),
    fieldCategories: mergeRequiredDefaultCategories(
      normalizeBoardFieldCategories(node?.fieldCategories || []),
      id
    )
  };
}

function normalizeItems(items) {
  const list = Array.isArray(items) ? items : [];
  return list.map((item) => ({
    ...(() => {
      const url = String(item?.url || '');
      const rawName = String(item?.name || 'Untitled item');
      const name = normalizeItemName(rawName, url);
      const highlights = normalizeHighlights(item?.highlights || item?.notes || []);
      const normalizedImages = normalizeImages(item?.images || item?.image || '');
      const featuredImage = String(item?.image || normalizedImages[0] || '').trim();
      const pinnedImages = pinPrimaryImage([featuredImage, ...normalizedImages], featuredImage || normalizedImages[0] || '');
      const overview = buildOverviewModel(item, 500);
      return {
        id: item?.id || crypto.randomUUID(),
        url,
        brand: String(item?.brand || inferBrandFromDescription(name)),
        name,
        image: pinnedImages[0] || '',
        images: pinnedImages,
        seller: String(item?.seller || ''),
        price: formatPrice(item?.price || ''),
        favoriteRank: normalizeFavoriteRank(
          item?.favoriteRank ||
          item?.favorite ||
          item?.rank ||
          (item?.chosen || item?.isChosen || item?.selected ? 'gold' : '')
        ),
        highlights: highlights.length ? highlights : buildLocalHighlights(name, url),
        description: String(item?.description || '').trim(),
        dimensions: normalizeDetailList(item?.dimensions || []),
        materials: normalizeDetailList(item?.materials || []),
        specs: normalizeDetailList(item?.specs || []),
        overview: overview.text,
        overviewBullets: overview.bullets,
        detailSections: normalizeDetailSections(item?.detailSections || []),
        customFieldValues: normalizeCustomFieldValues(item?.customFieldValues || item?.custom_fields || {}),
        feedbacks: normalizeFeedbacks(item?.feedbacks || []),
        comments: normalizeComments(item?.comments || [])
      };
    })()
  }));
}

function normalizeCustomFieldValues(value) {
  if (!value || typeof value !== 'object') return {};
  const out = {};
  for (const [categoryId, entry] of Object.entries(value)) {
    if (!categoryId || !entry || typeof entry !== 'object') continue;
    if (!('value' in entry)) continue;
    out[categoryId] = {
      value: entry.value,
      source: entry.source === 'scraped' ? 'scraped' : 'user',
      confidence: entry.source === 'scraped' && Number.isFinite(Number(entry.confidence))
        ? Math.max(0, Math.min(1, Number(entry.confidence)))
        : null,
      lastUpdatedAt: String(entry.lastUpdatedAt || entry.last_updated_at || new Date().toISOString())
    };
  }
  return out;
}

function normalizeFavoriteRank(value) {
  const rank = String(value || '').trim().toLowerCase();
  if (rank === 'gold' || rank === 'silver' || rank === 'bronze') return rank;
  return '';
}

function getItemFavoriteRank(item) {
  if (!item) return '';
  const normalized = normalizeFavoriteRank(item.favoriteRank)
    || (item?.chosen || item?.isChosen || item?.selected ? 'gold' : '');
  if (item.favoriteRank !== normalized) item.favoriteRank = normalized;
  return normalized;
}

function applyFavoriteRankClass(element, item) {
  if (!element) return;
  element.classList.remove('is-favorite-gold', 'is-favorite-silver', 'is-favorite-bronze');
  const rank = getItemFavoriteRank(item);
  if (rank) element.classList.add(`is-favorite-${rank}`);
}

function setItemFavoriteRank(itemId, rank = '') {
  const board = getActiveBoard();
  if (!board || !itemId) return;
  const item = findItemInBoard(board, itemId);
  if (!item) return;
  const normalized = normalizeFavoriteRank(rank);
  item.favoriteRank = normalized;
  item.chosen = normalized === 'gold';
  saveData();
  renderBoardDetail();
  if (activeDetailItemId === item.id && detailDialog?.open) {
    renderDetailModal(item);
  }
}

function closeRankMenu() {
  if (!rankMenu) return;
  rankMenu.classList.add('hidden');
  rankMenu.setAttribute('aria-hidden', 'true');
  rankMenu.innerHTML = '';
  rankMenuItemId = null;
  rankMenuTrigger = null;
}

function closeBoardMenu() {
  if (!activeBoardMenu) return;
  activeBoardMenu.hidden = true;
  if (activeBoardMenuToggle) {
    activeBoardMenuToggle.setAttribute('aria-expanded', 'false');
  }
  activeBoardMenu = null;
  activeBoardMenuToggle = null;
}

function positionRankMenu(anchorEl) {
  if (!anchorEl || !rankMenu) return;
  const anchorRect = anchorEl.getBoundingClientRect();
  const menuRect = rankMenu.getBoundingClientRect();
  const gap = 8;
  let left = anchorRect.left;
  let top = anchorRect.bottom + gap;
  if (left + menuRect.width > window.innerWidth - gap) {
    left = Math.max(gap, window.innerWidth - menuRect.width - gap);
  }
  if (top + menuRect.height > window.innerHeight - gap) {
    top = anchorRect.top - menuRect.height - gap;
  }
  if (top < gap) top = gap;
  rankMenu.style.left = `${Math.round(left)}px`;
  rankMenu.style.top = `${Math.round(top)}px`;
}

function openRankMenu(itemId, triggerBtn) {
  const board = getActiveBoard();
  if (!board || !itemId || !triggerBtn || !rankMenu) return;
  const item = findItemInBoard(board, itemId);
  if (!item) return;

  const activeRank = getItemFavoriteRank(item);
  if (rankMenuItemId === itemId && rankMenuTrigger === triggerBtn && !rankMenu.classList.contains('hidden')) {
    closeRankMenu();
    return;
  }

  rankMenu.innerHTML = '';
  rankMenu.setAttribute('role', 'menu');
  for (const option of FAVORITE_RANK_OPTIONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `rank-dropdown-option${activeRank === option.rank ? ' active' : ''}`;
    btn.dataset.rank = option.rank;
    btn.setAttribute('role', 'menuitem');
    btn.innerHTML = `<span class="rank-dropdown-emoji">${option.emoji}</span><span>${escapeHtml(option.label.replace(' favorite', ''))}</span>`;
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const selectedRank = normalizeFavoriteRank(option.rank);
      const nextRank = selectedRank === activeRank ? '' : selectedRank;
      setItemFavoriteRank(itemId, nextRank);
      closeRankMenu();
    });
    rankMenu.appendChild(btn);
  }

  rankMenuItemId = itemId;
  rankMenuTrigger = triggerBtn;
  rankMenu.classList.remove('hidden');
  rankMenu.setAttribute('aria-hidden', 'false');
  positionRankMenu(triggerBtn);
}

function serializeDataSnapshot(snapshotData = data) {
  try {
    return JSON.stringify(snapshotData || { boards: [] });
  } catch {
    return '';
  }
}

function parseDataSnapshot(serialized) {
  try {
    const parsed = JSON.parse(serialized);
    const boards = Array.isArray(parsed?.boards) ? parsed.boards : [];
    return {
      boards: boards.map(normalizeBoard)
    };
  } catch {
    return null;
  }
}

function pushHistorySnapshot(stack, serialized) {
  if (!Array.isArray(stack) || !serialized) return;
  if (stack[stack.length - 1] === serialized) return;
  stack.push(serialized);
  if (stack.length > UNDO_HISTORY_LIMIT) stack.shift();
}

function restoreDataSnapshot(serialized) {
  const restored = parseDataSnapshot(serialized);
  if (!restored) return false;
  data = restored;
  if (activeBoardId && !data.boards.some((board) => board.id === activeBoardId)) {
    activeBoardId = null;
    activeCategoryPath = [];
  }
  if (activeBoardId) {
    const activeBoard = getActiveBoard();
    if (activeBoard && activeCategoryPath.length && !getCategoryNodeByPath(activeBoard, activeCategoryPath)) {
      activeCategoryPath = [];
    }
  }
  saveData({ recordHistory: false });
  renderApp();
  return true;
}

function undoLastChange() {
  if (!undoHistory.length) {
    setStatus('Nothing to undo.');
    return;
  }
  const previousSnapshot = undoHistory.pop();
  const currentSnapshot = serializeDataSnapshot(data);
  if (currentSnapshot) pushHistorySnapshot(redoHistory, currentSnapshot);
  const restored = restoreDataSnapshot(previousSnapshot);
  if (!restored) {
    if (currentSnapshot && redoHistory[redoHistory.length - 1] === currentSnapshot) redoHistory.pop();
    setStatus('Could not undo the last change.', true);
    return;
  }
  setStatus('Undid last change.');
}

function redoLastChange() {
  if (!redoHistory.length) {
    setStatus('Nothing to redo.');
    return;
  }
  const nextSnapshot = redoHistory.pop();
  const currentSnapshot = serializeDataSnapshot(data);
  if (currentSnapshot) pushHistorySnapshot(undoHistory, currentSnapshot);
  const restored = restoreDataSnapshot(nextSnapshot);
  if (!restored) {
    if (currentSnapshot && undoHistory[undoHistory.length - 1] === currentSnapshot) undoHistory.pop();
    setStatus('Could not redo the last change.', true);
    return;
  }
  setStatus('Redid last change.');
}

function isNativeInputTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.matches('input,textarea,select')) return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable=""],[contenteditable="true"],[contenteditable="plaintext-only"]'));
}

function isUndoShortcut(event) {
  if (!event || event.altKey) return false;
  if (!event.metaKey && !event.ctrlKey) return false;
  return String(event.key || '').toLowerCase() === 'z' && !event.shiftKey;
}

function isRedoShortcut(event) {
  if (!event || event.altKey) return false;
  if (!event.metaKey && !event.ctrlKey) return false;
  const key = String(event.key || '').toLowerCase();
  return (key === 'z' && event.shiftKey) || key === 'y';
}

function saveData(options = {}) {
  const recordHistory = options.recordHistory !== false;
  const serialized = serializeDataSnapshot(data);
  if (!serialized) return;
  if (serialized === lastSavedSnapshot) return;
  if (recordHistory && lastSavedSnapshot) {
    pushHistorySnapshot(undoHistory, lastSavedSnapshot);
    redoHistory = [];
  }
  lastSavedSnapshot = serialized;
  if (!activeSessionUser) {
    persistSnapshotToLocal(serialized);
    return true;
  }
  queueSnapshotPersist(serialized);
  return true;
}

function persistSnapshotToLocal(serialized) {
  const payload = String(serialized || '').trim();
  if (!payload) return;
  try {
    localStorage.setItem(DATA_KEY, payload);
    localStorage.setItem(DATA_BACKUP_KEY, payload);
  } catch {
    // ignore storage write failures for guest-mode persistence
  }
}

function queueSnapshotPersist(serialized) {
  pendingServerSnapshot = String(serialized || '').trim();
  if (!pendingServerSnapshot || serverSnapshotPersistInFlight) return;
  serverSnapshotPersistInFlight = true;
  void flushSnapshotPersistQueue();
}

async function flushSnapshotPersistQueue() {
  while (pendingServerSnapshot) {
    const nextSerialized = pendingServerSnapshot;
    pendingServerSnapshot = '';
    const persisted = await persistSnapshotToServer(nextSerialized);
    if (!persisted) {
      // Keep the latest snapshot queued; we'll retry on next save.
      pendingServerSnapshot = nextSerialized;
      break;
    }
  }
  serverSnapshotPersistInFlight = false;
}

async function persistSnapshotToServer(serialized) {
  const payload = String(serialized || '').trim();
  if (!payload) return true;
  if (!activeSessionUser) return false;
  try {
    const response = await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    if (!response.ok) {
      let message = '';
      try {
        const parsed = await response.json();
        message = String(parsed?.error || '');
      } catch {
        // ignore parse errors
      }
      if (response.status === 401) {
        beginAuthRecovery('Session expired. Sign in again to save your boards.');
      }
      throw new Error(message || `Request failed (${response.status})`);
    }
    return true;
  } catch (error) {
    console.warn('Could not persist app snapshot to server:', error);
    return false;
  }
}

function ensureFieldCategoriesForOwner(owner, ownerId = '') {
  if (!owner) return createDefaultFieldCategories(String(ownerId || '').trim());
  const normalized = mergeRequiredDefaultCategories(
    normalizeBoardFieldCategories(owner.fieldCategories || []),
    String(ownerId || owner.id || '').trim()
  );
  owner.fieldCategories = normalized;
  return normalized;
}

function getBoardFieldCategories(board) {
  if (!board) return createDefaultFieldCategories('');
  return ensureFieldCategoriesForOwner(board, board.id);
}

function getFieldCategoryOwner(board, scopeCategoryId = '') {
  if (!board) return null;
  const scopedId = String(scopeCategoryId || '').trim();
  if (!scopedId) return board;
  return getCategoryNodeById(board, scopedId);
}

function getFieldContextCategoryId(board, options = {}) {
  const scopedId = String(options?.scopeCategoryId || '').trim();
  if (scopedId) return scopedId;
  const categoryNode = options?.categoryNode || null;
  if (categoryNode?.id) return String(categoryNode.id);
  if (options?.useActive === false) return '';
  const activeNode = getActiveCategoryNode(board);
  return String(activeNode?.id || '');
}

function getFieldCategoriesForScope(board, scopeCategoryId = '') {
  if (!board) return createDefaultFieldCategories('');
  const owner = getFieldCategoryOwner(board, scopeCategoryId);
  if (!owner) return getBoardFieldCategories(board);
  if (owner === board) return getBoardFieldCategories(board);
  return ensureFieldCategoriesForOwner(owner, owner.id);
}

function getCustomFieldCategories(board, options = {}) {
  const scopeCategoryId = getFieldContextCategoryId(board, {
    scopeCategoryId: options?.scopeCategoryId,
    categoryNode: options?.categoryNode || null,
    useActive: options?.useActive === true
  });
  return getFieldCategoriesForScope(board, scopeCategoryId).filter((entry) => !entry.isDefault);
}

function getBoardCustomValueMap(board, itemId) {
  const item = findItemInBoard(board, itemId);
  if (!item) return {};
  if (!item.customFieldValues || typeof item.customFieldValues !== 'object') {
    item.customFieldValues = {};
  }
  return item.customFieldValues;
}

function setItemCustomFieldValue(item, category, rawValue, options = {}) {
  if (!item || !category) return;
  if (!item.customFieldValues || typeof item.customFieldValues !== 'object') {
    item.customFieldValues = {};
  }
  const parsed = parseCustomFieldInput(category, rawValue);
  if (!parsed.valid) {
    setStatus(parsed.error || 'Invalid value.', true);
    return;
  }
  if (parsed.value === null || parsed.value === '') {
    delete item.customFieldValues[category.id];
    return;
  }
  item.customFieldValues[category.id] = {
    value: parsed.value,
    source: options.source === 'scraped' ? 'scraped' : 'user',
    confidence: options.source === 'scraped' && Number.isFinite(Number(options.confidence))
      ? Math.max(0, Math.min(1, Number(options.confidence)))
      : null,
    lastUpdatedAt: String(options.lastUpdatedAt || new Date().toISOString())
  };
}

function parseCustomFieldInput(category, rawValue) {
  const value = rawValue == null ? '' : rawValue;
  const type = normalizeCategoryType(category?.type);
  if (type === 'number') {
    if (value === '') return { valid: true, value: null };
    const parsed = Number(String(value).replace(/,/g, '').trim());
    if (!Number.isFinite(parsed)) return { valid: false, error: 'Enter a valid number.' };
    return { valid: true, value: parsed };
  }
  if (type === 'boolean') {
    if (value === '' || value == null) return { valid: true, value: null };
    if (typeof value === 'boolean') return { valid: true, value };
    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'true' || normalized === 'yes') return { valid: true, value: true };
    if (normalized === 'false' || normalized === 'no') return { valid: true, value: false };
    return { valid: false, error: 'Use Yes or No.' };
  }
  if (type === 'select') {
    const selected = String(value || '').trim();
    if (!selected) return { valid: true, value: null };
    const options = normalizedAllowedOptions(category?.allowedOptions || []);
    if (options.length && !options.some((entry) => entry.toLowerCase() === selected.toLowerCase())) {
      return { valid: false, error: 'Choose one of the allowed options.' };
    }
    const matching = options.find((entry) => entry.toLowerCase() === selected.toLowerCase());
    return { valid: true, value: matching || selected };
  }
  const text = String(value || '').trim();
  return { valid: true, value: text || null };
}

function formatCustomFieldValue(category, entry) {
  if (!entry || !('value' in entry)) return '';
  const value = entry.value;
  const type = normalizeCategoryType(category?.type);
  if (value == null || value === '') return '';
  if (type === 'boolean') return value ? 'Yes' : 'No';
  if (type === 'number') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? String(numeric) : '';
  }
  return String(value);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, options);
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (!response.ok) {
    if (response.status === 401) {
      if (activeSessionUser) {
        beginAuthRecovery('Your session ended. Sign in to keep using ShopBoard.');
      } else {
        promptAuthForAction('Sign in to use this feature.');
      }
    }
    throw new Error(String(payload?.error || `Request failed (${response.status})`));
  }
  return payload;
}

function collectAllItemIds(board) {
  return getAllBoardItems(board).map((item) => item.id).filter(Boolean);
}

async function loadBoardCategoryData(boardId, options = {}) {
  const board = data.boards.find((entry) => entry.id === boardId);
  if (!board) return;
  if (!activeSessionUser) {
    if (!board.categorySchemaLoadedAt) {
      board.categorySchemaLoadedAt = Date.now();
    }
    return;
  }
  if (boardCategoryLoadPromises.has(boardId)) {
    return boardCategoryLoadPromises.get(boardId);
  }
  if (!options.force && board.categorySchemaLoadedAt) return;

  const task = (async () => {
    try {
      const categoriesPayload = await apiRequest(`/api/boards/${encodeURIComponent(boardId)}/categories`);
      const categories = mergeRequiredDefaultCategories(
        normalizeBoardFieldCategories(categoriesPayload?.categories || []),
        board.id
      );
      board.fieldCategories = categories;
      const valuesPayload = await apiRequest(`/api/boards/${encodeURIComponent(boardId)}/items/custom-values`);
      applyBoardCustomValues(board, valuesPayload?.values || []);
      board.categorySchemaLoadedAt = Date.now();
      saveData();
      if (activeBoardId === boardId) renderBoardDetail();
    } catch (error) {
      if (!Array.isArray(board.fieldCategories) || !board.fieldCategories.length) {
        board.fieldCategories = createDefaultFieldCategories(board.id);
      }
      setStatus(error instanceof Error ? error.message : 'Could not load categories.', true);
    } finally {
      boardCategoryLoadPromises.delete(boardId);
    }
  })();

  boardCategoryLoadPromises.set(boardId, task);
  return task;
}

function applyBoardCustomValues(board, values) {
  if (!board) return;
  const items = getAllBoardItems(board);
  const byItem = new Map(items.map((item) => [item.id, item]));
  for (const item of items) {
    item.customFieldValues = {};
  }
  const list = Array.isArray(values) ? values : [];
  for (const entry of list) {
    const itemId = String(entry?.itemId || entry?.item_id || '');
    const categoryId = String(entry?.categoryId || entry?.category_id || '');
    if (!itemId || !categoryId) continue;
    const item = byItem.get(itemId);
    if (!item) continue;
    const map = getBoardCustomValueMap(board, itemId);
    map[categoryId] = {
      value: entry.value,
      source: entry.source === 'scraped' ? 'scraped' : 'user',
      confidence: Number.isFinite(Number(entry.confidence)) ? Number(entry.confidence) : null,
      lastUpdatedAt: String(entry.lastUpdatedAt || entry.last_updated_at || new Date().toISOString())
    };
  }
}

function getSyncableBoardFieldIds(boardId) {
  const board = data.boards.find((entry) => entry.id === boardId);
  if (!board) return new Set();
  return new Set(getBoardFieldCategories(board).map((entry) => String(entry.id || '').trim()).filter(Boolean));
}

function queueSyncAllCustomValues(boardId, itemId, valuesMap) {
  if (!boardId || !itemId || !valuesMap || typeof valuesMap !== 'object') return;
  const syncableIds = getSyncableBoardFieldIds(boardId);
  if (!syncableIds.size) return;
  const payload = {};
  for (const [categoryId, entry] of Object.entries(valuesMap)) {
    if (!syncableIds.has(String(categoryId || '').trim())) continue;
    if (!entry || typeof entry !== 'object') continue;
    payload[categoryId] = {
      value: entry.value,
      source: entry.source === 'scraped' ? 'scraped' : 'user',
      confidence: entry.source === 'scraped' ? entry.confidence : null
    };
  }
  if (!Object.keys(payload).length) return;
  syncItemCustomValues(boardId, itemId, payload).catch((error) => {
    setStatus(error instanceof Error ? error.message : 'Could not sync custom values.', true);
  });
}

function queueSyncCustomValue(boardId, itemId, categoryId, entry) {
  if (!boardId || !itemId || !categoryId) return;
  const syncableIds = getSyncableBoardFieldIds(boardId);
  if (!syncableIds.has(String(categoryId || '').trim())) return;
  const key = `${boardId}:${itemId}`;
  const pending = customValueSyncQueue.get(key) || {};
  pending[categoryId] = {
    value: entry?.value ?? null,
    source: entry?.source === 'scraped' ? 'scraped' : 'user',
    confidence: entry?.source === 'scraped' ? entry?.confidence ?? null : null
  };
  customValueSyncQueue.set(key, pending);
  queueMicrotask(async () => {
    const current = customValueSyncQueue.get(key);
    if (!current) return;
    customValueSyncQueue.delete(key);
    try {
      await syncItemCustomValues(boardId, itemId, current);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save custom value.', true);
    }
  });
}

async function syncItemCustomValues(boardId, itemId, values) {
  const payload = await apiRequest(`/api/boards/${encodeURIComponent(boardId)}/items/${encodeURIComponent(itemId)}/custom-values`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });
  const board = data.boards.find((entry) => entry.id === boardId);
  if (!board) return payload;
  const item = findItemInBoard(board, itemId);
  if (!item) return payload;
  if (!item.customFieldValues || typeof item.customFieldValues !== 'object') item.customFieldValues = {};
  const returned = Array.isArray(payload?.values) ? payload.values : [];
  for (const next of returned) {
    const categoryId = String(next?.categoryId || next?.category_id || '');
    if (!categoryId) continue;
    if (next.value == null || next.value === '') {
      delete item.customFieldValues[categoryId];
      continue;
    }
    item.customFieldValues[categoryId] = {
      value: next.value,
      source: next.source === 'scraped' ? 'scraped' : 'user',
      confidence: Number.isFinite(Number(next.confidence)) ? Number(next.confidence) : null,
      lastUpdatedAt: String(next.lastUpdatedAt || next.last_updated_at || new Date().toISOString())
    };
  }
  saveData();
  return payload;
}

function getActiveBoard() {
  return data.boards.find((board) => board.id === activeBoardId) || null;
}

function getCategoryNodeByPath(board, pathIds = []) {
  let nodes = Array.isArray(board?.categories) ? board.categories : [];
  let current = null;
  for (const id of pathIds) {
    current = nodes.find((node) => node.id === id) || null;
    if (!current) return null;
    nodes = Array.isArray(current.children) ? current.children : [];
  }
  return current;
}

function getActiveCategoryNode(board) {
  if (!board) return null;
  if (!activeCategoryPath.length) return null;
  return getCategoryNodeByPath(board, activeCategoryPath);
}

function getEffectiveLeafProxy(node) {
  if (!node) return null;
  const nodeItems = Array.isArray(node.items) ? node.items : [];
  const children = Array.isArray(node.children) ? node.children : [];
  if (nodeItems.length) return null;
  if (children.length !== 1) return null;
  const only = children[0];
  if (!only || !/^all items$/i.test(String(only.name || '').trim())) return null;
  return only;
}

function getCurrentCategoryChildren(board) {
  const node = getActiveCategoryNode(board);
  if (node) {
    const proxy = getEffectiveLeafProxy(node);
    if (proxy) return [];
    return Array.isArray(node.children) ? node.children : [];
  }
  return Array.isArray(board?.categories) ? board.categories : [];
}

function getCurrentItems(board) {
  const node = getActiveCategoryNode(board);
  if (node) {
    const proxy = getEffectiveLeafProxy(node);
    if (proxy) return Array.isArray(proxy.items) ? proxy.items : [];
    return Array.isArray(node.items) ? node.items : [];
  }
  const hasCategories = Array.isArray(board?.categories) && board.categories.length > 0;
  if (hasCategories) return [];
  return Array.isArray(board?.items) ? board.items : [];
}

function getCurrentCategoryCollection(board) {
  const node = getActiveCategoryNode(board);
  if (node) return Array.isArray(node.children) ? node.children : [];
  return Array.isArray(board?.categories) ? board.categories : [];
}

function encodeCategoryPath(pathIds) {
  return Array.isArray(pathIds) ? pathIds.join('>') : '';
}

function decodeCategoryPath(value) {
  const raw = String(value || '').trim();
  if (!raw) return [];
  return raw.split('>').filter(Boolean);
}

function getCategoryItemCollectionByPath(board, pathIds) {
  if (!board || !Array.isArray(pathIds) || !pathIds.length) return null;
  const node = getCategoryNodeByPath(board, pathIds);
  if (!node) return null;
  const proxy = getEffectiveLeafProxy(node);
  if (proxy) return Array.isArray(proxy.items) ? proxy.items : null;
  return Array.isArray(node.items) ? node.items : null;
}

function getCategoryPathLabel(board, pathIds) {
  if (!board || !Array.isArray(pathIds) || !pathIds.length) return '';
  const names = [];
  let nodes = Array.isArray(board.categories) ? board.categories : [];
  for (const id of pathIds) {
    const node = nodes.find((entry) => entry.id === id);
    if (!node) break;
    names.push(node.name || 'Untitled');
    nodes = Array.isArray(node.children) ? node.children : [];
  }
  return names.join(' / ');
}

function collectLeafCategoryTargets(board) {
  const out = [];
  const roots = Array.isArray(board?.categories) ? board.categories : [];

  function visit(node, pathIds, pathNames) {
    if (!node) return;
    const nextIds = [...pathIds, node.id];
    const nextNames = [...pathNames, node.name || 'Untitled'];
    const proxy = getEffectiveLeafProxy(node);
    if (proxy) {
      out.push({
        pathIds: nextIds,
        pathNames: nextNames,
        pathLabel: nextNames.join(' / '),
        collection: Array.isArray(proxy.items) ? proxy.items : []
      });
      return;
    }
    const children = Array.isArray(node.children) ? node.children : [];
    if (!children.length) {
      out.push({
        pathIds: nextIds,
        pathNames: nextNames,
        pathLabel: nextNames.join(' / '),
        collection: Array.isArray(node.items) ? node.items : []
      });
      return;
    }
    for (const child of children) {
      visit(child, nextIds, nextNames);
    }
  }

  for (const root of roots) visit(root, [], []);
  return out;
}

function collectCategoryOptionTargets(board) {
  const out = [];
  const roots = Array.isArray(board?.categories) ? board.categories : [];

  function visit(node, pathIds, depth) {
    if (!node) return;
    const nextIds = [...pathIds, node.id];
    out.push({
      pathIds: nextIds,
      label: node.name || 'Untitled',
      depth
    });
    const children = Array.isArray(node.children) ? node.children : [];
    for (const child of children) visit(child, nextIds, depth + 1);
  }

  for (const root of roots) visit(root, [], 0);
  return out;
}

function tokenizeCategoryText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function expandCategoryKeywords(tokens) {
  const map = {
    bathroom: ['shower', 'bath', 'bathtub', 'toilet', 'vanity', 'sink', 'faucet', 'mirror', 'towel', 'curtain'],
    patio: ['outdoor', 'garden', 'deck', 'porch', 'pool'],
    table: ['dining', 'desk', 'coffee', 'side', 'endtable'],
    kitchen: ['oven', 'stove', 'range', 'refrigerator', 'fridge', 'dishwasher', 'microwave'],
    lighting: ['light', 'lamp', 'chandelier', 'sconce', 'flush', 'ceiling'],
    rug: ['carpet', 'runner', 'mat'],
    couch: ['sofa', 'sectional', 'loveseat']
  };
  const set = new Set(tokens);
  for (const token of tokens) {
    const extras = map[token];
    if (!extras) continue;
    for (const extra of extras) set.add(extra);
  }
  return set;
}

function chooseBestLeafTarget(board, seedText = '') {
  const targets = collectLeafCategoryTargets(board);
  if (!targets.length) return null;

  const text = String(seedText || '').toLowerCase();
  const seedTokens = new Set(tokenizeCategoryText(text));
  const seedType = detectLocalItemType(text);
  const isIndoor = /\bindoor\b/i.test(text);
  const isOutdoor = /\boutdoor\b|\bpatio\b|\bdeck\b|\bporch\b|\bgarden\b|\byard\b|\bpool\b/i.test(text);

  const roomRules = [
    { key: 'bathroom', rx: /\bbath(room)?\b|\bshower\b|\btoilet\b|\bvanity\b|\bsink\b|\bfaucet\b/ },
    { key: 'living', rx: /\bliving\b|\bsofa\b|\bcouch\b|\bsectional\b|\bcoffee table\b|\bmedia\b/ },
    { key: 'bedroom', rx: /\bbed(room)?\b|\bnightstand\b|\bdresser\b|\bbed\b|\bmattress\b/ },
    { key: 'kitchen', rx: /\bkitchen\b|\boven\b|\brange\b|\bfridge\b|\brefrigerator\b|\bdishwasher\b|\bmicrowave\b/ },
    { key: 'dining', rx: /\bdining\b|\btable\b|\bchair\b|\bbar stool\b/ },
    { key: 'office', rx: /\boffice\b|\bdesk\b|\bergonomic\b|\btask chair\b/ },
    { key: 'deck', rx: /\bdeck\b|\bpatio\b|\bporch\b|\boutdoor\b/ }
  ];
  const seedRooms = new Set(roomRules.filter((rule) => rule.rx.test(text)).map((rule) => rule.key));

  function getTargetSignals(target) {
    const pathText = String(target.pathLabel || '').toLowerCase();
    const pathTokens = tokenizeCategoryText(pathText);
    const keywordSet = expandCategoryKeywords(pathTokens);
    const targetType = detectLocalItemType(pathText);
    const targetIndoor = /\bindoor\b|\bliving\b|\bbed(room)?\b|\bbath(room)?\b|\bkitchen\b|\boffice\b/i.test(pathText);
    const targetOutdoor = /\boutdoor\b|\bpatio\b|\bdeck\b|\bporch\b|\bgarden\b|\byard\b|\bpool\b/i.test(pathText);
    const targetRooms = new Set(roomRules.filter((rule) => rule.rx.test(pathText)).map((rule) => rule.key));
    return { pathTokens, keywordSet, targetType, targetIndoor, targetOutdoor, targetRooms };
  }

  function getCollectionDominantType(collection) {
    const counts = new Map();
    for (const item of Array.isArray(collection) ? collection : []) {
      const t = detectLocalItemType(`${item?.name || ''} ${(item?.highlights || []).join(' ')}`);
      if (!t) continue;
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    let bestType = '';
    let bestCount = 0;
    for (const [t, n] of counts.entries()) {
      if (n > bestCount) {
        bestCount = n;
        bestType = t;
      }
    }
    return bestType;
  }

  let best = targets[0] || null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const target of targets) {
    const { pathTokens, keywordSet, targetType, targetIndoor, targetOutdoor, targetRooms } = getTargetSignals(target);
    let score = Math.max(0, (target.pathIds?.length || 0) - 1) * 4;
    for (const key of keywordSet) {
      if (!key) continue;
      if (seedTokens.has(key)) {
        score += pathTokens.includes(key) ? 12 : 5;
        continue;
      }
      const pattern = new RegExp(`\\b${escapeRegExp(key)}\\b`, 'i');
      if (pattern.test(text)) score += pathTokens.includes(key) ? 5 : 2;
    }

    if (seedType && targetType) {
      score += seedType === targetType ? 18 : -10;
    } else if (seedType && pathTokens.includes(seedType.toLowerCase())) {
      score += 12;
    }

    const dominantType = getCollectionDominantType(target.collection);
    if (seedType && dominantType) {
      score += seedType === dominantType ? 9 : -7;
    }

    if (isOutdoor) {
      if (targetOutdoor) score += 14;
      if (targetIndoor) score -= 16;
    }
    if (isIndoor) {
      if (targetIndoor) score += 10;
      if (targetOutdoor) score -= 18;
    }

    if (seedRooms.size) {
      let roomHit = 0;
      for (const room of seedRooms) {
        if (targetRooms.has(room)) roomHit += 1;
      }
      if (roomHit > 0) {
        score += roomHit * 16;
      } else {
        score -= 8;
      }
    }

    const hasStrongDirectMatch = pathTokens.some((token) => token && seedTokens.has(token));
    if (!hasStrongDirectMatch && (target.pathIds?.length || 0) <= 1) score -= 4;

    if (score > bestScore) {
      bestScore = score;
      best = target;
    }
  }

  if (bestScore <= 0) {
    const byDepth = [...targets].sort((a, b) => {
      const depthA = Array.isArray(a.pathIds) ? a.pathIds.length : 0;
      const depthB = Array.isArray(b.pathIds) ? b.pathIds.length : 0;
      if (depthB !== depthA) return depthB - depthA;
      const lenA = Array.isArray(a.collection) ? a.collection.length : 0;
      const lenB = Array.isArray(b.collection) ? b.collection.length : 0;
      return lenA - lenB;
    });
    return byDepth[0] || best;
  }
  return best;
}

function getTargetCollectionForAdd(board, payload, rawUrl, selectedCategoryValue = '') {
  const manualValue = String(selectedCategoryValue || addCategoryTargetValue || '').trim();
  const explicitPath = manualValue && manualValue !== '__auto__' && manualValue !== '__placeholder__'
    ? decodeCategoryPath(manualValue)
    : [];
  if (explicitPath.length) {
    const explicitCollection = getCategoryItemCollectionByPath(board, explicitPath);
    if (explicitCollection) return { collection: explicitCollection, pathLabel: getCategoryPathLabel(board, explicitPath), auto: false };
  }

  const seedParts = [
    payload?.name || '',
    payload?.description || '',
    payload?.seller || '',
    ...(Array.isArray(payload?.highlights) ? payload.highlights : []),
    rawUrl || ''
  ];
  const seed = seedParts.join(' ').trim();
  const autoTarget = chooseBestLeafTarget(board, seed);
  if (autoTarget?.collection) {
    return { collection: autoTarget.collection, pathLabel: autoTarget.pathLabel, auto: true };
  }

  const activePathCollection = getCategoryItemCollectionByPath(board, activeCategoryPath);
  if (activePathCollection) return { collection: activePathCollection, pathLabel: getCategoryPathLabel(board, activeCategoryPath), auto: false };
  if (!Array.isArray(board.items)) board.items = [];
  return { collection: board.items, pathLabel: '', auto: false };
}

function getActiveItemCollection(board) {
  const items = getCurrentItems(board);
  return Array.isArray(items) ? items : [];
}

function findItemInActiveCollection(board, itemId) {
  return getActiveItemCollection(board).find((entry) => entry.id === itemId) || null;
}

function findItemInBoard(board, itemId) {
  if (!board || itemId == null) return null;
  const rootItems = Array.isArray(board.items) ? board.items : [];
  const rootMatch = rootItems.find((entry) => entry.id === itemId);
  if (rootMatch) return rootMatch;

  const stack = Array.isArray(board.categories) ? [...board.categories] : [];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    const nodeItems = Array.isArray(node.items) ? node.items : [];
    const found = nodeItems.find((entry) => entry.id === itemId);
    if (found) return found;
    if (Array.isArray(node.children) && node.children.length) {
      stack.push(...node.children);
    }
  }
  return null;
}

function isLeafCategoryContext(board) {
  return getCurrentCategoryChildren(board).length === 0;
}

function collectAllItemsFromCategory(node) {
  if (!node) return [];
  const own = Array.isArray(node.items) ? node.items : [];
  const children = Array.isArray(node.children) ? node.children : [];
  return [...own, ...children.flatMap(collectAllItemsFromCategory)];
}

function isAllItemsProxyCategory(node) {
  return /^all items$/i.test(String(node?.name || '').trim());
}

function getVisibleSubcategories(categoryNode) {
  const children = Array.isArray(categoryNode?.children) ? categoryNode.children : [];
  return children.filter((child) => !isAllItemsProxyCategory(child));
}

function getCategoryGalleryPreviewImages(categoryNode, limit = 3) {
  const picks = [];
  const seen = new Set();
  const addImage = (src) => {
    const normalized = String(src || '').trim();
    if (!normalized || seen.has(normalized)) return;
    picks.push(normalized);
    seen.add(normalized);
  };

  const subcategories = getVisibleSubcategories(categoryNode);
  for (const sub of subcategories) {
    if (picks.length >= limit) break;
    const firstSubImage = collectAllItemsFromCategory(sub)
      .map((item) => getItemPrimaryImage(item))
      .find(Boolean);
    addImage(firstSubImage);
  }

  if (picks.length >= limit) return picks;

  const fallbackItems = collectAllItemsFromCategory(categoryNode);
  for (const item of fallbackItems) {
    if (picks.length >= limit) break;
    addImage(getItemPrimaryImage(item));
  }
  return picks;
}

function createCategoryGalleryImageSlot(src, slotClass) {
  const slot = document.createElement('div');
  slot.className = `category-gallery-image-slot ${slotClass}`;
  if (src) {
    const image = document.createElement('img');
    image.className = 'category-gallery-image';
    image.src = src;
    image.alt = '';
    image.loading = 'lazy';
    slot.appendChild(image);
    return slot;
  }
  const empty = document.createElement('span');
  empty.className = 'category-gallery-image-empty';
  empty.textContent = 'No image';
  slot.appendChild(empty);
  return slot;
}

function openCategoryFromGallery(categoryId) {
  const board = getActiveBoard();
  if (!board) return;
  const rootCategories = Array.isArray(board.categories) ? board.categories : [];
  const selected = rootCategories.find((entry) => entry?.id === categoryId);
  if (!selected) return;

  activeCategoryPath = [];
  activeImageRootCategoryId = selected.id;
  expandedCategoryIds.clear();
  expandedCategoryIds.add(selected.id);
  const firstSubcategory = getVisibleSubcategories(selected)[0];
  if (firstSubcategory?.id) {
    expandedCategoryIds.add(firstSubcategory.id);
    lastExpandedCategoryId = firstSubcategory.id;
  } else {
    lastExpandedCategoryId = selected.id;
  }

  activeView = 'image';
  saveView();
  renderBoardDetail();
}

function renderCategoryGalleryCard(categoryNode) {
  const card = document.createElement('article');
  card.className = 'category-gallery-card';

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'category-gallery-open-btn';
  openBtn.setAttribute('aria-label', `Open ${categoryNode.name || 'category'}`);
  openBtn.addEventListener('click', () => {
    openCategoryFromGallery(categoryNode.id);
  });

  const images = getCategoryGalleryPreviewImages(categoryNode, 3);
  const collage = document.createElement('div');
  collage.className = 'category-gallery-collage';
  collage.appendChild(createCategoryGalleryImageSlot(images[0] || '', 'category-gallery-image-main'));

  const side = document.createElement('div');
  side.className = 'category-gallery-side-stack';
  side.appendChild(createCategoryGalleryImageSlot(images[1] || '', 'category-gallery-image-side'));
  side.appendChild(createCategoryGalleryImageSlot(images[2] || '', 'category-gallery-image-side'));
  collage.appendChild(side);

  const meta = document.createElement('div');
  meta.className = 'category-gallery-meta';

  const title = document.createElement('p');
  title.className = 'category-gallery-title';
  title.textContent = categoryNode.name || 'Untitled Category';
  meta.appendChild(title);

  const subCount = getVisibleSubcategories(categoryNode).length;
  if (subCount > 0) {
    const subText = document.createElement('p');
    subText.className = 'category-gallery-subtext';
    subText.textContent = `${subCount} ${subCount === 1 ? 'Subcategory' : 'Subcategories'}`;
    meta.appendChild(subText);
  }

  openBtn.appendChild(collage);
  openBtn.appendChild(meta);
  card.appendChild(openBtn);
  return card;
}

function renderCategoryGallery(categories = []) {
  const grid = document.createElement('div');
  grid.className = 'category-gallery-grid';
  for (const categoryNode of categories) {
    if (!categoryNode?.id) continue;
    grid.appendChild(renderCategoryGalleryCard(categoryNode));
  }
  return grid;
}

function getCategoryPreviewImages(categoryNode, limit = 5) {
  const children = Array.isArray(categoryNode?.children) ? categoryNode.children : [];
  const picks = [];
  for (const child of children) {
    if (picks.length >= limit) break;
    const childItems = collectAllItemsFromCategory(child);
    const firstImage = childItems
      .map((item) => getItemPrimaryImage(item))
      .find(Boolean);
    if (firstImage) picks.push(firstImage);
  }

  // Fallback for categories without children: show a few own-item images.
  if (!picks.length) {
    const ownItems = Array.isArray(categoryNode?.items) ? categoryNode.items : [];
    for (const item of ownItems) {
      if (picks.length >= limit) break;
      const src = getItemPrimaryImage(item);
      if (src) picks.push(src);
    }
  }

  return picks;
}

function findTopItemInCategory(node) {
  if (!node) return null;
  const ownItems = Array.isArray(node.items) ? node.items : [];
  if (ownItems.length) return ownItems[0];
  const nested = Array.isArray(node.children) ? node.children : [];
  for (const child of nested) {
    const candidate = findTopItemInCategory(child);
    if (candidate) return candidate;
  }
  return null;
}

function getItemImages(item) {
  if (!item) return [];
  const featured = String(item.image || '').trim();
  return pinPrimaryImage(item.images || featured, featured);
}

function getItemPrimaryImage(item) {
  const [src] = getItemImages(item);
  return src || '';
}

function scheduleImageRepairRender() {
  if (pendingBrokenImageRepairRender) return;
  pendingBrokenImageRepairRender = true;
  requestAnimationFrame(() => {
    pendingBrokenImageRepairRender = false;
    if (activeBoardId) renderBoardDetail();
  });
}

function promoteItemPrimaryImage(item, src) {
  if (!item || !src) return false;
  const currentSrc = String(item.image || '').trim();
  // Do not auto-promote away from a user-uploaded featured image.
  if (/^data:image\//i.test(currentSrc)) return false;
  const nextKey = canonicalImageKey(src);
  if (!nextKey) return false;
  const currentKey = canonicalImageKey(currentSrc);
  if (currentKey === nextKey) return false;
  item.images = pinPrimaryImage([src, ...(item.images || []), item.image || ''], src);
  item.image = item.images[0] || src;
  saveData();
  scheduleImageRepairRender();
  return true;
}

function bindImageFallbackToItem(imageEl, item, candidatesInput = null) {
  if (!imageEl || !item) return;
  const candidates = Array.isArray(candidatesInput) && candidatesInput.length
    ? pinPrimaryImage(candidatesInput, item.image || candidatesInput[0] || '')
    : getItemImages(item);
  if (!candidates.length) return;

  const keyFor = (src) => String(src || '').trim() || canonicalImageKey(src);
  const currentSrc = String(imageEl.getAttribute('src') || '').trim();
  let index = findImageIndex(candidates, currentSrc);
  if (index < 0) index = 0;
  const initialIndex = index;
  let fallbackHappened = false;
  const tried = new Set();

  imageEl.onerror = () => {
    const failedKey = keyFor(candidates[index]);
    if (failedKey) tried.add(failedKey);
    let nextIndex = -1;
    for (let i = index + 1; i < candidates.length; i += 1) {
      const key = keyFor(candidates[i]);
      if (!key || tried.has(key)) continue;
      nextIndex = i;
      break;
    }
    if (nextIndex < 0) return;
    fallbackHappened = true;
    index = nextIndex;
    imageEl.src = candidates[index];
  };

  imageEl.onload = () => {
    if (fallbackHappened && index >= 0 && index !== initialIndex) {
      promoteItemPrimaryImage(item, candidates[index]);
    }
    fallbackHappened = false;
  };
}

function getBoardTilePreviewImages(board, limit = 3) {
  const results = [];
  if (!board) return results;
  const categories = Array.isArray(board.categories) ? board.categories : [];
  const seen = new Set();

  const addImageFromItem = (item) => {
    if (!item) return false;
    const identifier = item.id || item.url || item.name || '';
    if (!identifier || seen.has(identifier)) return false;
    const image = getItemPrimaryImage(item);
    if (!image) return false;
    seen.add(identifier);
    results.push(image);
    return true;
  };

  if (categories.length) {
    addImageFromItem(findTopItemInCategory(categories[0]));
    for (let i = 1; i < categories.length && results.length < limit; i += 1) {
      addImageFromItem(findTopItemInCategory(categories[i]));
    }
  }

  if (results.length < limit) {
    const fallbackItems = getAllBoardItems(board);
    for (const item of fallbackItems) {
      if (results.length >= limit) break;
      addImageFromItem(item);
    }
  }

  return results.slice(0, limit);
}

function getBoardPreviewImages(board, limit = 3) {
  const fallback = getBoardTilePreviewImages(board, limit);
  const stored = Array.isArray(board?.previewImages) ? board.previewImages : [];
  const output = [];
  for (let index = 0; index < limit; index += 1) {
    const candidate = normalizeImageCandidateUrl(String(stored[index] || ''));
    if (candidate) {
      output.push(candidate);
    } else if (fallback[index]) {
      output.push(fallback[index]);
    } else {
      output.push('');
    }
  }
  return output;
}

function getBoardFeaturedImageCandidates(board, limit = 36) {
  const items = getAllBoardItems(board);
  const seen = new Set();
  const results = [];
  for (const item of items) {
    if (!item) continue;
    const candidate = normalizeImageCandidateUrl(String(item.image || ''));
    if (!candidate) continue;
    const key = canonicalImageKey(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    results.push(candidate);
    if (results.length >= limit) break;
  }
  return results;
}

function getAllBoardItems(board) {
  if (!board) return [];
  const categoryItems = (Array.isArray(board.categories) ? board.categories : []).flatMap(collectAllItemsFromCategory);
  const rootItems = Array.isArray(board.items) ? board.items : [];
  return [...categoryItems, ...rootItems];
}

function readInitialShareIntent() {
  try {
    const url = new URL(window.location.href);
    const boardId = String(url.searchParams.get('board') || '').trim();
    const categoryParam = String(url.searchParams.get('category') || '').trim();
    return {
      boardId,
      categoryParam
    };
  } catch {
    return {
      boardId: '',
      categoryParam: ''
    };
  }
}

function applyInitialShareLinkState() {
  const boardId = String(initialShareIntent?.boardId || '').trim();
  const categoryParam = String(initialShareIntent?.categoryParam || '').trim();
  if (!boardId) return false;
  const board = data.boards.find((entry) => entry.id === boardId);
  if (!board) return false;
  activeBoardId = board.id;
  if (!categoryParam) {
    activeCategoryPath = [];
    initialShareIntent = null;
    return true;
  }
  const requestedPath = decodeCategoryPath(categoryParam);
  activeCategoryPath = requestedPath.length && getCategoryNodeByPath(board, requestedPath)
    ? requestedPath
    : [];
  initialShareIntent = null;
  return true;
}

function renderApp() {
  closeRankMenu();
  hideHoverPreview();
  closeEditCategoriesInline();
  const board = getActiveBoard();
  const isBoardMode = Boolean(board);

  homeScreen.classList.toggle('hidden', isBoardMode);
  boardScreen.classList.toggle('hidden', !isBoardMode);

  if (!isBoardMode) {
    renderBoardsHome();
    return;
  }

  renderBoardDetail();
  loadBoardCategoryData(board.id).catch(() => {
    // handled in loader
  });
}

function renderBoardsHome() {
  boardsGrid.innerHTML = '';
  closeBoardMenu();

  const newTile = newBoardTileTemplate.content.firstElementChild.cloneNode(true);
  newTile.querySelector('.new-board-btn').addEventListener('click', () => {
    requestBoardCreation();
  });
  boardsGrid.appendChild(newTile);

  boardDropIndicator = document.createElement('div');
  boardDropIndicator.className = 'board-drop-indicator';

    if (!data.boards.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-cards';
      empty.textContent = 'Create your first board tile.';
      boardsGrid.appendChild(empty);
      boardsGrid.appendChild(boardDropIndicator);
      return;
    }

  for (const board of data.boards) {
    const card = boardCardTemplate.content.firstElementChild.cloneNode(true);
    card.classList.add('home-board-card');
    card.setAttribute('draggable', 'true');
    const openBtn = card.querySelector('.board-open-btn');
    const mainTile = card.querySelector('.preview-main');
    const sideTop = card.querySelector('.preview-side-top');
    const sideBottom = card.querySelector('.preview-side-bottom');
    const nameEl = card.querySelector('.board-name');
    const countEl = card.querySelector('.board-count');

    nameEl.textContent = board.name;
    const allItems = getAllBoardItems(board);
    countEl.textContent = `${allItems.length} Items`;

    const previewImages = getBoardPreviewImages(board, 3);

    applyPreviewTile(mainTile, previewImages[0]);
    applyPreviewTile(sideTop, previewImages[1]);
    applyPreviewTile(sideBottom, previewImages[2]);

    const actionsToggle = card.querySelector('.board-actions-toggle');
    const actionsMenu = card.querySelector('.board-actions-menu');
    const menuEditBtn = card.querySelector('.board-menu-edit');
    const menuShareBtn = card.querySelector('.board-menu-share');
    const menuDeleteBtn = card.querySelector('.board-menu-delete');

    if (actionsToggle && actionsMenu) {
      const setMenuOpen = (open) => {
        if (open) {
          closeBoardMenu();
          actionsMenu.hidden = false;
          actionsToggle.setAttribute('aria-expanded', 'true');
          activeBoardMenu = actionsMenu;
          activeBoardMenuToggle = actionsToggle;
          return;
        }
        actionsMenu.hidden = true;
        actionsToggle.setAttribute('aria-expanded', 'false');
        if (activeBoardMenu === actionsMenu) {
          activeBoardMenu = null;
          activeBoardMenuToggle = null;
        }
      };

      actionsToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();
        setMenuOpen(actionsMenu.hidden);
      });

      actionsMenu.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      if (menuEditBtn) {
        menuEditBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          setMenuOpen(false);
          openBoardEditDialog(board.id);
        });
      }

      if (menuShareBtn) {
        menuShareBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          event.preventDefault();
          setMenuOpen(false);
          copyBoardShareLink(board);
        });
      }

      if (menuDeleteBtn) {
        menuDeleteBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          event.preventDefault();
          setMenuOpen(false);
          handleBoardDelete(board);
        });
      }
    }

    openBtn.addEventListener('click', () => {
      closeBoardMenu();
      activeBoardId = board.id;
      activeCategoryPath = [];
      setStatus('');
      renderApp();
      loadBoardCategoryData(board.id).catch(() => {
        // handled in loader
      });
    });

    card.addEventListener('dragstart', (event) => {
      if (event.target && event.target.closest('.board-open-btn')) {
        // allow dragging from anywhere on card
      }
      draggingBoardId = board.id;
      card.classList.add('is-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', board.id);
      }
    });

    card.addEventListener('dragover', (event) => {
      if (!draggingBoardId || draggingBoardId === board.id) return;
      event.preventDefault();
      card.classList.add('drag-over');
      const dropAfter = shouldPlaceBoardAfter(card, event);
      updateBoardDropIndicator(card, dropAfter);
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
      hideBoardDropIndicator();
    });

    card.addEventListener('drop', (event) => {
      event.preventDefault();
      card.classList.remove('drag-over');
      hideBoardDropIndicator();
      if (!draggingBoardId || draggingBoardId === board.id) return;
      const dropAfter = shouldPlaceBoardAfter(card, event);
      reorderBoards(draggingBoardId, board.id, dropAfter, board.name);
    });

    card.addEventListener('dragend', () => {
      draggingBoardId = null;
      card.classList.remove('is-dragging');
      boardsGrid.querySelectorAll('.home-board-card.drag-over').forEach((el) => el.classList.remove('drag-over'));
      boardsGrid.querySelectorAll('.home-board-card.is-dragging').forEach((el) => el.classList.remove('is-dragging'));
      hideBoardDropIndicator();
    });

    boardsGrid.appendChild(card);
  }

  boardsGrid.appendChild(boardDropIndicator);
}

function getBoardEditTargetBoard() {
  if (!boardEditTargetId) return null;
  return data.boards.find((entry) => entry.id === boardEditTargetId) || null;
}

function setBoardEditActiveSlot(index) {
  const normalized = Number.isFinite(index) ? index : 0;
  boardEditActiveSlot = Math.max(0, Math.min(2, normalized));
  renderBoardEditPreviewSlots();
  renderBoardEditCandidates();
}

function renderBoardEditPreviewSlots() {
  if (!boardEditPreviewSlots.length) return;
  boardEditPreviewSlots.forEach((slot, slotIndex) => {
    if (!slot) return;
    const image = String(boardEditPreviewDraft[slotIndex] || '');
    const hasImage = Boolean(image);
    slot.style.backgroundImage = hasImage ? `url("${escapeCssUrl(image)}")` : '';
    slot.classList.toggle('has-image', hasImage);
    slot.classList.toggle('is-active', slotIndex === boardEditActiveSlot);
    slot.setAttribute('aria-pressed', slotIndex === boardEditActiveSlot ? 'true' : 'false');
  });
}

function renderBoardEditCandidates(boardParam) {
  if (!boardEditCandidatesContainer) return;
  boardEditCandidatesContainer.innerHTML = '';
  const board = boardParam || getBoardEditTargetBoard();
  if (!board) return;
  const candidates = getBoardFeaturedImageCandidates(board);
  if (!candidates.length) {
    const empty = document.createElement('p');
    empty.className = 'board-edit-empty';
    empty.textContent = 'No featured images exist on this board yet.';
    boardEditCandidatesContainer.appendChild(empty);
    return;
  }
  const activeValue = boardEditPreviewDraft[boardEditActiveSlot] || '';
  for (const src of candidates) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'board-edit-candidate';
    button.setAttribute('role', 'listitem');
    button.style.backgroundImage = `url("${escapeCssUrl(src)}")`;
    button.setAttribute('aria-pressed', src === activeValue ? 'true' : 'false');
    button.classList.toggle('selected', src === activeValue);
    button.classList.toggle('assigned', boardEditPreviewDraft.some((value) => value === src));
    button.addEventListener('click', () => {
      boardEditPreviewDraft[boardEditActiveSlot] = src;
      renderBoardEditPreviewSlots();
      renderBoardEditCandidates(board);
    });
    boardEditCandidatesContainer.appendChild(button);
  }
}

function handleBoardEditReset() {
  boardEditPreviewDraft = ['', '', ''];
  setBoardEditActiveSlot(0);
}

function handleBoardEditSubmit() {
  if (!boardEditTargetId) return;
  const board = getBoardEditTargetBoard();
  if (!board) return;
  const cleanName = String(boardEditNameInput?.value || '').trim();
  if (cleanName) {
    board.name = cleanName;
  }
  board.previewImages = boardEditPreviewDraft.map((value) => normalizeImageCandidateUrl(String(value || '')));
  saveData();
  renderApp();
  if (boardEditDialog?.open) boardEditDialog.close();
  setStatus('Board preview updated.');
}

function openBoardEditDialog(boardId) {
  if (!boardId || !boardEditDialog) return;
  const board = data.boards.find((entry) => entry.id === boardId);
  if (!board) return;
  boardEditTargetId = boardId;
  boardEditNameInput.value = board.name;
  boardEditPreviewDraft = getBoardPreviewImages(board, 3);
  setBoardEditActiveSlot(0);
  if (!boardEditDialog.open) boardEditDialog.showModal();
  setTimeout(() => boardEditNameInput?.focus(), 0);
}

async function handleBoardDelete(board) {
  if (!board) return;
  const totalItems = getAllBoardItems(board).length;
  const confirmation = await confirmDeleteBoard(board, totalItems);
  if (!confirmation) return;
  performBoardRemoval(board.id);
}

function confirmDeleteBoard(board, totalItems = 0) {
  const boardName = String(board?.name || 'this board').trim() || 'this board';
  const message = totalItems > 0
    ? `Are you sure you want to delete "${boardName}"? These ${totalItems} item${totalItems === 1 ? '' : 's'} will be unavailable after you delete it.`
    : `Are you sure you want to delete "${boardName}"?`;
  if (!boardDeleteDialog || !boardDeleteMessage) {
    return Promise.resolve(window.confirm(message));
  }
  boardDeleteMessage.textContent = message;
  return new Promise((resolve) => {
    pendingBoardDeleteResolve = resolve;
    if (!boardDeleteDialog.open) boardDeleteDialog.showModal();
  });
}

function copyBoardShareLink(board) {
  if (!board) return;
  const link = buildBoardShareLink(board.id);
  if (!link) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(
      () => setStatus(`Board share link copied.`),
      () => fallbackCopyShareLink(link)
    );
  } else {
    fallbackCopyShareLink(link);
  }
}

function copyCategoryShareLink(board, categoryPathIds = []) {
  if (!board) return;
  const path = Array.isArray(categoryPathIds) ? categoryPathIds.filter(Boolean) : [];
  if (!path.length) {
    copyBoardShareLink(board);
    return;
  }
  const link = buildCategoryShareLink(board.id, path);
  if (!link) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(
      () => setStatus('Category share link copied.'),
      () => fallbackCopyShareLink(link, { promptTitle: 'Copy category link', statusMessage: 'Category share link ready to copy.' })
    );
  } else {
    fallbackCopyShareLink(link, { promptTitle: 'Copy category link', statusMessage: 'Category share link ready to copy.' });
  }
}

function buildBoardShareLink(boardId) {
  return buildShareLink(boardId, []);
}

function buildCategoryShareLink(boardId, categoryPathIds = []) {
  return buildShareLink(boardId, categoryPathIds);
}

function buildShareLink(boardId, categoryPathIds = []) {
  if (!boardId) return '';
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('board', boardId);
    const encodedPath = encodeCategoryPath(categoryPathIds);
    if (encodedPath) {
      url.searchParams.set('category', encodedPath);
    } else {
      url.searchParams.delete('category');
    }
    return url.toString();
  } catch {
    const params = new URLSearchParams();
    params.set('board', boardId);
    const encodedPath = encodeCategoryPath(categoryPathIds);
    if (encodedPath) params.set('category', encodedPath);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }
}

function fallbackCopyShareLink(link, options = {}) {
  const promptTitle = String(options.promptTitle || 'Copy board link');
  const statusMessage = String(options.statusMessage || 'Board share link ready to copy.');
  window.prompt(promptTitle, link);
  setStatus(statusMessage);
}

function performBoardRemoval(boardId) {
  const index = data.boards.findIndex((entry) => entry.id === boardId);
  if (index < 0) return;
  const [removed] = data.boards.splice(index, 1);
  if (activeBoardId === boardId) {
    activeBoardId = null;
  }
  saveData();
  renderApp();
  setStatus(removed ? `Removed "${removed.name}".` : 'Board removed.');
}

function reorderBoards(sourceBoardId, targetBoardId, insertAfter = false, targetName = '') {
  if (!sourceBoardId || !targetBoardId || sourceBoardId === targetBoardId) return;
  const sourceIndex = data.boards.findIndex((board) => board.id === sourceBoardId);
  if (sourceIndex < 0) return;

  const [movedBoard] = data.boards.splice(sourceIndex, 1);
  if (!movedBoard) return;

  const targetIndex = data.boards.findIndex((board) => board.id === targetBoardId);
  const insertIndex = targetIndex < 0
    ? data.boards.length
    : Math.min(Math.max(0, targetIndex + (insertAfter ? 1 : 0)), data.boards.length);

  data.boards.splice(insertIndex, 0, movedBoard);
  saveData();

  const direction = insertAfter ? 'after' : 'before';
  const resolvedTargetName = targetName || data.boards.find((board) => board.id === targetBoardId)?.name || 'target board';
  setStatus(`Moved "${movedBoard.name}" ${direction} "${resolvedTargetName}".`);
  renderBoardsHome();
}

function shouldPlaceBoardAfter(card, event) {
  if (!card || !event) return false;
  const rect = card.getBoundingClientRect();
  const horizontal = rect.width >= rect.height;
  const coordinate = horizontal ? event.clientX : event.clientY;
  const threshold = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
  return coordinate > threshold;
}

function updateBoardDropIndicator(card, dropAfter) {
  if (!boardDropIndicator || !card) return;
  const gridRect = boardsGrid.getBoundingClientRect();
  const rect = card.getBoundingClientRect();
  const styles = window.getComputedStyle(boardsGrid);
  const columnGap = parseFloat(styles.columnGap || styles.gridColumnGap || '0') || 0;
  const relativeLeft = rect.left - gridRect.left;
  const relativeRight = rect.right - gridRect.left;
  const halfGap = columnGap / 2;
  const centerOffset = dropAfter ? relativeRight + halfGap : relativeLeft - halfGap;
  const rawLeft = centerOffset - BOARD_DROP_INDICATOR_WIDTH / 2;
  const clampedLeft = Math.min(Math.max(0, rawLeft), Math.max(0, gridRect.width - BOARD_DROP_INDICATOR_WIDTH));
  const extra = BOARD_DROP_VERTICAL_EXTENSION;
  boardDropIndicator.style.top = `${rect.top - gridRect.top - extra}px`;
  boardDropIndicator.style.height = `${rect.height + extra * 2}px`;
  boardDropIndicator.style.left = `${clampedLeft}px`;
  boardDropIndicator.classList.add('visible');
}

function hideBoardDropIndicator() {
  if (!boardDropIndicator) return;
  boardDropIndicator.classList.remove('visible');
}

function getUniqueBoardName(baseName) {
  const seed = String(baseName || '').trim() || 'Untitled Board';
  const existing = new Set(data.boards.map((board) => String(board?.name || '').trim().toLowerCase()));
  if (!existing.has(seed.toLowerCase())) return seed;
  let index = 2;
  let candidate = `${seed} (${index})`;
  while (existing.has(candidate.toLowerCase())) {
    index += 1;
    candidate = `${seed} (${index})`;
  }
  return candidate;
}

function moveCategoryToTopLevelBoard(categoryCollection, categoryNode) {
  if (!Array.isArray(categoryCollection) || !categoryNode) return false;
  const index = categoryCollection.findIndex((entry) => entry.id === categoryNode.id);
  if (index < 0) return false;
  const [movedCategory] = categoryCollection.splice(index, 1);
  if (!movedCategory) return false;
  const boardName = getUniqueBoardName(movedCategory.name || 'Untitled Board');
  data.boards.unshift({
    id: movedCategory.id || crypto.randomUUID(),
    name: boardName,
    items: normalizeItems(movedCategory.items || []),
    categories: Array.isArray(movedCategory.children) ? movedCategory.children : [],
    previewImages: ['', '', ''],
    fieldCategories: mergeRequiredDefaultCategories(
      normalizeBoardFieldCategories(movedCategory.fieldCategories || []),
      movedCategory.id || ''
    )
  });
  expandedCategoryIds.delete(movedCategory.id);
  saveData();
  const statusMessage = `Moved "${boardName}" to top-level boards.`;
  renderBoardDetail();
  setStatus(statusMessage);
  return true;
}

function requestBoardCreation() {
  if (activeSessionUser) {
    openNewBoardDialog('board');
    return;
  }
  promptAuthForAction('Sign in or create an account to create your own boards.', () => {
    openNewBoardDialog('board');
  });
}

function openNewBoardDialog(mode = 'board') {
  if (!newBoardDialog || !newBoardInput || !newBoardTitle || !newBoardLabel) return;
  if ((mode || 'board') === 'board' && !activeSessionUser) {
    requestBoardCreation();
    return;
  }
  createDialogMode = mode === 'category' ? 'category' : 'board';
  if (createDialogMode !== 'category') pendingCategoryParentId = null;
  newBoardTitle.textContent = createDialogMode === 'board' ? 'New Board Name' : 'New Category Name';
  newBoardLabel.textContent = createDialogMode === 'board' ? '' : 'Category Name';
  newBoardLabel.hidden = createDialogMode === 'board';
  newBoardInput.setAttribute('aria-label', createDialogMode === 'board' ? 'Board Name' : 'Category Name');
  newBoardInput.placeholder = createDialogMode === 'board'
    ? ''
    : 'e.g. Living Room, Rug, Couch';
  newBoardInput.value = '';
  refreshInputAutocompleteIdentity(
    newBoardInput,
    createDialogMode === 'board' ? 'new-board-name' : 'new-category-name'
  );
  disableAutofill(newBoardInput);
  if (!newBoardDialog.open) newBoardDialog.showModal();
  newBoardInput.readOnly = true;
  setTimeout(() => {
    newBoardInput.readOnly = false;
    newBoardInput.focus();
  }, 0);
}

function commitNewBoardDialog() {
  if (!newBoardInput || !newBoardDialog) return;
  const cleanName = String(newBoardInput.value || '').trim();
  if (!cleanName) return;
  let createdBoardId = '';
  if (createDialogMode === 'board') {
    const boardId = crypto.randomUUID();
    createdBoardId = boardId;
    data.boards.unshift({
      id: boardId,
      name: cleanName,
      items: [],
      categories: [],
      fieldCategories: createDefaultFieldCategories(boardId),
      previewImages: ['', '', '']
    });
  } else {
    const board = getActiveBoard();
    if (!board) return;
    const parent = pendingCategoryParentId ? getCategoryNodeById(board, pendingCategoryParentId) : getActiveCategoryNode(board);
    const target = parent ? parent.children : board.categories;
    const categoryId = crypto.randomUUID();
    target.unshift({
      id: categoryId,
      name: cleanName,
      children: [],
      items: [],
      fieldCategories: createDefaultFieldCategories(categoryId)
    });
  }
  pendingCategoryParentId = null;
  saveData();
  if (createdBoardId) {
    activeBoardId = createdBoardId;
    activeCategoryPath = [];
  }
  renderApp();
  newBoardDialog.close();
}

function getCategoryNodeById(board, categoryId) {
  if (!board || !categoryId) return null;
  const stack = Array.isArray(board.categories) ? [...board.categories] : [];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    if (node.id === categoryId) return node;
    if (Array.isArray(node.children) && node.children.length) {
      stack.push(...node.children);
    }
  }
  return null;
}

function getEditableCollectionForCategoryNode(node) {
  if (!node) return null;
  const children = Array.isArray(node.children) ? node.children : [];
  const allItemsProxyNode = children.length === 1 && /^all items$/i.test(String(children[0]?.name || '').trim())
    ? children[0]
    : null;
  if (allItemsProxyNode) {
    if (!Array.isArray(allItemsProxyNode.items)) allItemsProxyNode.items = [];
    return allItemsProxyNode.items;
  }
  if (!Array.isArray(node.items)) node.items = [];
  return node.items;
}

function findItemLocationInBoard(board, itemId) {
  if (!board || !itemId) return null;

  if (Array.isArray(board.items)) {
    const rootIndex = board.items.findIndex((entry) => entry.id === itemId);
    if (rootIndex >= 0) {
      return { item: board.items[rootIndex], collection: board.items, node: null };
    }
  }

  const stack = Array.isArray(board.categories) ? [...board.categories] : [];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    const collection = getEditableCollectionForCategoryNode(node);
    if (Array.isArray(collection)) {
      const idx = collection.findIndex((entry) => entry.id === itemId);
      if (idx >= 0) {
        return { item: collection[idx], collection, node };
      }
    }
    if (Array.isArray(node.children) && node.children.length) {
      stack.push(...node.children);
    }
  }

  return null;
}

function moveItemToCategory(itemId, targetCategoryId) {
  const board = getActiveBoard();
  if (!board || !itemId || !targetCategoryId) return;
  const targetNode = getCategoryNodeById(board, targetCategoryId);
  if (!targetNode) return;
  const targetCollection = getEditableCollectionForCategoryNode(targetNode);
  if (!Array.isArray(targetCollection)) return;

  const source = findItemLocationInBoard(board, itemId);
  if (!source || !source.item || !Array.isArray(source.collection)) return;
  if (source.collection === targetCollection) return;

  const sourceIdx = source.collection.findIndex((entry) => entry.id === itemId);
  if (sourceIdx < 0) return;
  const [moved] = source.collection.splice(sourceIdx, 1);
  targetCollection.unshift(moved);
  expandedCategoryIds.add(targetCategoryId);
  saveData();
  renderBoardDetail();
  setStatus('');
}

function getDraggedItemId(event) {
  if (draggingCategoryId) return '';
  if (draggingCategoryItemId) return draggingCategoryItemId;
  if (!event?.dataTransfer) return '';
  return event.dataTransfer.getData('text/plain') || '';
}

function getDraggedCategoryId(event) {
  if (draggingCategoryId) return draggingCategoryId;
  if (!event?.dataTransfer) return '';
  return event.dataTransfer.getData('application/x-category-id') || '';
}

function moveCategoryWithinCollection(collection, sourceCategoryId, targetCategoryId, position = 'before') {
  if (!Array.isArray(collection) || !sourceCategoryId || !targetCategoryId || sourceCategoryId === targetCategoryId) return;
  const fromIndex = collection.findIndex((entry) => entry.id === sourceCategoryId);
  const toIndex = collection.findIndex((entry) => entry.id === targetCategoryId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
  const [moved] = collection.splice(fromIndex, 1);
  const toAfter = position === 'after';
  const baseIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  const insertIndex = toAfter ? baseIndex + 1 : baseIndex;
  collection.splice(insertIndex, 0, moved);
  saveData();
  renderBoardDetail();
}

function clearCategoryDropStyles() {
  document.querySelectorAll('.category-drop-over').forEach((el) => el.classList.remove('category-drop-over'));
  document.querySelectorAll('.category-reorder-over,.category-reorder-above,.category-reorder-below').forEach((el) => {
    el.classList.remove('category-reorder-over', 'category-reorder-above', 'category-reorder-below');
  });
}

function applyPreviewTile(tile, imageUrl) {
  if (imageUrl) {
    tile.style.backgroundImage = `url("${escapeCssUrl(imageUrl)}")`;
    tile.classList.add('has-preview-image');
  } else {
    tile.style.backgroundImage = '';
    tile.classList.remove('has-preview-image');
  }
}

function renderTableHeadForCategories(table, categories, options = {}) {
  if (!table || !Array.isArray(categories) || !categories.length) return;
  const editMode = Boolean(options.editMode);
  const allowFieldEditorTrigger = Boolean(options.allowFieldEditorTrigger);
  const fieldScopeCategoryId = String(options.fieldScopeCategoryId || '').trim();
  const showFieldEditorTrigger = !editMode && allowFieldEditorTrigger;
  let colgroup = table.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('colgroup');
    table.prepend(colgroup);
  }
  const thead = table.querySelector('thead') || table.createTHead();
  thead.innerHTML = '';
  const row = document.createElement('tr');

  colgroup.innerHTML = '';
  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index];
    const isLastHeader = index === categories.length - 1;
    const col = document.createElement('col');
    if (category.slug === 'image') col.className = 'col-image';
    else if (category.slug === 'item_name') col.className = 'col-name';
    else if (category.slug === 'seller') col.className = 'col-seller';
    else if (category.slug === 'price') col.className = 'col-price';
    else if (category.slug === 'highlights') col.className = 'col-highlights';
    else if (category.slug === 'feedback') col.className = 'col-feedback';
    else col.className = 'col-custom';
    colgroup.appendChild(col);

    const th = document.createElement('th');
    if (editMode) {
      th.className = 'category-edit-header-cell';
      th.dataset.categoryId = category.id;
      th.setAttribute('draggable', 'false');
      const wrap = document.createElement('div');
      wrap.className = 'category-edit-header-wrap';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'category-header-input';
      input.setAttribute('aria-label', `Rename ${category.label || 'field'}`);
      input.value = category.label || '';
      input.dataset.categoryId = category.id;
      disableAutofill(input);
      wrap.appendChild(input);

      const actions = document.createElement('div');
      actions.className = 'category-header-actions';

      const moveBtn = document.createElement('button');
      moveBtn.type = 'button';
      moveBtn.className = 'category-header-move-btn';
      moveBtn.setAttribute('aria-label', 'Drag to reorder field');
      moveBtn.title = 'Drag to reorder field';
      moveBtn.setAttribute('data-category-id', category.id);
      moveBtn.setAttribute('draggable', 'false');
      moveBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 3v18"></path>
          <path d="M3 12h18"></path>
          <path d="M12 3l-2 2"></path>
          <path d="M12 3l2 2"></path>
          <path d="M21 12l-2-2"></path>
          <path d="M21 12l-2 2"></path>
          <path d="M12 21l-2-2"></path>
          <path d="M12 21l2-2"></path>
          <path d="M3 12l2-2"></path>
          <path d="M3 12l2 2"></path>
        </svg>
      `;
      actions.appendChild(moveBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = `category-header-delete-btn${category.isDeletable ? '' : ' is-disabled'}`;
      deleteBtn.textContent = '🗑';
      deleteBtn.setAttribute('aria-label', category.isDeletable ? 'Delete field' : 'Required field');
      deleteBtn.title = category.isDeletable ? 'Delete field' : 'Required field';
      deleteBtn.setAttribute('data-category-id', category.id);
      actions.appendChild(deleteBtn);

      wrap.appendChild(actions);
      th.appendChild(wrap);
    } else if (showFieldEditorTrigger && isLastHeader) {
      const headerWrap = document.createElement('div');
      headerWrap.className = 'feedback-header-cell field-header-cell';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = category.label || 'Category';
      headerWrap.appendChild(labelSpan);

      const editFieldsBtn = document.createElement('button');
      editFieldsBtn.type = 'button';
      editFieldsBtn.className = 'edit-categories-btn ghost-btn field-header-edit-btn';
      editFieldsBtn.textContent = 'Edit Fields';
      editFieldsBtn.setAttribute('data-field-scope-category-id', fieldScopeCategoryId);
      editFieldsBtn.setAttribute('aria-label', 'Edit fields');
      editFieldsBtn.title = 'Edit fields';
      headerWrap.appendChild(editFieldsBtn);
      th.appendChild(headerWrap);
    } else {
      th.textContent = category.label || 'Category';
    }
    row.appendChild(th);
  }
  thead.appendChild(row);
  const customCount = categories.filter((entry) => !entry.isDefault).length;
  const minWidth = 1040 + Math.max(0, customCount * 160);
  table.style.minWidth = `${minWidth}px`;
}

function renderItemsTableHeader(board) {
  const scopeCategoryId = getFieldContextCategoryId(board, { useActive: true });
  const categories = getRenderableFieldCategories(board, { scopeCategoryId });
  const showFieldEditControls = isEditingFieldScope(scopeCategoryId);
  renderTableHeadForCategories(itemsTable, categories, {
    withEditButton: true,
    editMode: showFieldEditControls,
    allowFieldEditorTrigger: true,
    fieldScopeCategoryId: scopeCategoryId
  });
  renderRootFieldEditControls(showFieldEditControls);
}

function renderRootFieldEditControls(visible) {
  if (!listViewSection) return;
  const tableWrap = listViewSection.querySelector('.table-wrap');
  if (!tableWrap) return;
  let controls = listViewSection.querySelector('.field-header-edit-controls.root-field-edit-controls');
  if (!visible) {
    if (controls) controls.remove();
    return;
  }
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'field-header-edit-controls root-field-edit-controls';

    const addFieldBtn = document.createElement('button');
    addFieldBtn.type = 'button';
    addFieldBtn.className = 'add-category-inline-btn';
    addFieldBtn.textContent = '+';
    addFieldBtn.setAttribute('aria-label', 'Add field');
    addFieldBtn.title = 'Add field';
    controls.appendChild(addFieldBtn);

    const cancelEditBtn = document.createElement('button');
    cancelEditBtn.type = 'button';
    cancelEditBtn.className = 'cancel-categories-inline-btn';
    cancelEditBtn.textContent = 'Cancel';
    controls.appendChild(cancelEditBtn);

    const saveEditBtn = document.createElement('button');
    saveEditBtn.type = 'button';
    saveEditBtn.className = 'save-categories-inline-btn';
    saveEditBtn.textContent = 'Save';
    controls.appendChild(saveEditBtn);

    listViewSection.insertBefore(controls, tableWrap);
  }
}

function isEditingFieldScope(scopeCategoryId = '') {
  if (!isEditingCategoryHeaders) return false;
  return String(fieldEditorScopeCategoryId || '').trim() === String(scopeCategoryId || '').trim();
}

function getRenderableFieldCategories(board, options = {}) {
  const scopeCategoryId = getFieldContextCategoryId(board, options);
  if (isEditingFieldScope(scopeCategoryId) && Array.isArray(categoryEditorDraft) && categoryEditorDraft.length) {
    return categoryEditorDraft;
  }
  return getFieldCategoriesForScope(board, scopeCategoryId);
}

function toCategoryDraft(category) {
  return {
    id: category.id,
    label: category.label,
    slug: category.slug,
    scrapeKey: category.slug,
    type: normalizeCategoryType(category.type),
    allowedOptions: normalizedAllowedOptions(category.allowedOptions || []),
    isDefault: Boolean(category.isDefault),
    isDeletable: Boolean(category.isDeletable),
    position: Number.isFinite(Number(category.position)) ? Number(category.position) : 0,
    isNew: false
  };
}

function clearCategoryHeaderDragStyles() {
  boardScreen?.querySelectorAll('.category-edit-header-cell.is-dragging').forEach((cell) => {
    cell.classList.remove('is-dragging');
  });
  boardScreen?.querySelectorAll('.category-edit-header-cell.drag-over-before,.category-edit-header-cell.drag-over-after').forEach((cell) => {
    cell.classList.remove('drag-over-before', 'drag-over-after');
  });
}

function reorderCategoryDraft(fromCategoryId, targetCategoryId, insertAfter = false) {
  if (!fromCategoryId || !targetCategoryId || fromCategoryId === targetCategoryId) return;
  const fromIndex = categoryEditorDraft.findIndex((entry) => entry.id === fromCategoryId);
  const targetIndex = categoryEditorDraft.findIndex((entry) => entry.id === targetCategoryId);
  if (fromIndex < 0 || targetIndex < 0) return;
  const draft = [...categoryEditorDraft];
  const [moved] = draft.splice(fromIndex, 1);
  let insertIndex = targetIndex;
  if (fromIndex < targetIndex) insertIndex -= 1;
  if (insertAfter) insertIndex += 1;
  draft.splice(Math.max(0, insertIndex), 0, moved);
  categoryEditorDraft = draft.map((entry, index) => ({ ...entry, position: index }));
}

function startCategoryHeaderPointerDrag(categoryId, pointerId = null) {
  if (!isEditingCategoryHeaders || !categoryId) return;
  headerPointerDragActive = true;
  headerPointerDragSourceCategoryId = categoryId;
  headerPointerDragTargetCategoryId = '';
  headerPointerDragInsertAfter = false;
  headerPointerDragPointerId = Number.isFinite(Number(pointerId)) ? Number(pointerId) : null;
  draggingHeaderCategoryId = categoryId;
  pendingHeaderDragCategoryId = categoryId;
  clearCategoryHeaderDragStyles();
  boardScreen?.querySelectorAll(`.category-edit-header-cell[data-category-id="${escapeCssSelector(categoryId)}"]`).forEach((cell) => {
    cell.classList.add('is-dragging');
  });
}

function updateCategoryHeaderPointerDrag(event) {
  if (!headerPointerDragActive || !isEditingCategoryHeaders) return;
  if (headerPointerDragPointerId !== null && Number(event?.pointerId) !== headerPointerDragPointerId) return;
  const sourceCategoryId = String(headerPointerDragSourceCategoryId || '').trim();
  if (!sourceCategoryId) return;

  clearCategoryHeaderDragStyles();
  boardScreen?.querySelectorAll(`.category-edit-header-cell[data-category-id="${escapeCssSelector(sourceCategoryId)}"]`).forEach((cell) => {
    cell.classList.add('is-dragging');
  });

  const pointTarget = document.elementFromPoint(event.clientX, event.clientY);
  const headerCell = pointTarget instanceof Element ? pointTarget.closest('.category-edit-header-cell') : null;
  if (!headerCell) {
    headerPointerDragTargetCategoryId = '';
    return;
  }
  const targetCategoryId = String(headerCell.getAttribute('data-category-id') || '').trim();
  if (!targetCategoryId || targetCategoryId === sourceCategoryId) {
    headerPointerDragTargetCategoryId = '';
    return;
  }
  const bounds = headerCell.getBoundingClientRect();
  const insertAfter = event.clientX > bounds.left + bounds.width / 2;
  headerPointerDragTargetCategoryId = targetCategoryId;
  headerPointerDragInsertAfter = insertAfter;
  headerCell.classList.add(insertAfter ? 'drag-over-after' : 'drag-over-before');
}

function finishCategoryHeaderPointerDrag(pointerId = null, cancel = false) {
  if (!headerPointerDragActive) return;
  if (headerPointerDragPointerId !== null && pointerId !== null && Number(pointerId) !== headerPointerDragPointerId) return;

  const sourceCategoryId = String(headerPointerDragSourceCategoryId || '').trim();
  const targetCategoryId = String(headerPointerDragTargetCategoryId || '').trim();
  const insertAfter = Boolean(headerPointerDragInsertAfter);

  headerPointerDragActive = false;
  headerPointerDragSourceCategoryId = '';
  headerPointerDragTargetCategoryId = '';
  headerPointerDragInsertAfter = false;
  headerPointerDragPointerId = null;
  draggingHeaderCategoryId = '';
  pendingHeaderDragCategoryId = '';
  clearCategoryHeaderDragStyles();

  if (cancel || !sourceCategoryId || !targetCategoryId || sourceCategoryId === targetCategoryId) return;
  reorderCategoryDraft(sourceCategoryId, targetCategoryId, insertAfter);
  renderBoardDetail();
}

async function startInlineCategoryHeaderEdit(scopeCategoryId = '') {
  const board = getActiveBoard();
  if (!board) return;
  const scopedId = String(scopeCategoryId || '').trim();
  if (!scopedId) {
    await loadBoardCategoryData(board.id).catch(() => {
      // handled in loader
    });
  }
  finishCategoryHeaderPointerDrag(null, true);
  fieldEditorScopeCategoryId = scopedId;
  draggingHeaderCategoryId = '';
  categoryEditorDraft = getFieldCategoriesForScope(board, scopedId).map(toCategoryDraft);
  isEditingCategoryHeaders = true;
  renderBoardDetail();
}

function cancelInlineCategoryHeaderEdit() {
  finishCategoryHeaderPointerDrag(null, true);
  fieldEditorScopeCategoryId = '';
  draggingHeaderCategoryId = '';
  clearCategoryHeaderDragStyles();
  isEditingCategoryHeaders = false;
  categoryEditorDraft = [];
  renderBoardDetail();
}

async function saveInlineCategoryHeaderEdit() {
  const board = getActiveBoard();
  if (!board) return;
  const scopeCategoryId = String(fieldEditorScopeCategoryId || '').trim();
  const scopedOwner = getFieldCategoryOwner(board, scopeCategoryId);
  if (!scopedOwner) {
    setStatus('Could not find the selected category fields.', true);
    return;
  }
  const next = categoryEditorDraft.map((entry) => ({
    ...entry,
    label: String(entry.label || '').trim()
  }));
  if (next.some((entry) => !entry.label)) {
    setStatus('Every field needs a name.', true);
    return;
  }
  const lowerNames = next.map((entry) => entry.label.toLowerCase());
  if (new Set(lowerNames).size !== lowerNames.length) {
    setStatus('Field names must be unique.', true);
    return;
  }

  const existingMap = new Map(getFieldCategoriesForScope(board, scopeCategoryId).map((entry) => [entry.id, entry]));
  const nextById = new Map(next.map((entry) => [entry.id, entry]));
  const toDelete = [];
  for (const existing of existingMap.values()) {
    if (nextById.has(existing.id)) continue;
    if (!existing.isDeletable) {
      setStatus(`"${existing.label}" is required and cannot be deleted.`, true);
      return;
    }
    toDelete.push(existing);
  }

  if (scopeCategoryId) {
    const deletedIds = new Set(toDelete.map((entry) => entry.id));
    const nextLocal = next.map((entry, index) => {
      const existing = existingMap.get(entry.id);
      const entryId = String(existing?.id || entry.id || `local-${scopeCategoryId}-${crypto.randomUUID()}`);
      return {
        id: entryId,
        label: entry.label,
        slug: slugifyCategoryLabel(entry.slug || entry.scrapeKey || entry.label || entryId),
        type: normalizeCategoryType(existing?.type || entry.type || 'text'),
        allowedOptions: normalizedAllowedOptions(existing?.allowedOptions || entry.allowedOptions || []),
        isDefault: Boolean(existing?.isDefault),
        isDeletable: typeof existing?.isDeletable === 'boolean' ? existing.isDeletable : !existing?.isDefault,
        position: index,
        createdAt: String(existing?.createdAt || ''),
        updatedAt: String(existing?.updatedAt || new Date().toISOString())
      };
    });
    scopedOwner.fieldCategories = nextLocal;

    if (deletedIds.size) {
      const scopedItems = collectAllItemsFromCategory(scopedOwner);
      for (const item of scopedItems) {
        if (!item?.customFieldValues || typeof item.customFieldValues !== 'object') continue;
        for (const deletedId of deletedIds) {
          delete item.customFieldValues[deletedId];
        }
      }
    }

    finishCategoryHeaderPointerDrag(null, true);
    fieldEditorScopeCategoryId = '';
    draggingHeaderCategoryId = '';
    clearCategoryHeaderDragStyles();
    isEditingCategoryHeaders = false;
    categoryEditorDraft = [];
    saveData();
    renderBoardDetail();
    setStatus('Fields saved.');
    return;
  }

  try {
    for (const category of toDelete) {
      await apiRequest(`/api/boards/${encodeURIComponent(board.id)}/categories/${encodeURIComponent(category.id)}`, {
        method: 'DELETE'
      });
    }

    const desiredOrderIds = [];
    for (const category of next) {
      const existing = existingMap.get(category.id);
      if (!existing) {
        const createdPayload = await apiRequest(`/api/boards/${encodeURIComponent(board.id)}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: category.label,
            key: category.scrapeKey || category.slug || category.label,
            type: 'text'
          })
        });
        const createdId = String(createdPayload?.category?.id || '').trim();
        if (!createdId) {
          throw new Error('Could not create category.');
        }
        desiredOrderIds.push(createdId);
        continue;
      }
      desiredOrderIds.push(existing.id);
      if (String(existing.label || '') !== category.label) {
        await apiRequest(`/api/boards/${encodeURIComponent(board.id)}/categories/${encodeURIComponent(category.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: category.label })
        });
      }
    }

    if (desiredOrderIds.length) {
      await apiRequest(`/api/boards/${encodeURIComponent(board.id)}/categories/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: desiredOrderIds })
      });
    }

    await loadBoardCategoryData(board.id, { force: true });
    finishCategoryHeaderPointerDrag(null, true);
    fieldEditorScopeCategoryId = '';
    draggingHeaderCategoryId = '';
    clearCategoryHeaderDragStyles();
    isEditingCategoryHeaders = false;
    categoryEditorDraft = [];
    renderBoardDetail();
    setStatus('Fields saved.');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Could not save fields.', true);
  }
}

function deleteCategoryFromHeaderDraft(categoryId) {
  if (!isEditingCategoryHeaders) return;
  const category = categoryEditorDraft.find((entry) => entry.id === categoryId);
  if (!category) return;
  if (!category.isDeletable) {
    setStatus(`"${category.label}" is required and cannot be deleted.`, true);
    return;
  }
  const confirmed = window.confirm('Delete this field and all its values?');
  if (!confirmed) return;
  categoryEditorDraft = categoryEditorDraft
    .filter((entry) => entry.id !== categoryId)
    .map((entry, index) => ({ ...entry, position: index }));
  renderBoardDetail();
}

function openAddCategoryDialog() {
  if (!isEditingCategoryHeaders || !categoryAddDialog || !categoryAddNameInput) return;
  refreshInputAutocompleteIdentity(categoryAddNameInput, 'new-category-name');
  disableAutofill(categoryAddNameInput);
  if (!categoryAddDialog.open) categoryAddDialog.showModal();
  categoryAddNameInput.readOnly = true;
  setTimeout(() => {
    categoryAddNameInput.readOnly = false;
    categoryAddNameInput.focus();
    categoryAddNameInput.select();
  }, 0);
}

function renderBoardDetail() {
  hideHoverPreview();
  closeRankMenu();
  const board = getActiveBoard();
  if (!board) return;

  // Repair invalid category path if nodes were removed.
  const activeNode = getActiveCategoryNode(board);
  if (activeCategoryPath.length && !activeNode) {
    activeCategoryPath = [];
  }

  boardTitle.textContent = board.name;
  boardTitleInput.value = board.name;
  boardTitleWrap.classList.remove('hidden');
  boardTitleInput.classList.add('hidden');
  isEditingBoardTitle = false;
  renderCategoryPanel(board);
  renderAddCategoryOptions(board);
  renderBoardViewControls();
  applyViewMode();
  renderItemsTableHeader(board);
  const items = getCurrentItems(board);
  addItemPanel.classList.remove('hidden');
  renderListView(items);
  renderImageView(items);
}

function renderBoardViewControls() {
  if (!boardViewControls) return;
  boardViewControls.innerHTML = '';
  boardViewControls.appendChild(createViewToggle());
}

function renderCategoryPanel(board) {
  hideHoverPreview();
  if (!categoryBreadcrumbs || !categoryChildren || !addCategoryBtn) return;
  viewToggleButtons.clear();
  categoryBreadcrumbs.innerHTML = '';

  let nodes = board.categories || [];
  const nextPath = [];
  for (const id of activeCategoryPath) {
    const node = nodes.find((entry) => entry.id === id);
    if (!node) break;
    nextPath.push(node.id);
    if (categoryBreadcrumbs.childElementCount) {
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.textContent = '/';
      categoryBreadcrumbs.appendChild(sep);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `crumb-btn${nextPath.length === activeCategoryPath.length ? ' active' : ''}`;
    btn.textContent = node.name;
    const jumpPath = [...nextPath];
    btn.addEventListener('click', () => {
      activeCategoryPath = jumpPath;
      renderBoardDetail();
    });
    categoryBreadcrumbs.appendChild(btn);
    nodes = node.children || [];
  }
  const mapRow = categoryBreadcrumbs.closest('.board-map-row');
  if (mapRow) {
    mapRow.classList.toggle('hidden', categoryBreadcrumbs.childElementCount === 0);
  }

  const rootChildren = getCurrentCategoryChildren(board);
  let children = rootChildren;
  if (activeView === 'image' && activeCategoryPath.length === 0 && activeImageRootCategoryId) {
    const focusedRoot = rootChildren.find((entry) => entry?.id === activeImageRootCategoryId) || null;
    if (focusedRoot) {
      children = [focusedRoot];
    } else {
      activeImageRootCategoryId = '';
    }
  }
  categoryChildren.innerHTML = '';
  const showCategoryGallery = activeView === 'image'
    && activeCategoryPath.length === 0
    && expandedCategoryIds.size === 0
    && !activeImageRootCategoryId
    && rootChildren.length > 0;
  if (showCategoryGallery) {
    categoryChildren.appendChild(renderCategoryGallery(rootChildren));
  } else if (children.length) {
    const categoryCollection = getCurrentCategoryCollection(board);
    const appendCategoryTree = (node, collection, container, depth = 0, parentName = '', pathIds = []) => {
      const rendered = renderCategoryCard(node, collection, depth, parentName, pathIds);
      container.appendChild(rendered.card);
      if (rendered.isExpanded && rendered.childNodes.length && rendered.childHost) {
        for (const sub of rendered.childNodes) {
          appendCategoryTree(sub, rendered.childNodes, rendered.childHost, depth + 1, node.name || '', [...pathIds, sub.id]);
        }
      }
    };
    for (const child of children) {
      appendCategoryTree(child, categoryCollection, categoryChildren, 0, '', [child.id]);
    }
  }

  if (categoryPanel) categoryPanel.classList.toggle('hidden', children.length === 0);
  addCategoryBtn.textContent = activeCategoryPath.length ? 'Add Subcategory' : 'Add Category';
}

function renderCategoryCard(categoryNode, categoryCollection, depth = 0, parentName = '', pathIds = []) {
  const card = document.createElement('article');
  card.className = `category-card ${depth === 0 ? 'category-card-root' : 'category-card-sub'}`;
  card.dataset.categoryId = categoryNode.id;
  const categoryPathIds = Array.isArray(pathIds) && pathIds.length ? [...pathIds] : [categoryNode.id];
  const head = document.createElement('div');
  head.className = 'category-card-head';
  const childNodes = Array.isArray(categoryNode.children) ? categoryNode.children : [];
  const allItemsProxyNode = childNodes.length === 1 && /^all items$/i.test(String(childNodes[0]?.name || '').trim())
    ? childNodes[0]
    : null;
  const hasSubcategories = childNodes.length > 0 && !allItemsProxyNode;
  const renderedChildNodes = hasSubcategories ? childNodes : [];
  const toggleExpanded = () => {
    const isFocusedImageRoot = activeView === 'image'
      && activeCategoryPath.length === 0
      && depth === 0
      && activeImageRootCategoryId
      && activeImageRootCategoryId === categoryNode.id;
    if (expandedCategoryIds.has(categoryNode.id)) {
      if (isFocusedImageRoot) {
        activeImageRootCategoryId = '';
        expandedCategoryIds.clear();
        lastExpandedCategoryId = '';
        renderBoardDetail();
        return;
      }
      expandedCategoryIds.delete(categoryNode.id);
      if (lastExpandedCategoryId === categoryNode.id) {
        lastExpandedCategoryId = '';
      }
    } else {
      expandedCategoryIds.add(categoryNode.id);
      lastExpandedCategoryId = categoryNode.id;
    }
    renderBoardDetail();
  };
  head.addEventListener('click', (event) => {
    if (event.target && event.target.closest('button,input,textarea,a')) return;
    toggleExpanded();
  });
  head.setAttribute('draggable', 'true');
  head.addEventListener('dragstart', (event) => {
    if (event.target && event.target.closest('button,input,textarea,a')) {
      event.preventDefault();
      return;
    }
    draggingCategoryId = categoryNode.id;
    draggingCategorySourceCollection = categoryCollection;
    document.body.classList.add('dragging-category');
    card.classList.add('is-dragging');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-category-id', categoryNode.id);
    }
  });
  head.addEventListener('dragend', () => {
    draggingCategoryId = null;
    draggingCategorySourceCollection = null;
    document.body.classList.remove('dragging-category');
    card.classList.remove('is-dragging');
    clearCategoryDropStyles();
  });

  card.addEventListener('dragover', (event) => {
    const nearestCard = event.target instanceof Element ? event.target.closest('.category-card') : null;
    if (nearestCard && nearestCard !== card) return;
    const draggedCategoryId = getDraggedCategoryId(event);
    if (draggedCategoryId) {
      if (draggingCategorySourceCollection !== categoryCollection || draggedCategoryId === categoryNode.id) return;
      event.preventDefault();
      event.stopPropagation();
      card.classList.remove('category-drop-over');
      card.classList.remove('category-reorder-above', 'category-reorder-below');
      const bounds = card.getBoundingClientRect();
      const insertAfter = event.clientY > bounds.top + bounds.height / 2;
      card.classList.add('category-reorder-over', insertAfter ? 'category-reorder-below' : 'category-reorder-above');
      return;
    }
    const draggedId = getDraggedItemId(event);
    if (!draggedId) return;
    event.preventDefault();
    event.stopPropagation();
    card.classList.add('category-drop-over');
  });
  card.addEventListener('dragleave', () => {
    card.classList.remove('category-drop-over');
    card.classList.remove('category-reorder-over', 'category-reorder-above', 'category-reorder-below');
  });
  card.addEventListener('drop', (event) => {
    const nearestCard = event.target instanceof Element ? event.target.closest('.category-card') : null;
    if (nearestCard && nearestCard !== card) return;
    const draggedCategoryId = getDraggedCategoryId(event);
    if (draggedCategoryId) {
      event.preventDefault();
      event.stopPropagation();
      const bounds = card.getBoundingClientRect();
      const insertAfter = event.clientY > bounds.top + bounds.height / 2;
      card.classList.remove('category-reorder-over', 'category-reorder-above', 'category-reorder-below');
      moveCategoryWithinCollection(categoryCollection, draggedCategoryId, categoryNode.id, insertAfter ? 'after' : 'before');
      return;
    }
    const draggedId = getDraggedItemId(event);
    if (!draggedId) return;
    event.preventDefault();
    event.stopPropagation();
    card.classList.remove('category-drop-over');
    moveItemToCategory(draggedId, categoryNode.id);
  });
  card.addEventListener('dragend', () => {
    draggingCategoryItemId = null;
    draggingCategoryId = null;
    draggingCategorySourceCollection = null;
    document.body.classList.remove('dragging-category');
    card.classList.remove('category-drop-over');
    card.classList.remove('category-reorder-over', 'category-reorder-above', 'category-reorder-below');
    clearCategoryDropStyles();
  });
  const titleGroup = document.createElement('div');
  titleGroup.className = 'category-card-title-group';
  const titleRow = document.createElement('div');
  titleRow.className = 'category-card-title-row';
  const titleBtn = document.createElement('button');
  titleBtn.type = 'button';
  titleBtn.className = 'category-card-title-btn';
  titleBtn.textContent = categoryNode.name;
  titleBtn.setAttribute('aria-label', `Rename ${categoryNode.name || 'category'}`);
  titleBtn.title = 'Click to rename category';
  const editCategoryTitle = () => {
    startInlineEdit({
      container: titleBtn,
      initialValue: categoryNode.name || '',
      type: 'text',
      placeholder: 'Category name',
      onSave: (next) => {
        categoryNode.name = next || 'Untitled Category';
      }
    });
  };
  titleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    editCategoryTitle();
  });
  const previewImages = getCategoryPreviewImages(categoryNode, 5);
  if (previewImages.length) {
    card.classList.add('has-category-previews');
    const previewStrip = document.createElement('div');
    previewStrip.className = 'category-card-preview-strip';
    for (const src of previewImages) {
      const img = document.createElement('img');
      img.className = 'category-card-preview-image';
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      previewStrip.appendChild(img);
    }
    titleRow.appendChild(previewStrip);
  }
  titleRow.prepend(titleBtn);

  const controls = document.createElement('div');
  controls.className = 'category-card-controls';
  const controlsRow = document.createElement('div');
  controlsRow.className = 'category-card-controls-row';
  const canAddSubcategory = depth === 0;
  const isExpanded = expandedCategoryIds.has(categoryNode.id);
  if (isExpanded) card.classList.add('is-expanded');
  const addSubBtn = document.createElement('button');
  addSubBtn.type = 'button';
  addSubBtn.className = 'category-card-sub-btn ghost-btn';
  addSubBtn.textContent = 'Add Subcategory';
  addSubBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    pendingCategoryParentId = categoryNode.id;
    openNewBoardDialog('category');
  });

  const arrowBtn = document.createElement('button');
  arrowBtn.type = 'button';
  arrowBtn.className = 'category-card-toggle-btn';
  arrowBtn.innerHTML = `<span class="category-card-arrow">${isExpanded ? '▾' : '▸'}</span>`;
  arrowBtn.setAttribute('aria-label', isExpanded ? 'Collapse category' : 'Expand category');
  arrowBtn.addEventListener('click', () => {
    toggleExpanded();
  });

  titleGroup.appendChild(titleRow);
  const headMain = document.createElement('div');
  headMain.className = 'category-card-head-main';
  const moreWrapper = document.createElement('div');
  moreWrapper.className = 'category-card-more';

  const menuToggleBtn = document.createElement('button');
  menuToggleBtn.type = 'button';
  menuToggleBtn.className = 'category-card-more-btn ghost-btn';
  menuToggleBtn.textContent = '⋯';
  menuToggleBtn.setAttribute('aria-label', 'Category actions');
  menuToggleBtn.setAttribute('aria-haspopup', 'true');
  menuToggleBtn.setAttribute('aria-expanded', 'false');

  const moreMenu = document.createElement('div');
  moreMenu.className = 'category-card-more-menu';
  if (depth > 0) moreMenu.classList.add('category-card-more-menu-side');
  moreMenu.hidden = true;
  moreMenu.addEventListener('click', (event) => event.stopPropagation());

  const toggleMenu = (open) => {
    if (open) {
      if (activeCategoryMenu && activeCategoryMenu !== moreMenu) {
        activeCategoryMenu.hidden = true;
      }
      menuToggleBtn.setAttribute('aria-expanded', 'true');
      moreMenu.hidden = false;
      activeCategoryMenu = moreMenu;
      activeCategoryMenuToggle = menuToggleBtn;
      return;
    }
    moreMenu.hidden = true;
    menuToggleBtn.setAttribute('aria-expanded', 'false');
    if (activeCategoryMenu === moreMenu) {
      activeCategoryMenu = null;
      activeCategoryMenuToggle = null;
    }
  };

  const handleDeleteCategory = async () => {
    toggleMenu(false);
    const itemCount = collectAllItemsFromCategory(categoryNode).length;
    if (itemCount > 0) {
      const confirmed = await confirmDeleteCategoryWithItems();
      if (!confirmed) return;
    }
    const index = categoryCollection.findIndex((entry) => entry.id === categoryNode.id);
    if (index < 0) return;
    categoryCollection.splice(index, 1);
    expandedCategoryIds.delete(categoryNode.id);
    saveData();
    renderBoardDetail();
  };

  const deleteActionBtn = document.createElement('button');
  deleteActionBtn.type = 'button';
  deleteActionBtn.className = 'category-card-delete-action';
  const deleteIcon = document.createElement('span');
  deleteIcon.className = 'category-card-menu-icon';
  deleteIcon.setAttribute('aria-hidden', 'true');
  deleteIcon.textContent = '🗑';
  const deleteText = document.createElement('span');
  deleteText.textContent = depth > 0 ? 'Delete Subcategory' : 'Delete category';
  deleteActionBtn.appendChild(deleteIcon);
  deleteActionBtn.appendChild(deleteText);
  deleteActionBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    handleDeleteCategory();
  });

  const shareActionBtn = document.createElement('button');
  shareActionBtn.type = 'button';
  shareActionBtn.className = 'category-card-delete-action';
  const shareIcon = document.createElement('span');
  shareIcon.className = 'category-card-menu-icon';
  shareIcon.setAttribute('aria-hidden', 'true');
  shareIcon.textContent = '↗';
  const shareText = document.createElement('span');
  shareText.textContent = depth > 0 ? 'Share Subcategory' : 'Share category';
  shareActionBtn.appendChild(shareIcon);
  shareActionBtn.appendChild(shareText);
  shareActionBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu(false);
    copyCategoryShareLink(getActiveBoard(), categoryPathIds);
  });

  menuToggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu(moreMenu.hidden);
  });

  moreMenu.appendChild(shareActionBtn);
  moreMenu.appendChild(deleteActionBtn);
  moreWrapper.appendChild(menuToggleBtn);
  moreWrapper.appendChild(moreMenu);

  if (canAddSubcategory) controlsRow.appendChild(addSubBtn);
  controlsRow.appendChild(moreWrapper);
  controlsRow.appendChild(arrowBtn);
  controls.appendChild(controlsRow);
  headMain.appendChild(titleGroup);
  headMain.appendChild(controls);
  head.appendChild(headMain);
  card.appendChild(head);

  const body = document.createElement('div');
  body.className = `category-card-body${isExpanded ? '' : ' hidden'}`;

  const editableCollection = allItemsProxyNode
    ? (Array.isArray(allItemsProxyNode.items) ? allItemsProxyNode.items : [])
    : (Array.isArray(categoryNode.items) ? categoryNode.items : []);
  const previewItems = editableCollection;
  if (previewItems.length) {
    const previewWrap = document.createElement('div');
    previewWrap.className = 'category-item-preview-wrap';
    const previewTitle = document.createElement('p');
    previewTitle.className = 'category-item-preview-title';
    previewTitle.textContent = 'Items';
    previewWrap.appendChild(previewTitle);
    if (activeView === 'image') {
      previewWrap.appendChild(buildCategoryItemsImageGrid(previewItems, editableCollection));
    } else {
      previewWrap.appendChild(buildCategoryItemsTable(previewItems, editableCollection, categoryNode));
    }
    body.appendChild(previewWrap);
  }

  const nestedChildren = document.createElement('div');
  nestedChildren.className = 'category-sub-list';
  body.appendChild(nestedChildren);

  card.appendChild(body);
  return {
    card,
    childNodes: renderedChildNodes,
    childHost: nestedChildren,
    isExpanded
  };
}

function confirmDeleteCategoryWithItems() {
  const message = 'Are you sure you want to delete this category? These items will be unavailable after you delete them.';
  if (!categoryDeleteDialog || !categoryDeleteMessage) {
    return Promise.resolve(window.confirm(message));
  }
  categoryDeleteMessage.textContent = message;
  return new Promise((resolve) => {
    pendingCategoryDeleteResolve = resolve;
    if (!categoryDeleteDialog.open) categoryDeleteDialog.showModal();
  });
}

function closeEditCategoriesInline() {
  finishCategoryHeaderPointerDrag(null, true);
  fieldEditorScopeCategoryId = '';
  draggingHeaderCategoryId = '';
  clearCategoryHeaderDragStyles();
  categoryEditorDraft = [];
  isEditingCategoryHeaders = false;
}

function renderAddCategoryOptions(board) {
  if (!addCategorySelect) return;
  const previousValue = addCategoryTargetValue;
  const targets = collectCategoryOptionTargets(board);
  addCategorySelect.innerHTML = '';
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '__placeholder__';
  placeholderOption.textContent = 'Category';
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  placeholderOption.hidden = true;
  addCategorySelect.appendChild(placeholderOption);
  const autoOption = document.createElement('option');
  autoOption.value = '__auto__';
  autoOption.textContent = 'Auto Categorize';
  addCategorySelect.appendChild(autoOption);
  for (const target of targets) {
    const opt = document.createElement('option');
    opt.value = encodeCategoryPath(target.pathIds);
    const indent = target.depth > 0 ? `${'\u00A0\u00A0\u00A0'.repeat(target.depth)}` : '';
    opt.textContent = `${indent}${target.label}`;
    addCategorySelect.appendChild(opt);
  }
  if (previousValue && targets.some((target) => encodeCategoryPath(target.pathIds) === previousValue)) {
    addCategorySelect.value = previousValue;
  } else if (previousValue === '__auto__') {
    addCategorySelect.value = '__auto__';
  } else {
    addCategorySelect.value = '__placeholder__';
    addCategoryTargetValue = '';
  }
}

function buildCategoryItemsTable(items, itemCollection, categoryNode = null) {
  const stack = document.createElement('div');
  stack.className = 'category-item-table-stack';
  const wrap = document.createElement('div');
  wrap.className = 'category-item-table-wrap';
  const table = document.createElement('table');
  table.className = 'category-item-table';
  const board = getActiveBoard();
  const scopeCategoryId = getFieldContextCategoryId(board, { categoryNode });
  const categories = getRenderableFieldCategories(board, { scopeCategoryId });
  const showFieldEditControls = isEditingFieldScope(scopeCategoryId);

  if (showFieldEditControls) {
    const fieldEditControls = document.createElement('div');
    fieldEditControls.className = 'field-header-edit-controls';

    const addFieldBtn = document.createElement('button');
    addFieldBtn.type = 'button';
    addFieldBtn.className = 'add-category-inline-btn';
    addFieldBtn.textContent = '+';
    addFieldBtn.setAttribute('aria-label', 'Add field');
    addFieldBtn.title = 'Add field';
    fieldEditControls.appendChild(addFieldBtn);

    const cancelEditBtn = document.createElement('button');
    cancelEditBtn.type = 'button';
    cancelEditBtn.className = 'cancel-categories-inline-btn';
    cancelEditBtn.textContent = 'Cancel';
    fieldEditControls.appendChild(cancelEditBtn);

    const saveEditBtn = document.createElement('button');
    saveEditBtn.type = 'button';
    saveEditBtn.className = 'save-categories-inline-btn';
    saveEditBtn.textContent = 'Save';
    fieldEditControls.appendChild(saveEditBtn);

    stack.appendChild(fieldEditControls);
  }

  renderTableHeadForCategories(table, categories, {
    withEditButton: true,
    editMode: isEditingFieldScope(scopeCategoryId),
    allowFieldEditorTrigger: true,
    fieldScopeCategoryId: scopeCategoryId
  });
  table.appendChild(document.createElement('tbody'));
  const tbody = table.querySelector('tbody');
  if (tbody) {
    renderItemRows(tbody, items, {
      moveItemBeforeFn: (sourceId, targetId, insertAfter = false) =>
        moveItemBeforeInCollection(itemCollection, sourceId, targetId, insertAfter),
      removeItemFn: (itemId) => removeItemFromCollection(itemCollection, itemId),
      fieldCategories: categories
    });
  }
  wrap.appendChild(table);
  stack.appendChild(wrap);
  return stack;
}

function buildCategoryItemsReadOnlyTable(items, categoryNode = null) {
  const stack = document.createElement('div');
  stack.className = 'category-item-table-stack';
  const wrap = document.createElement('div');
  wrap.className = 'category-item-table-wrap';
  const table = document.createElement('table');
  table.className = 'category-item-table';
  const board = getActiveBoard();
  const scopeCategoryId = getFieldContextCategoryId(board, { categoryNode });
  const categories = getRenderableFieldCategories(board, { scopeCategoryId });
  const showFieldEditControls = isEditingFieldScope(scopeCategoryId);

  if (showFieldEditControls) {
    const fieldEditControls = document.createElement('div');
    fieldEditControls.className = 'field-header-edit-controls';

    const addFieldBtn = document.createElement('button');
    addFieldBtn.type = 'button';
    addFieldBtn.className = 'add-category-inline-btn';
    addFieldBtn.textContent = '+';
    addFieldBtn.setAttribute('aria-label', 'Add field');
    addFieldBtn.title = 'Add field';
    fieldEditControls.appendChild(addFieldBtn);

    const cancelEditBtn = document.createElement('button');
    cancelEditBtn.type = 'button';
    cancelEditBtn.className = 'cancel-categories-inline-btn';
    cancelEditBtn.textContent = 'Cancel';
    fieldEditControls.appendChild(cancelEditBtn);

    const saveEditBtn = document.createElement('button');
    saveEditBtn.type = 'button';
    saveEditBtn.className = 'save-categories-inline-btn';
    saveEditBtn.textContent = 'Save';
    fieldEditControls.appendChild(saveEditBtn);

    stack.appendChild(fieldEditControls);
  }

  renderTableHeadForCategories(table, categories, {
    withEditButton: true,
    editMode: isEditingFieldScope(scopeCategoryId),
    allowFieldEditorTrigger: true,
    fieldScopeCategoryId: scopeCategoryId
  });
  table.appendChild(document.createElement('tbody'));

  const tbody = table.querySelector('tbody');
  if (tbody) {
    const customCategories = categories.filter((entry) => !entry.isDefault);
    for (const item of items) {
      const tr = document.createElement('tr');
      const image = getItemPrimaryImage(item);
      const highlights = normalizeHighlights(item.highlights || []);
      const feedbacks = normalizeFeedbacks(item.feedbacks || []);
      const firstFeedback = feedbacks[0];
      const highlightsHtml = highlights.length
        ? `<ul class="category-inline-highlights">${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`
        : '<span class="muted-highlight">None</span>';
      const feedbackHtml = firstFeedback
        ? `
          <div class="category-inline-feedback">
            <span class="feedback-badge">${escapeHtml(firstFeedback.initials || getInitialsFromName(firstFeedback.author || currentUserName))}</span>
            <div class="feedback-content">
              ${firstFeedback.text ? `<p class="feedback-text">${escapeHtml(firstFeedback.text)}</p>` : ''}
              ${Array.isArray(firstFeedback.emojis) && firstFeedback.emojis.length ? `<p class="feedback-emojis">${escapeHtml(firstFeedback.emojis.join(' '))}</p>` : ''}
            </div>
          </div>
        `
        : '<span class="muted-highlight">No feedback yet</span>';
      tr.innerHTML = `
        <td>${image ? `<img class="category-mini-image item-hover-zoom" src="${escapeHtml(image)}" alt="${escapeHtml(item.name || 'Product image')}" loading="lazy" />` : '<span class="muted-highlight">No image</span>'}</td>
        <td class="category-inline-name">${escapeHtml(item.name || 'Untitled item')}</td>
        <td>${escapeHtml(item.seller || 'Unknown')}</td>
        <td>${escapeHtml(formatPrice(item.price) || 'N/A')}</td>
        <td>${highlightsHtml}</td>
        <td>${feedbackHtml}</td>
      `;
      for (const category of customCategories) {
        const customCell = document.createElement('td');
        customCell.className = 'custom-field-cell';
        const customEntry = item?.customFieldValues?.[category.id];
        const text = formatCustomFieldValue(category, customEntry);
        customCell.textContent = text || '—';
        if (!text) customCell.classList.add('custom-field-empty');
        tr.appendChild(customCell);
      }
      tr.classList.add('item-row');
      applyFavoriteRankClass(tr, item);
      tr.setAttribute('draggable', 'true');
      tr.dataset.itemId = item.id;
      tr.addEventListener('dragstart', (event) => {
        if (event.target && event.target.closest('button,a,input,textarea')) {
          event.preventDefault();
          return;
        }
        draggingItemId = item.id;
        draggingCategoryItemId = item.id;
        tr.classList.add('is-dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', item.id);
          event.dataTransfer.setData('application/x-item-id', item.id);
        }
      });
      tr.addEventListener('dragend', () => {
        draggingItemId = null;
        draggingCategoryItemId = null;
        tr.classList.remove('is-dragging');
        clearDragStyles();
      });
      tr.addEventListener('click', (event) => {
        if (event.target && event.target.closest('a,button,input,textarea')) return;
        openDetailModal(item.id);
      });
      const imagePreviewTarget = tr.querySelector('.item-hover-zoom');
      if (imagePreviewTarget) {
        bindImageFallbackToItem(imagePreviewTarget, item, getItemImages(item));
        imagePreviewTarget.addEventListener('mouseenter', () => {
          showHoverPreview(item.id);
        });
        imagePreviewTarget.addEventListener('mouseleave', () => {
          scheduleHoverPreviewHide();
        });
      }
      tbody.appendChild(tr);
    }
  }
  wrap.appendChild(table);
  stack.appendChild(wrap);
  return stack;
}

function startBoardTitleEdit() {
  const board = getActiveBoard();
  if (!board) return;
  isEditingBoardTitle = true;
  boardTitleInput.value = board.name;
  boardTitleWrap.classList.add('hidden');
  boardTitleInput.classList.remove('hidden');
  boardTitleInput.focus();
  boardTitleInput.select();
}

function commitBoardTitleEdit() {
  const board = getActiveBoard();
  if (!board) return;
  const nextName = boardTitleInput.value.trim();
  if (nextName) board.name = nextName;
  saveData();
  renderBoardDetail();
}

function cancelBoardTitleEdit() {
  renderBoardDetail();
}

function renderListView(items) {
  body.innerHTML = '';
  const board = getActiveBoard();
  const scopeCategoryId = getFieldContextCategoryId(board, { useActive: true });
  const categories = getRenderableFieldCategories(board, { scopeCategoryId });
  const columnCount = Math.max(1, categories.length);
  const hasSubcategories = board ? getCurrentCategoryChildren(board).length > 0 : false;
  const boardHasNoItems = board ? getAllBoardItems(board).length === 0 : !items.length;
  const shouldShowListSection = items.length > 0 || !hasSubcategories || boardHasNoItems;
  const showListSectionInCurrentView = (activeView === 'list' || boardHasNoItems) && shouldShowListSection;
  listViewSection.classList.toggle('hidden', !showListSectionInCurrentView);

  if (!shouldShowListSection) {
    return;
  }

  if (!items.length) {
    const tr = document.createElement('tr');
    tr.className = 'empty-message';
    tr.innerHTML = hasSubcategories
      ? `<td colspan="${columnCount}">This level has subcategories. Open one, or switch to Image View to browse grouped items.</td>`
      : `<td colspan="${columnCount}">No items in this board yet. Paste a link to add one.</td>`;
    body.appendChild(tr);
    return;
  }

  renderItemRows(body, items, {
    moveItemBeforeFn: moveItemBefore,
    removeItemFn: removeItem,
    fieldCategories: categories
  });
}

function renderItemRows(targetBody, items, options = {}) {
  const moveItemBeforeFn = typeof options.moveItemBeforeFn === 'function' ? options.moveItemBeforeFn : moveItemBefore;
  const removeItemFn = typeof options.removeItemFn === 'function' ? options.removeItemFn : removeItem;
  const board = getActiveBoard();
  const categories = Array.isArray(options.fieldCategories) && options.fieldCategories.length
    ? options.fieldCategories
    : getRenderableFieldCategories(board);
  for (const item of items) {
    const row = document.createElement('tr');
    row.classList.add('item-row');
    applyFavoriteRankClass(row, item);
    row.setAttribute('draggable', 'true');
    row.dataset.itemId = item.id;

    row.addEventListener('dragstart', (event) => {
      if (event.target && event.target.closest('button,a,input,textarea')) {
        event.preventDefault();
        return;
      }
      draggingItemId = item.id;
      draggingCategoryItemId = item.id;
      row.classList.add('is-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', item.id);
        event.dataTransfer.setData('application/x-item-id', item.id);
      }
    });

    row.addEventListener('dragover', (event) => {
      const canReorderInPlace = draggingItemId && collectionHasItem(items, draggingItemId);
      if (canReorderInPlace && draggingItemId !== item.id) {
        event.preventDefault();
        event.stopPropagation();
        const insertAfter = shouldInsertItemAfter(row, event, 'y');
        row.classList.toggle('drag-insert-before', !insertAfter);
        row.classList.toggle('drag-insert-after', insertAfter);
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-insert-before', 'drag-insert-after');
    });

    row.addEventListener('drop', (event) => {
      const canReorderInPlace = draggingItemId && collectionHasItem(items, draggingItemId);
      if (!canReorderInPlace || !draggingItemId || draggingItemId === item.id) return;
      event.preventDefault();
      event.stopPropagation();
      const insertAfter = shouldInsertItemAfter(row, event, 'y');
      row.classList.remove('drag-insert-before', 'drag-insert-after');
      moveItemBeforeFn(draggingItemId, item.id, insertAfter);
    });

    row.addEventListener('dragend', () => {
      draggingItemId = null;
      draggingCategoryItemId = null;
      row.classList.remove('is-dragging');
      clearDragStyles();
    });

    let feedbackCell = null;
    for (const category of categories) {
      const cell = buildItemCellForCategory(row, item, category, board);
      if (category.slug === 'feedback') feedbackCell = cell;
      row.appendChild(cell);
    }

    if (feedbackCell) {
      const rowActions = buildRowActions();
      feedbackCell.appendChild(rowActions);
    }

    const rowRankBtn = row.querySelector('.row-rank-btn');
    const rowOpenBtn = row.querySelector('.row-open-btn');
    const rowRemoveBtn = row.querySelector('.row-remove-btn');
    if (rowRankBtn) {
      rowRankBtn.classList.toggle('active', Boolean(getItemFavoriteRank(item)));
      rowRankBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        openRankMenu(item.id, rowRankBtn);
      });
    }
    if (rowOpenBtn) {
      rowOpenBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
      });
    }
    if (rowRemoveBtn) rowRemoveBtn.addEventListener('click', () => removeItemFn(item.id));
    row.addEventListener('click', (event) => {
      if (event.target && event.target.closest('button,a,input,textarea')) return;
      openDetailModal(item.id);
    });

    targetBody.appendChild(row);
  }

  wireTableBodyDropToEnd(targetBody, items, moveItemBeforeFn);
}

function buildRowActions() {
  const rowActions = document.createElement('div');
  rowActions.className = 'row-hover-actions';
  rowActions.setAttribute('aria-label', 'Item actions');
  rowActions.innerHTML = `
    <button class="row-rank-btn icon-btn rank-btn" type="button" aria-label="Set medal rank">🏅</button>
    <button class="row-open-btn icon-btn" type="button" aria-label="Open website">🌐</button>
    <button class="row-remove-btn icon-btn danger" type="button" aria-label="Remove item">🗑</button>
  `;
  return rowActions;
}

function buildItemCellForCategory(row, item, category, board) {
  if (category.slug === 'image') {
    const cell = document.createElement('td');
    cell.className = 'image-cell';
    const itemImages = getItemImages(item);
    const displayImage = itemImages[0] || item.image || '';
    cell.innerHTML = displayImage
      ? `<img class="item-hover-zoom" src="${escapeHtml(displayImage)}" alt="${escapeHtml(item.name)}" loading="lazy" />`
      : '<span>No image</span>';
    const imageEditTarget = cell.querySelector('img');
    if (imageEditTarget) {
      bindImageFallbackToItem(imageEditTarget, item, itemImages);
      imageEditTarget.style.cursor = 'zoom-in';
      imageEditTarget.title = 'Preview images';
      imageEditTarget.addEventListener('mouseenter', () => {
        showHoverPreview(item.id);
      });
      imageEditTarget.addEventListener('mouseleave', () => {
        scheduleHoverPreviewHide();
      });
    }
    return cell;
  }

  if (category.slug === 'item_name') {
    const cell = document.createElement('td');
    cell.className = 'name-cell';
    cell.innerHTML = `<span class="item-link editable-token">${escapeHtml(item.name)}</span>`;
    const token = cell.querySelector('.editable-token');
    if (token) token.addEventListener('click', (event) => {
      event.stopPropagation();
      startInlineEdit({
        container: token,
        initialValue: item.name || '',
        type: 'text',
        placeholder: 'Item name',
        onSave: (next) => {
          item.name = normalizeItemName(next || 'Untitled item', item.url || '');
        }
      });
    });
    return cell;
  }

  if (category.slug === 'seller') {
    const cell = document.createElement('td');
    cell.className = 'seller-cell';
    cell.innerHTML = `<span class="editable-token">${escapeHtml(item.seller || 'Unknown')}</span>`;
    const token = cell.querySelector('.editable-token');
    if (token) token.addEventListener('click', (event) => {
      event.stopPropagation();
      startInlineEdit({
        container: token,
        initialValue: item.seller || '',
        type: 'text',
        placeholder: 'Seller website',
        onSave: (next) => {
          item.seller = next || 'Unknown';
        }
      });
    });
    return cell;
  }

  if (category.slug === 'price') {
    const cell = document.createElement('td');
    cell.className = 'price-cell';
    cell.innerHTML = `<span class="editable-token">${escapeHtml(formatPrice(item.price) || 'N/A')}</span>`;
    const token = cell.querySelector('.editable-token');
    if (token) token.addEventListener('click', (event) => {
      event.stopPropagation();
      startInlineEdit({
        container: token,
        initialValue: formatPrice(item.price) || '',
        type: 'text',
        placeholder: '$799',
        onSave: (next) => {
          item.price = formatPrice(next || '');
        }
      });
    });
    return cell;
  }

  if (category.slug === 'highlights') {
    const cell = document.createElement('td');
    cell.className = 'highlights-cell';
    const highlightsList = document.createElement('ul');
    highlightsList.className = 'table-highlights editable-token';
    const highlights = normalizeHighlights(item.highlights);
    if (!highlights.length) {
      const li = document.createElement('li');
      li.className = 'muted-highlight';
      li.textContent = 'None';
      highlightsList.appendChild(li);
    } else {
      for (const highlight of highlights) {
        const li = document.createElement('li');
        li.textContent = highlight;
        highlightsList.appendChild(li);
      }
    }
    highlightsList.addEventListener('click', (event) => {
      if (event.target && event.target.closest('button')) return;
      event.stopPropagation();
      startInlineEdit({
        container: highlightsList,
        initialValue: formatHighlightsForEditor(highlights),
        type: 'textarea',
        placeholder: '• One highlight per line',
        onSave: (next) => {
          item.highlights = parseHighlightsText(next || '');
        },
        onReady: (field) => {
          attachHighlightsEditorHandlers(field);
          const length = typeof field.value === 'string' ? field.value.length : 0;
          field.setSelectionRange(length, length);
        }
      });
    });
    cell.appendChild(highlightsList);
    return cell;
  }

  if (category.slug === 'feedback') {
    const cell = document.createElement('td');
    cell.className = 'feedback-cell';
    renderFeedbackCell(cell, item);
    return cell;
  }

  return buildCustomFieldCell(board, item, category);
}

function buildCustomFieldCell(board, item, category) {
  const cell = document.createElement('td');
  cell.className = 'custom-field-cell';
  const token = document.createElement('span');
  token.className = 'editable-token';
  const entry = item?.customFieldValues?.[category.id] || null;
  const display = formatCustomFieldValue(category, entry);
  if (display) {
    token.textContent = display;
  } else {
    token.textContent = '—';
    token.classList.add('custom-field-empty');
    cell.classList.add('custom-field-empty');
  }
  token.addEventListener('click', (event) => {
    event.stopPropagation();
    startCustomFieldEdit({ board, item, category, container: token });
  });
  cell.appendChild(token);
  return cell;
}

function startCustomFieldEdit({ board, item, category, container }) {
  if (!container || container.dataset.editing === 'true') return;
  if (category.type === 'boolean' || category.type === 'select') {
    startCustomSelectEdit({ board, item, category, container });
    return;
  }

  const current = item?.customFieldValues?.[category.id];
  startInlineEdit({
    container,
    initialValue: current?.value ?? '',
    type: 'text',
    placeholder: category.type === 'number' ? 'Type a number' : 'Type value',
    onSave: (next) => {
      const parsed = parseCustomFieldInput(category, next);
      if (!parsed.valid) {
        setStatus(parsed.error || 'Invalid value.', true);
        return;
      }
      setItemCustomFieldValue(item, category, parsed.value, { source: 'user' });
      const persisted = item?.customFieldValues?.[category.id] || { value: null, source: 'user' };
      if (board?.id && item?.id) queueSyncCustomValue(board.id, item.id, category.id, persisted);
    }
  });
}

function startCustomSelectEdit({ board, item, category, container }) {
  container.dataset.editing = 'true';
  const current = item?.customFieldValues?.[category.id];
  const currentValue = current?.value;
  const select = document.createElement('select');
  select.className = 'inline-editor';
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '—';
  select.appendChild(emptyOption);
  if (category.type === 'boolean') {
    const yesOption = document.createElement('option');
    yesOption.value = 'true';
    yesOption.textContent = 'Yes';
    select.appendChild(yesOption);
    const noOption = document.createElement('option');
    noOption.value = 'false';
    noOption.textContent = 'No';
    select.appendChild(noOption);
    select.value = currentValue === true ? 'true' : currentValue === false ? 'false' : '';
  } else {
    const options = normalizedAllowedOptions(category.allowedOptions || []);
    for (const option of options) {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    }
    select.value = currentValue == null ? '' : String(currentValue);
  }

  const closeEditor = () => {
    delete container.dataset.editing;
    saveData();
    renderBoardDetail();
  };

  const commit = () => {
    const selected = category.type === 'boolean'
      ? (select.value === '' ? null : select.value === 'true')
      : (select.value || null);
    setItemCustomFieldValue(item, category, selected, { source: 'user' });
    const persisted = item?.customFieldValues?.[category.id] || { value: null, source: 'user' };
    if (board?.id && item?.id) queueSyncCustomValue(board.id, item.id, category.id, persisted);
    closeEditor();
  };

  select.addEventListener('click', (event) => event.stopPropagation());
  select.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeEditor();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }
  });
  select.addEventListener('blur', commit);
  select.addEventListener('change', commit);

  container.innerHTML = '';
  container.appendChild(select);
  select.focus();
}

function showHoverPreview(itemId) {
  const board = getActiveBoard();
  if (!board || !hoverPreview || !hoverPreviewImage) return;
  const item = findItemInBoard(board, itemId);
  if (!item) return;
  const images = getItemImages(item);
  if (!images.length) return;
  cancelHoverPreviewHide();
  hoverPreviewItemId = itemId;
  hoverPreviewImages = images;
  hoverPreviewIndex = Math.max(0, Math.min(hoverPreviewIndex, hoverPreviewImages.length - 1));
  renderHoverPreview();
  hoverPreview.classList.remove('hidden');
  hoverPreview.setAttribute('aria-hidden', 'false');
}

function scheduleHoverPreviewHide() {
  cancelHoverPreviewHide();
  hoverPreviewHideTimer = setTimeout(() => {
    hideHoverPreview();
  }, 140);
}

function cancelHoverPreviewHide() {
  if (!hoverPreviewHideTimer) return;
  clearTimeout(hoverPreviewHideTimer);
  hoverPreviewHideTimer = null;
}

function hideHoverPreview() {
  if (!hoverPreview || !hoverPreviewImage) return;
  const shouldCloseAddDialog = Boolean(
    hoverAddDialog?.open
    && activeAddImageItemId != null
    && hoverPreviewItemId != null
    && activeAddImageItemId === hoverPreviewItemId
  );
  hoverPreview.classList.add('hidden');
  hoverPreview.setAttribute('aria-hidden', 'true');
  hoverPreviewImage.removeAttribute('src');
  if (hoverPreviewThumbs) hoverPreviewThumbs.innerHTML = '';
  if (shouldCloseAddDialog) hoverAddDialog.close();
  hoverPreviewItemId = null;
  hoverPreviewImages = [];
  hoverPreviewIndex = 0;
  cancelHoverPreviewHide();
}

function stepHoverPreview(delta) {
  if (!hoverPreviewImages.length || !hoverPreviewImage) return;
  const total = hoverPreviewImages.length;
  hoverPreviewIndex = (hoverPreviewIndex + delta + total) % total;
  renderHoverPreview();
}

function renderHoverPreview() {
  if (!hoverPreviewImage || !hoverPreviewImages.length) return;
  hoverPreviewImage.src = hoverPreviewImages[hoverPreviewIndex];
  const item = getHoverPreviewItem();
  const currentSrc = hoverPreviewImages[hoverPreviewIndex] || '';
  if (hoverPreviewStar) {
    const isMain = item
      ? canonicalImageKey(item.image || hoverPreviewImages[0]) === canonicalImageKey(currentSrc)
      : false;
    hoverPreviewStar.textContent = isMain ? '★' : '☆';
    hoverPreviewStar.title = isMain ? 'Cover image' : 'Set as cover image';
  }
  if (hoverPreviewDelete) {
    hoverPreviewDelete.title = 'Delete image';
    hoverPreviewDelete.setAttribute('aria-label', 'Delete image');
  }
  if (!hoverPreviewThumbs) return;
  hoverPreviewThumbs.innerHTML = '';
  hoverPreviewImages.forEach((src, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `hover-preview-thumb${index === hoverPreviewIndex ? ' active' : ''}`;
    btn.dataset.index = String(index);
    btn.innerHTML = `<img src="${escapeHtml(src)}" alt="Preview ${index + 1}" loading="lazy" />`;
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      hoverPreviewIndex = index;
      renderHoverPreview();
    });
    hoverPreviewThumbs.appendChild(btn);
  });
  ensureActiveHoverThumbVisible();
}

function getHoverPreviewItem() {
  const board = getActiveBoard();
  if (!board || !hoverPreviewItemId) return null;
  return findItemInBoard(board, hoverPreviewItemId);
}

function setCoverFromHoverPreview() {
  const item = getHoverPreviewItem();
  if (!item || !hoverPreviewImages.length) return;
  const src = hoverPreviewImages[hoverPreviewIndex];
  item.images = pinPrimaryImage([src, ...(item.images || []), item.image || ''], src);
  item.image = src;
  hoverPreviewImages = getItemImages(item);
  hoverPreviewIndex = findImageIndex(hoverPreviewImages, src);
  if (hoverPreviewIndex < 0) hoverPreviewIndex = 0;
  saveData();
  renderBoardDetail();
  renderHoverPreview();
}

function removeCurrentHoverPreviewImage() {
  const item = getHoverPreviewItem();
  if (!item || !hoverPreviewImages.length) return;
  const safeIndex = Math.max(0, Math.min(hoverPreviewIndex, hoverPreviewImages.length - 1));
  const currentImages = getItemImages(item);
  const remaining = currentImages.filter((_, index) => index !== safeIndex);
  const featuredStillExists = findImageIndex(remaining, item.image || '') >= 0
    ? (item.image || '')
    : '';
  const nextFeatured = featuredStillExists || remaining[0] || '';
  const nextImages = nextFeatured ? pinPrimaryImage(remaining, nextFeatured) : [];

  item.images = nextImages;
  item.image = nextFeatured;
  hoverPreviewImages = nextImages;

  if (!hoverPreviewImages.length) {
    saveData();
    renderBoardDetail();
    hideHoverPreview();
    return;
  }

  if (hoverPreviewIndex > hoverPreviewImages.length - 1) {
    hoverPreviewIndex = hoverPreviewImages.length - 1;
  }

  saveData();
  renderBoardDetail();
  renderHoverPreview();
}

function openAddImageDialogForItem(itemId) {
  if (!hoverAddDialog) return;
  const board = getActiveBoard();
  if (!board || itemId == null) return;
  const item = findItemInBoard(board, itemId);
  if (!item) return;
  activeAddImageItemId = itemId;
  if (hoverAddUrl) hoverAddUrl.value = '';
  if (hoverAddUploadInput) hoverAddUploadInput.value = '';
  hoverAddDropZone?.classList.remove('is-drag-over');
  if (!hoverAddDialog.open) hoverAddDialog.showModal();
  if (hoverAddUrl) setTimeout(() => hoverAddUrl.focus(), 0);
}

function getAddImageDialogItem() {
  const board = getActiveBoard();
  if (!board || activeAddImageItemId == null) return null;
  return findItemInBoard(board, activeAddImageItemId);
}

function addImageToItem(item, imageSrc) {
  const src = String(imageSrc || '').trim();
  if (!item || !src) return false;
  const existingImages = getItemImages(item);
  const currentPrimary = String(item.image || existingImages[0] || '').trim();
  const nextPrimary = currentPrimary || src;
  item.images = pinPrimaryImage([...(item.images || []), src, currentPrimary], nextPrimary);
  if (!item.image) item.image = nextPrimary;
  syncImageViewsAfterItemImageAdd(item, src);
  return true;
}

function syncImageViewsAfterItemImageAdd(item, addedSrc) {
  if (!item) return;
  const images = getItemImages(item);
  const addedIndex = findImageIndex(images, addedSrc);
  const fallbackIndex = Math.max(images.length - 1, 0);
  const nextIndex = addedIndex >= 0 ? addedIndex : fallbackIndex;

  if (hoverPreviewItemId === item.id) {
    hoverPreviewImages = images;
    hoverPreviewIndex = nextIndex;
  }

  if (activeDetailItemId === item.id) {
    activeDetailImageIndex = nextIndex;
  }

  renderBoardDetail();

  if (detailDialog?.open && activeDetailItemId === item.id) {
    renderDetailModal(item);
  }

  if (hoverPreviewItemId === item.id && hoverPreview && !hoverPreview.classList.contains('hidden')) {
    renderHoverPreview();
  }

  saveData();
}

function addImageUrlFromHoverPreview(overrideUrl = '') {
  const item = getAddImageDialogItem();
  const url = String(overrideUrl || hoverAddUrl?.value || '').trim();
  if (!item || !url) return;
  const didAdd = addImageToItem(item, url);
  if (!didAdd) return;
  if (hoverAddUrl) hoverAddUrl.value = '';
  if (hoverAddDialog?.open) hoverAddDialog.close();
}

function addUploadedImageFromHoverPreview(fileOverride = null) {
  const item = getAddImageDialogItem();
  if (!item) return;
  const file = fileOverride || hoverAddUploadInput?.files?.[0] || null;
  if (!file || !/^image\//i.test(String(file.type || ''))) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = String(reader.result || '').trim();
    if (!dataUrl) return;
    const optimizedDataUrl = await optimizeUploadedImageDataUrl(dataUrl);
    const didAdd = addImageToItem(item, optimizedDataUrl || dataUrl);
    if (!didAdd) return;
    if (hoverAddDialog?.open) hoverAddDialog.close();
  };
  reader.readAsDataURL(file);
}

async function optimizeUploadedImageDataUrl(dataUrl) {
  const raw = String(dataUrl || '').trim();
  if (!/^data:image\//i.test(raw)) return raw;
  // Small images are already cheap to store.
  if (raw.length <= 350_000) return raw;
  try {
    const image = await loadImageForProcessing(raw);
    const width = Number(image.naturalWidth || image.width || 0);
    const height = Number(image.naturalHeight || image.height || 0);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return raw;

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) return raw;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const compressed = canvas.toDataURL('image/jpeg', 0.84);
    if (!compressed || !/^data:image\//i.test(compressed)) return raw;
    return compressed.length < raw.length ? compressed : raw;
  } catch {
    return raw;
  }
}

function loadImageForProcessing(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode uploaded image.'));
    img.src = src;
  });
}

function getDroppedImageData(dataTransfer) {
  if (!dataTransfer) return { file: null, url: '' };
  const file = Array.from(dataTransfer.files || []).find((entry) => /^image\//i.test(String(entry.type || ''))) || null;
  if (file) return { file, url: '' };

  const uriList = String(dataTransfer.getData('text/uri-list') || '')
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry && !entry.startsWith('#'));
  const plain = String(dataTransfer.getData('text/plain') || '').trim();
  const urlCandidate = uriList || plain;
  const url = /^(https?:\/\/|data:image\/)/i.test(urlCandidate) ? urlCandidate : '';
  return { file: null, url };
}

function ensureActiveHoverThumbVisible() {
  if (!hoverPreviewThumbs) return;
  const activeThumb = hoverPreviewThumbs.querySelector('.hover-preview-thumb.active');
  if (!activeThumb) return;
  activeThumb.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  });
}

function buildImageItemCard(item, options = {}) {
  const moveItemBeforeFn = typeof options.moveItemBeforeFn === 'function'
    ? options.moveItemBeforeFn
    : moveItemBefore;
  const removeItemFn = typeof options.removeItemFn === 'function'
    ? options.removeItemFn
    : removeItem;
  const collectionItems = Array.isArray(options.collectionItems) ? options.collectionItems : null;

  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  applyFavoriteRankClass(card, item);
  card.setAttribute('draggable', 'true');
  card.dataset.itemId = item.id;

  card.addEventListener('dragstart', (event) => {
    if (event.target && event.target.closest('button,a,input,textarea')) {
      event.preventDefault();
      return;
    }
    draggingItemId = item.id;
    draggingCategoryItemId = item.id;
    card.classList.add('is-dragging');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.id);
      event.dataTransfer.setData('application/x-item-id', item.id);
    }
  });

  card.addEventListener('dragover', (event) => {
    const canReorderInPlace = draggingItemId && (!collectionItems || collectionHasItem(collectionItems, draggingItemId));
    if (canReorderInPlace && draggingItemId !== item.id) {
      event.preventDefault();
      event.stopPropagation();
      const insertAfter = shouldInsertItemAfter(card, event, 'auto');
      card.classList.toggle('drag-insert-before', !insertAfter);
      card.classList.toggle('drag-insert-after', insertAfter);
    }
  });

  card.addEventListener('dragleave', () => {
    card.classList.remove('drag-insert-before', 'drag-insert-after');
  });

  card.addEventListener('drop', (event) => {
    const canReorderInPlace = draggingItemId && (!collectionItems || collectionHasItem(collectionItems, draggingItemId));
    if (!canReorderInPlace) return;
    event.preventDefault();
    event.stopPropagation();
    const insertAfter = shouldInsertItemAfter(card, event, 'auto');
    card.classList.remove('drag-insert-before', 'drag-insert-after');
    if (!draggingItemId || draggingItemId === item.id) return;
    moveItemBeforeFn(draggingItemId, item.id, insertAfter);
  });

  card.addEventListener('dragend', () => {
    draggingItemId = null;
    draggingCategoryItemId = null;
    card.classList.remove('is-dragging');
    clearDragStyles();
  });

  const imageWrap = card.querySelector('.card-image-wrap');
  const imageEl = card.querySelector('.card-image');
  const titleEl = card.querySelector('.card-title');
  const sellerEl = card.querySelector('.card-seller');
  const priceEl = card.querySelector('.card-price-value');
  const highlightsEl = card.querySelector('.card-highlights');

  const itemImages = getItemImages(item);
  const displayImage = itemImages[0] || item.image || '';

  if (displayImage && imageEl) {
    imageEl.src = displayImage;
    bindImageFallbackToItem(imageEl, item, itemImages);
    imageEl.alt = item.name || 'Product image';
    imageEl.style.cursor = 'pointer';
  } else if (imageWrap) {
    imageWrap.innerHTML = '<div class="no-image-label">No image</div>';
  }

  if (titleEl) {
    titleEl.href = item.url;
    titleEl.textContent = item.name || 'Untitled item';
    titleEl.classList.add('editable-token');
    titleEl.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      startInlineEdit({
        container: titleEl,
        initialValue: item.name || '',
        type: 'text',
        placeholder: 'Item name',
        onSave: (next) => {
          item.name = normalizeItemName(next || 'Untitled item', item.url || '');
        }
      });
    });
  }
  if (sellerEl) {
    sellerEl.innerHTML = `<span class="editable-token">${escapeHtml(item.seller || 'Unknown seller')}</span>`;
    const sellerEditTarget = sellerEl.querySelector('.editable-token');
    if (sellerEditTarget) sellerEditTarget.addEventListener('click', (event) => {
      event.stopPropagation();
      startInlineEdit({
        container: sellerEditTarget,
        initialValue: item.seller || '',
        type: 'text',
        placeholder: 'Seller website',
        onSave: (next) => {
          item.seller = next || 'Unknown seller';
        }
      });
    });
  }
  if (priceEl) {
    priceEl.innerHTML = `<span class="editable-token">${escapeHtml(formatPrice(item.price) || 'N/A')}</span>`;
    const priceEditTarget = priceEl.querySelector('.editable-token');
    if (priceEditTarget) priceEditTarget.addEventListener('click', (event) => {
      event.stopPropagation();
      startInlineEdit({
        container: priceEditTarget,
        initialValue: formatPrice(item.price) || '',
        type: 'text',
        placeholder: '$799',
        onSave: (next) => {
          item.price = formatPrice(next || '');
        }
      });
    });
  }

  if (highlightsEl) highlightsEl.innerHTML = '';
  const highlights = normalizeHighlights(item.highlights);
  if (highlightsEl) {
    if (!highlights.length) {
      highlightsEl.innerHTML = '<li class="muted-highlight">No highlights</li>';
    } else {
      for (const highlight of highlights) {
        const li = document.createElement('li');
        li.textContent = highlight;
        highlightsEl.appendChild(li);
      }
    }
  }

  const cardBody = card.querySelector('.card-body');
  const hoverActions = card.querySelector('.card-hover-actions');
  if (cardBody) {
    const feedbackWrap = document.createElement('div');
    feedbackWrap.className = 'card-feedback';
    const feedbacks = normalizeFeedbacks(item.feedbacks || []);
    const latestFeedback = feedbacks[0] || null;

    if (latestFeedback) {
      const summary = document.createElement('div');
      summary.className = 'card-feedback-summary';
      const badge = document.createElement('span');
      badge.className = 'feedback-badge';
      badge.textContent = latestFeedback.initials || getInitialsFromName(latestFeedback.author || currentUserName);
      const content = document.createElement('div');
      content.className = 'card-feedback-content';
      if (latestFeedback.text) {
        const text = document.createElement('p');
        text.className = 'card-feedback-text';
        text.textContent = latestFeedback.text;
        content.appendChild(text);
      }
      if (Array.isArray(latestFeedback.emojis) && latestFeedback.emojis.length) {
        const emojis = document.createElement('p');
        emojis.className = 'card-feedback-emojis';
        emojis.textContent = latestFeedback.emojis.join(' ');
        content.appendChild(emojis);
      }
      summary.appendChild(badge);
      summary.appendChild(content);
      feedbackWrap.appendChild(summary);
    } else {
      const empty = document.createElement('p');
      empty.className = 'card-feedback-empty';
      empty.textContent = 'No feedback yet';
      feedbackWrap.appendChild(empty);
    }

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'card-feedback-add-btn';
    addBtn.textContent = 'Add feedback';
    addBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      openFeedbackDialog(item.id);
    });
    feedbackWrap.appendChild(addBtn);

    if (hoverActions) {
      cardBody.insertBefore(feedbackWrap, hoverActions);
    } else {
      cardBody.appendChild(feedbackWrap);
    }
  }

  const cardRankBtn = card.querySelector('.card-rank-btn');
  const cardOpenBtn = card.querySelector('.card-open-btn');
  const cardRemoveBtn = card.querySelector('.card-remove-btn');
  if (cardRankBtn) {
    cardRankBtn.classList.toggle('active', Boolean(getItemFavoriteRank(item)));
    cardRankBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      openRankMenu(item.id, cardRankBtn);
    });
  }
  if (cardOpenBtn) {
    cardOpenBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
    });
  }
  if (cardRemoveBtn) cardRemoveBtn.addEventListener('click', () => removeItemFn(item.id));
  card.addEventListener('click', (event) => {
    if (event.target && event.target.closest('button,a,input,textarea')) return;
    openDetailModal(item.id);
  });

  return card;
}

function buildCategoryItemsImageGrid(items, itemCollection) {
  const wrap = document.createElement('div');
  wrap.className = 'category-item-image-wrap';
  const grid = document.createElement('div');
  grid.className = 'cards-grid category-item-image-grid';

  for (const item of items) {
    grid.appendChild(buildImageItemCard(item, {
      moveItemBeforeFn: (sourceId, targetId, insertAfter = false) =>
        moveItemBeforeInCollection(itemCollection, sourceId, targetId, insertAfter),
      removeItemFn: (itemId) => removeItemFromCollection(itemCollection, itemId),
      collectionItems: items
    }));
  }
  wireItemGridDropToEnd(grid, items, (sourceId, targetId, insertAfter = false) =>
    moveItemBeforeInCollection(itemCollection, sourceId, targetId, insertAfter));

  wrap.appendChild(grid);
  return wrap;
}

function renderImageView(items) {
  cardsGrid.innerHTML = '';
  const board = getActiveBoard();
  const hasSubcategories = board ? getCurrentCategoryChildren(board).length > 0 : false;
  const boardHasNoItems = board ? getAllBoardItems(board).length === 0 : !items.length;
  const shouldShowImageSection = (items.length > 0 || !hasSubcategories) && !boardHasNoItems;
  const showImageSectionInCurrentView = activeView === 'image' && shouldShowImageSection;
  imageViewSection.classList.toggle('hidden', !showImageSectionInCurrentView);

  if (!shouldShowImageSection) {
    return;
  }

  if (!items.length) {
    cardsGrid.innerHTML = '<p class="empty-cards">No items in this board yet. Paste a link to add one.</p>';
    return;
  }

  for (const item of items) {
    cardsGrid.appendChild(buildImageItemCard(item, { collectionItems: items }));
  }
  wireItemGridDropToEnd(cardsGrid, items, moveItemBefore);
}

function moveItemBefore(sourceId, targetId, insertAfter = false) {
  const board = getActiveBoard();
  if (!board) return;
  const items = getActiveItemCollection(board);
  moveItemBeforeInCollection(items, sourceId, targetId, insertAfter);
}

function shouldInsertItemAfter(targetEl, event, axis = 'auto') {
  const bounds = targetEl.getBoundingClientRect();
  if (axis === 'auto') {
    axis = 'x';
    const parent = targetEl.parentElement;
    if (parent && parent.classList.contains('cards-grid')) {
      const columns = getComputedStyle(parent).gridTemplateColumns.split(' ').filter(Boolean).length;
      axis = columns <= 1 ? 'y' : 'x';
    } else if (targetEl.matches('tr')) {
      axis = 'y';
    }
  }
  if (axis === 'y') {
    return event.clientY > bounds.top + bounds.height / 2;
  }
  return event.clientX > bounds.left + bounds.width / 2;
}

function collectionHasItem(items, itemId) {
  return Array.isArray(items) && items.some((entry) => entry?.id === itemId);
}

function moveItemToCollectionEnd(items, sourceId, moveItemBeforeFn) {
  if (!Array.isArray(items) || !items.length || !sourceId || typeof moveItemBeforeFn !== 'function') return;
  const lastEntry = items[items.length - 1];
  if (!lastEntry?.id || lastEntry.id === sourceId) return;
  moveItemBeforeFn(sourceId, lastEntry.id, true);
}

function wireTableBodyDropToEnd(targetBody, items, moveItemBeforeFn) {
  if (!targetBody) return;
  const existingState = tableBodyDropEndState.get(targetBody);
  if (existingState) {
    existingState.items = items;
    existingState.moveItemBeforeFn = moveItemBeforeFn;
    return;
  }

  const state = { items, moveItemBeforeFn };
  const clearEndState = () => {
    const table = targetBody.closest('table');
    if (table) table.classList.remove('drag-over-end');
  };

  targetBody.addEventListener('dragover', (event) => {
    const draggedId = getDraggedItemId(event);
    if (!draggedId || !collectionHasItem(state.items, draggedId)) return;
    const row = event.target instanceof Element ? event.target.closest('.item-row') : null;
    if (row && targetBody.contains(row)) return;
    event.preventDefault();
    event.stopPropagation();
    const table = targetBody.closest('table');
    if (table) table.classList.add('drag-over-end');
  });

  targetBody.addEventListener('dragleave', (event) => {
    const related = event.relatedTarget;
    if (related && targetBody.contains(related)) return;
    clearEndState();
  });

  targetBody.addEventListener('drop', (event) => {
    const draggedId = getDraggedItemId(event);
    if (!draggedId || !collectionHasItem(state.items, draggedId)) return;
    const row = event.target instanceof Element ? event.target.closest('.item-row') : null;
    if (row && targetBody.contains(row)) return;
    event.preventDefault();
    event.stopPropagation();
    clearEndState();
    moveItemToCollectionEnd(state.items, draggedId, state.moveItemBeforeFn);
  });

  tableBodyDropEndState.set(targetBody, state);
}

function wireItemGridDropToEnd(grid, items, moveItemBeforeFn) {
  if (!grid) return;
  const existingState = itemGridDropEndState.get(grid);
  if (existingState) {
    existingState.items = items;
    existingState.moveItemBeforeFn = moveItemBeforeFn;
    return;
  }

  const state = { items, moveItemBeforeFn };
  const clearEndState = () => {
    grid.classList.remove('drag-over-end');
  };

  grid.addEventListener('dragover', (event) => {
    const draggedId = getDraggedItemId(event);
    if (!draggedId || !collectionHasItem(state.items, draggedId)) return;
    const card = event.target instanceof Element ? event.target.closest('.item-card') : null;
    if (card && grid.contains(card)) return;
    event.preventDefault();
    event.stopPropagation();
    grid.classList.add('drag-over-end');
  });

  grid.addEventListener('dragleave', (event) => {
    const related = event.relatedTarget;
    if (related && grid.contains(related)) return;
    clearEndState();
  });

  grid.addEventListener('drop', (event) => {
    const draggedId = getDraggedItemId(event);
    if (!draggedId || !collectionHasItem(state.items, draggedId)) return;
    const card = event.target instanceof Element ? event.target.closest('.item-card') : null;
    if (card && grid.contains(card)) return;
    event.preventDefault();
    event.stopPropagation();
    clearEndState();
    moveItemToCollectionEnd(state.items, draggedId, state.moveItemBeforeFn);
  });

  itemGridDropEndState.set(grid, state);
}

function moveItemBeforeInCollection(items, sourceId, targetId, insertAfter = false) {
  if (!Array.isArray(items)) return;
  const fromIndex = items.findIndex((entry) => entry.id === sourceId);
  const toIndex = items.findIndex((entry) => entry.id === targetId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

  const [moved] = items.splice(fromIndex, 1);
  const baseIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  const insertIndex = Math.min(Math.max(baseIndex + (insertAfter ? 1 : 0), 0), items.length);
  items.splice(insertIndex, 0, moved);
  saveData();
  renderBoardDetail();
}

function clearDragStyles() {
  document.querySelectorAll('.drag-insert-before,.drag-insert-after').forEach((el) => {
    el.classList.remove('drag-insert-before', 'drag-insert-after');
  });
  document.querySelectorAll('.drag-over-end').forEach((el) => el.classList.remove('drag-over-end'));
  document.querySelectorAll('.is-dragging').forEach((el) => el.classList.remove('is-dragging'));
}

function renderFeedbackCell(cell, item) {
  cell.innerHTML = '';
  const list = buildFeedbackList(item, { showActions: true, stopPropagation: true });

  const addFeedbackBtn = document.createElement('button');
  addFeedbackBtn.type = 'button';
  addFeedbackBtn.className = 'feedback-add-btn';
  addFeedbackBtn.textContent = 'Add feedback';
  addFeedbackBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    openFeedbackDialog(item.id);
  });

  cell.appendChild(list);
  cell.appendChild(addFeedbackBtn);
}

function openFeedbackDialog(itemId, feedbackId = null) {
  const board = getActiveBoard();
  if (!board || !feedbackDialog || !feedbackEmojiGrid) return;
  const item = findItemInBoard(board, itemId);
  if (!item) return;
  activeFeedbackItemId = item.id;
  activeFeedbackEditingId = feedbackId;
  const existing = feedbackId ? normalizeFeedbacks(item.feedbacks || []).find((entry) => entry.id === feedbackId) : null;
  feedbackEmojiGrid.innerHTML = '';
  for (const emoji of EMOJI_OPTIONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'feedback-emoji-btn';
    btn.textContent = emoji;
    btn.setAttribute('aria-label', `Use ${emoji}`);
    btn.addEventListener('click', () => {
      const selected = feedbackEmojiGrid.querySelectorAll('.feedback-emoji-btn.is-selected').length;
      if (btn.classList.contains('is-selected')) {
        btn.classList.remove('is-selected');
        return;
      }
      if (selected >= 3) return;
      btn.classList.add('is-selected');
    });
    if (existing?.emojis?.includes(emoji)) {
      btn.classList.add('is-selected');
    }
    feedbackEmojiGrid.appendChild(btn);
  }

  if (feedbackInput) {
    feedbackInput.value = existing?.text || '';
    setTimeout(() => feedbackInput.focus(), 0);
  }
  if (!feedbackDialog.open) feedbackDialog.showModal();
}

function commitFeedbackDialog() {
  const board = getActiveBoard();
  if (!board || !activeFeedbackItemId || !feedbackInput || !feedbackEmojiGrid || !feedbackDialog) return;
  const item = findItemInBoard(board, activeFeedbackItemId);
  if (!item) return;

  const text = feedbackInput.value.trim().slice(0, 200);
  const selected = Array.from(feedbackEmojiGrid.querySelectorAll('.feedback-emoji-btn.is-selected'))
    .map((btn) => btn.textContent)
    .slice(0, 3);
  if (!text && !selected.length) return;

  const next = normalizeFeedbacks(item.feedbacks || []);
  if (activeFeedbackEditingId) {
    const idx = next.findIndex((entry) => entry.id === activeFeedbackEditingId);
    if (idx >= 0) {
      next[idx] = {
        ...next[idx],
        text,
        emojis: selected
      };
    }
  } else {
    next.push({
      id: crypto.randomUUID(),
      author: currentUserName,
      initials: getInitialsFromName(currentUserName),
      text,
      emojis: selected
    });
  }

  item.feedbacks = next;
  saveData();
  renderBoardDetail();
  if (activeDetailItemId === item.id && detailDialog?.open) {
    renderDetailFeedback(item);
  }
  feedbackDialog.close();
}

function startInlineEdit({ container, initialValue, type = 'text', placeholder = '', onSave, onReady }) {
  if (!container) return;
  if (container.dataset.editing === 'true') return;
  container.dataset.editing = 'true';
  const field = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
  if (type !== 'textarea') field.type = 'text';
  field.className = 'inline-editor';
  field.value = String(initialValue || '');
  field.placeholder = placeholder;
  disableAutofill(field);

  const commit = () => {
    if (container.dataset.editing !== 'true') return;
    const next = field.value.trim();
    if (typeof onSave === 'function') onSave(next);
    delete container.dataset.editing;
    saveData();
    renderBoardDetail();
  };

  const cancel = () => {
    if (container.dataset.editing !== 'true') return;
    delete container.dataset.editing;
    saveData();
    renderBoardDetail();
  };

  field.addEventListener('click', (event) => event.stopPropagation());
  field.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key === 'Enter' && type !== 'textarea') {
      event.preventDefault();
      commit();
    }
    if (event.key === 'Enter' && type === 'textarea' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      commit();
    }
  });
  field.addEventListener('blur', commit);

  container.innerHTML = '';
  container.appendChild(field);
  field.focus();
  field.select();
  if (typeof onReady === 'function') onReady(field);
}

function openImagePicker(itemId) {
  const board = getActiveBoard();
  if (!board || !imagePickerDialog) return;
  const item = findItemInBoard(board, itemId);
  if (!item) return;
  activeImagePickerItemId = itemId;
  renderImagePicker(item);
  if (!imagePickerDialog.open) imagePickerDialog.showModal();
}

function renderImagePicker(item) {
  if (!imagePickerGrid) return;
  const images = getItemImages(item);
  imagePickerGrid.innerHTML = '';

  if (!images.length) {
    imagePickerGrid.innerHTML = '<p class="muted-highlight">No images available yet.</p>';
    return;
  }

  const mainKey = canonicalImageKey(item.image || images[0] || '');
  for (const src of images) {
    const card = document.createElement('div');
    card.className = 'picker-image-card';
    const selected = canonicalImageKey(src) === mainKey;
    card.innerHTML = `
      <img src="${escapeHtml(src)}" alt="Product image" loading="lazy" />
      <button class="picker-star-btn${selected ? ' active' : ''}" type="button" aria-label="Set as main image">${selected ? '★' : '☆'}</button>
    `;
    const star = card.querySelector('.picker-star-btn');
    if (star) {
      star.addEventListener('click', () => setMainImageForActiveItem(src));
    }
    imagePickerGrid.appendChild(card);
  }
}

function setMainImageForActiveItem(src) {
  const board = getActiveBoard();
  if (!board || !activeImagePickerItemId) return;
  const item = findItemInBoard(board, activeImagePickerItemId);
  if (!item) return;
  const images = pinPrimaryImage([src, ...(item.images || []), item.image || ''], src);
  item.images = images;
  item.image = src;
  saveData();
  renderImagePicker(item);
  renderBoardDetail();
}

function addImageToPicker() {
  const board = getActiveBoard();
  if (!board || !activeImagePickerItemId || !imagePickerUrl) return;
  const item = findItemInBoard(board, activeImagePickerItemId);
  if (!item) return;
  const url = imagePickerUrl.value.trim();
  if (!/^https?:\/\//i.test(url)) return;
  const images = pinPrimaryImage([...(item.images || []), url, item.image || ''], item.image || url);
  item.images = images;
  if (!item.image) item.image = images[0] || '';
  imagePickerUrl.value = '';
  saveData();
  renderImagePicker(item);
  renderBoardDetail();
}

function openDetailModal(itemId) {
  const board = getActiveBoard();
  if (!board || !detailDialog) return;
  const item = findItemInBoard(board, itemId);
  if (!item) return;

  const images = getItemImages(item);
  const featured = String(item.image || '').trim();
  const featuredIndex = featured ? findImageIndex(images, featured) : -1;
  activeDetailItemId = itemId;
  activeDetailImageIndex = featuredIndex >= 0 ? featuredIndex : 0;
  renderDetailModal(item);
  if (!detailDialog.open) detailDialog.showModal();
  const enrichState = {
    itemId,
    imageKeys: collectImageKeySet(images),
    featuredKey: canonicalImageKey(item.image || images[0] || '')
  };
  enrichDetailImages(item, enrichState).catch(() => {
    // Leave current images if enrichment fails.
  });
}

function renderDetailModal(item) {
  const images = getItemImages(item);
  if (activeDetailImageIndex > images.length - 1) activeDetailImageIndex = 0;
  const sellerText = item.seller || 'Unknown seller';
  renderDetailHeaderFields(item);
  if (detailLink) {
    detailLink.href = item.url || '#';
    detailLink.textContent = `View on ${sellerText}`;
  }
  renderDetailThumbs(images);
  setDetailMainImage(images[activeDetailImageIndex] || '');
  renderDetailMeta(item);
  renderDetailFeedback(item);
  resetDetailFeedbackComposer();
}

function renderDetailHeaderFields(item) {
  if (detailName) {
    detailName.innerHTML = '';
    const nameToken = document.createElement('span');
    nameToken.className = 'editable-token';
    nameToken.textContent = String(item.name || 'Untitled item').trim() || 'Untitled item';
    nameToken.title = 'Click to edit item name';
    nameToken.addEventListener('click', (event) => {
      event.stopPropagation();
      startInlineEdit({
        container: nameToken,
        initialValue: item.name || '',
        placeholder: 'Item name',
        onSave: (next) => {
          item.name = normalizeItemName(String(next || '').trim() || 'Untitled item', item.url || '');
          renderDetailHeaderFields(item);
        }
      });
    });
    detailName.appendChild(nameToken);
  }

  if (detailPrice) {
    detailPrice.innerHTML = '';
    const priceToken = document.createElement('span');
    priceToken.className = 'editable-token';
    priceToken.textContent = formatPrice(item.price) || 'N/A';
    priceToken.title = 'Click to edit item price';
    priceToken.addEventListener('click', (event) => {
      event.stopPropagation();
      startInlineEdit({
        container: priceToken,
        initialValue: formatPrice(item.price) || '',
        placeholder: '$0.00',
        onSave: (next) => {
          item.price = formatPrice(next || '');
          renderDetailHeaderFields(item);
        }
      });
    });
    detailPrice.appendChild(priceToken);
  }
}

function renderDetailMeta(item) {
  renderDetailSections(item);
}

function renderDetailSections(item) {
  if (!detailDynamicSections) return;
  detailDynamicSections.innerHTML = '';
  const overview = buildOverviewModel(item, 500);
  if (!overview.text && !overview.bullets.length) {
    detailDynamicSections.innerHTML = '<p class="muted-highlight">No overview available yet.</p>';
    return;
  }
  const group = document.createElement('div');
  group.className = 'detail-meta-group detail-overview';
  const heading = document.createElement('h4');
  heading.textContent = 'Overview';
  group.appendChild(heading);
  if (overview.text) {
    const paragraph = document.createElement('p');
    paragraph.className = 'detail-description';
    paragraph.textContent = /^details\s*:/i.test(overview.text) ? overview.text : `Details: ${overview.text}`;
    group.appendChild(paragraph);
  }
  if (overview.bullets.length) {
    const list = document.createElement('ul');
    list.className = 'detail-meta-list';
    for (const bullet of overview.bullets) {
      const li = document.createElement('li');
      li.textContent = bullet;
      list.appendChild(li);
    }
    group.appendChild(list);
  }
  detailDynamicSections.appendChild(group);
}
function renderDetailThumbs(images) {
  if (!detailThumbs) return;
  detailThumbs.innerHTML = '';
  const hasMultiple = images.length > 1;
  if (detailPrevBtn) detailPrevBtn.classList.toggle('hidden', !hasMultiple);
  if (detailNextBtn) detailNextBtn.classList.toggle('hidden', !hasMultiple);

  images.forEach((src, index) => {
    const thumb = document.createElement('img');
    thumb.className = `detail-thumb${index === activeDetailImageIndex ? ' active' : ''}`;
    thumb.src = src;
    thumb.alt = `Image ${index + 1}`;
    thumb.loading = 'lazy';
    thumb.addEventListener('click', () => {
      setDetailImageIndex(index);
    });
    detailThumbs.appendChild(thumb);
  });
  ensureActiveDetailThumbVisible();
}

function removeImageFromDetailByIndex(index) {
  const board = getActiveBoard();
  if (!board || activeDetailItemId == null) return;
  const item = findItemInBoard(board, activeDetailItemId);
  if (!item) return;

  const images = getItemImages(item);
  if (!images.length) return;
  const safeIndex = Math.max(0, Math.min(index, images.length - 1));
  const remaining = images.filter((_, imageIndex) => imageIndex !== safeIndex);
  const featuredStillExists = findImageIndex(remaining, item.image || '') >= 0
    ? (item.image || '')
    : '';
  const nextFeatured = featuredStillExists || remaining[0] || '';
  const nextImages = nextFeatured ? pinPrimaryImage(remaining, nextFeatured) : [];

  item.images = nextImages;
  item.image = nextFeatured;
  if (activeDetailImageIndex > nextImages.length - 1) {
    activeDetailImageIndex = Math.max(nextImages.length - 1, 0);
  }
  saveData();
  renderBoardDetail();
  renderDetailModal(item);
}

function stepDetailImage(delta) {
  const board = getActiveBoard();
  if (!board || activeDetailItemId == null) return;
  const item = findItemInBoard(board, activeDetailItemId);
  if (!item) return;
  const images = getItemImages(item);
  if (images.length < 2) return;
  const next = (activeDetailImageIndex + delta + images.length) % images.length;
  setDetailImageIndex(next);
}

function setDetailImageIndex(index) {
  const board = getActiveBoard();
  if (!board || activeDetailItemId == null) return;
  const item = findItemInBoard(board, activeDetailItemId);
  if (!item) return;
  const images = getItemImages(item);
  if (!images.length) return;
  const safeIndex = Math.max(0, Math.min(index, images.length - 1));
  activeDetailImageIndex = safeIndex;
  setDetailMainImage(images[safeIndex]);
  renderDetailThumbs(images);
}

function setDetailMainImage(src) {
  if (!detailMainImage || !detailMainEmpty) return;
  if (!src) {
    detailMainImage.classList.add('hidden');
    detailMainEmpty.classList.remove('hidden');
    detailMainImage.removeAttribute('src');
    syncDetailFeaturedButton('');
    syncDetailDeleteButton('');
    return;
  }
  detailMainImage.src = src;
  const board = getActiveBoard();
  const item = board && activeDetailItemId != null ? findItemInBoard(board, activeDetailItemId) : null;
  if (item) bindImageFallbackToItem(detailMainImage, item, getItemImages(item));
  detailMainImage.classList.remove('hidden');
  detailMainEmpty.classList.add('hidden');
  syncDetailFeaturedButton(src);
  syncDetailDeleteButton(src);
}

function syncDetailFeaturedButton(src) {
  if (!detailFeaturedBtn) return;
  const board = getActiveBoard();
  const item = board && activeDetailItemId != null ? findItemInBoard(board, activeDetailItemId) : null;
  const currentKey = canonicalImageKey(src);
  const featuredKey = canonicalImageKey(item?.image || '');
  const isFeatured = Boolean(currentKey && currentKey === featuredKey);
  detailFeaturedBtn.classList.toggle('hidden', !src);
  detailFeaturedBtn.classList.toggle('active', isFeatured);
  detailFeaturedBtn.setAttribute('aria-pressed', isFeatured ? 'true' : 'false');
  detailFeaturedBtn.setAttribute('aria-label', isFeatured ? 'Featured image' : 'Set as featured image');
  detailFeaturedBtn.textContent = isFeatured ? '★' : '☆';
  detailFeaturedBtn.title = isFeatured ? 'Featured image' : 'Set as featured image';
}

function syncDetailDeleteButton(src) {
  if (!detailDeleteBtn) return;
  const hasImage = Boolean(String(src || '').trim());
  detailDeleteBtn.classList.toggle('hidden', !hasImage);
  detailDeleteBtn.setAttribute('aria-label', 'Delete image');
  detailDeleteBtn.title = 'Delete image';
}

function removeCurrentDetailImage() {
  removeImageFromDetailByIndex(activeDetailImageIndex);
}

function setFeaturedImageFromDetail() {
  const board = getActiveBoard();
  if (!board || activeDetailItemId == null) return;
  const item = findItemInBoard(board, activeDetailItemId);
  if (!item) return;
  const images = getItemImages(item);
  if (!images.length) return;
  const src = images[activeDetailImageIndex] || images[0];
  if (!src) return;
  item.images = pinPrimaryImage([src, ...(item.images || []), item.image || ''], src);
  item.image = src;
  const nextImages = getItemImages(item);
  const nextIndex = findImageIndex(nextImages, src);
  activeDetailImageIndex = nextIndex >= 0 ? nextIndex : 0;
  saveData();
  renderBoardDetail();
  renderDetailThumbs(nextImages);
  setDetailMainImage(nextImages[activeDetailImageIndex] || '');
}

function ensureActiveDetailThumbVisible() {
  if (!detailThumbs) return;
  const activeThumb = detailThumbs.querySelector('.detail-thumb.active');
  if (!activeThumb) return;
  activeThumb.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  });
}

function buildFeedbackList(item, options = {}) {
  const { showActions = true, stopPropagation = true } = options;
  const list = document.createElement('div');
  list.className = 'feedback-list';
  const feedbacks = normalizeFeedbacks(item.feedbacks || []);

  if (!feedbacks.length) {
    list.innerHTML = '<p class="feedback-empty">No feedback yet</p>';
    return list;
  }

  for (const fb of feedbacks) {
    const row = document.createElement('div');
    row.className = 'feedback-item';
    const badge = document.createElement('span');
    badge.className = 'feedback-badge';
    badge.textContent = fb.initials || getInitialsFromName(fb.author || currentUserName);

    const textWrap = document.createElement('div');
    textWrap.className = 'feedback-content';
    if (fb.text) {
      const text = document.createElement('p');
      text.className = 'feedback-text';
      text.textContent = fb.text;
      textWrap.appendChild(text);
    }

    if (Array.isArray(fb.emojis) && fb.emojis.length) {
      const emojis = document.createElement('p');
      emojis.className = 'feedback-emojis';
      emojis.textContent = fb.emojis.join(' ');
      textWrap.appendChild(emojis);
    }

    row.appendChild(badge);
    row.appendChild(textWrap);

    if (showActions) {
      const actions = document.createElement('div');
      actions.className = 'feedback-actions';
      actions.innerHTML = `
        <button class="feedback-edit-btn icon-btn" type="button" aria-label="Edit feedback">✎</button>
        <button class="feedback-delete-btn icon-btn danger" type="button" aria-label="Delete feedback">🗑</button>
      `;
      const editBtn = actions.querySelector('.feedback-edit-btn');
      const deleteBtn = actions.querySelector('.feedback-delete-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (event) => {
          if (stopPropagation) event.stopPropagation();
          openFeedbackDialog(item.id, fb.id);
        });
      }
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (event) => {
          if (stopPropagation) event.stopPropagation();
          const next = normalizeFeedbacks(item.feedbacks || []).filter((entry) => entry.id !== fb.id);
          item.feedbacks = next;
          saveData();
          renderBoardDetail();
          if (activeDetailItemId === item.id && detailDialog?.open) renderDetailFeedback(item);
        });
      }
      row.appendChild(actions);
    }

    list.appendChild(row);
  }

  return list;
}

function renderDetailFeedback(item) {
  if (!detailFeedbackList) return;
  detailFeedbackList.innerHTML = '';
  const feedbacks = normalizeFeedbacks(item?.feedbacks || []);
  if (!feedbacks.length) return;
  detailFeedbackList.appendChild(buildFeedbackList(item, { showActions: true, stopPropagation: false }));
}

function renderDetailFeedbackComposer() {
  if (!detailFeedbackComposerGrid) return;
  detailFeedbackComposerGrid.innerHTML = '';
  for (const emoji of EMOJI_OPTIONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'feedback-emoji-btn';
    btn.textContent = emoji;
    btn.setAttribute('aria-label', `Use ${emoji}`);
    btn.addEventListener('click', () => {
      const selected = detailFeedbackComposerGrid.querySelectorAll('.feedback-emoji-btn.is-selected').length;
      if (btn.classList.contains('is-selected')) {
        btn.classList.remove('is-selected');
        return;
      }
      if (selected >= 3) return;
      btn.classList.add('is-selected');
    });
    detailFeedbackComposerGrid.appendChild(btn);
  }
}

function clearDetailFeedbackSelection() {
  if (!detailFeedbackComposerGrid) return;
  detailFeedbackComposerGrid.querySelectorAll('.feedback-emoji-btn.is-selected').forEach((btn) => btn.classList.remove('is-selected'));
}

function resetDetailFeedbackComposer() {
  if (detailFeedbackComposerInput) detailFeedbackComposerInput.value = '';
  clearDetailFeedbackSelection();
  renderDetailFeedbackComposer();
}

function collectDetailFeedbackEmojis() {
  if (!detailFeedbackComposerGrid) return [];
  return Array.from(detailFeedbackComposerGrid.querySelectorAll('.feedback-emoji-btn.is-selected')).map((btn) => btn.textContent || '');
}

function commitDetailFeedback() {
  const board = getActiveBoard();
  if (!board || activeDetailItemId == null) return;
  const item = findItemInBoard(board, activeDetailItemId);
  if (!item || !detailFeedbackComposerInput) return;

  const text = detailFeedbackComposerInput.value.trim().slice(0, 200);
  const emojis = collectDetailFeedbackEmojis().slice(0, 3);
  if (!text && !emojis.length) return;

  const next = normalizeFeedbacks(item.feedbacks || []);
  next.push({
    id: crypto.randomUUID(),
    author: currentUserName,
    initials: getInitialsFromName(currentUserName),
    text,
    emojis
  });
  item.feedbacks = next;
  saveData();
  renderBoardDetail();
  renderDetailFeedback(item);
  resetDetailFeedbackComposer();
}

async function enrichDetailImages(item, enrichState = null) {
  if (!item?.url) return;
  const existing = pinPrimaryImage(item.images || item.image, item.image);
  const hasRichDetails =
    String(item.description || '').trim().length > 0 ||
    normalizeDetailList(item.dimensions || []).length > 0 ||
    normalizeDetailList(item.materials || []).length > 0 ||
    normalizeDetailList(item.specs || []).length > 0;
  if (existing.length >= 2 && hasRichDetails) return;

  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: item.url })
  });
  if (!response.ok) return;
  const payload = await response.json();
  const currentImages = getItemImages(item);
  const currentImageKeys = collectImageKeySet(currentImages);
  const currentFeaturedKey = canonicalImageKey(item.image || currentImages[0] || '');
  const userChangedImagesDuringEnrichment = Boolean(
    enrichState
      && enrichState.itemId === item.id
      && (
        currentFeaturedKey !== String(enrichState.featuredKey || '')
        || !areImageKeySetsEqual(currentImageKeys, enrichState.imageKeys)
      )
  );

  if (!userChangedImagesDuringEnrichment) {
    const mergedImages = pinPrimaryImage(
      [...currentImages, ...(payload.images || []), payload.image || ''],
      item.image || payload.image || currentImages[0] || ''
    );
    if (mergedImages.length) {
      item.images = mergedImages;
      const currentFeaturedStillExists = mergedImages.some(
        (src) => canonicalImageKey(src) === canonicalImageKey(item.image || '')
      );
      item.image = currentFeaturedStillExists ? item.image : mergedImages[0];
    }
  }
  item.description = String(item.description || payload.description || '').trim();
  item.dimensions = normalizeDetailList([...(item.dimensions || []), ...(payload.dimensions || [])]);
  item.materials = normalizeDetailList([...(item.materials || []), ...(payload.materials || [])]);
  item.specs = normalizeDetailList([...(item.specs || []), ...(payload.specs || [])]);
  const overview = buildOverviewModel({
    ...item,
    overview: payload.overview || item.overview || payload.aiOverview || '',
    overviewBullets: [
      ...(Array.isArray(item.overviewBullets) ? item.overviewBullets : []),
      ...(Array.isArray(payload.overviewBullets) ? payload.overviewBullets : [])
    ],
    description: item.description,
    dimensions: item.dimensions,
    materials: item.materials,
    specs: item.specs
  }, 500);
  item.overview = overview.text;
  item.overviewBullets = overview.bullets;
  saveData();

  if (activeDetailItemId === item.id && detailDialog?.open) {
    const idxMax = Math.max(getItemImages(item).length - 1, 0);
    if (activeDetailImageIndex > idxMax) activeDetailImageIndex = 0;
    renderDetailModal(item);
  }
  renderBoardDetail();
}

function collectImageKeySet(images = []) {
  const keys = new Set();
  for (const src of images) {
    const key = canonicalImageKey(src);
    if (key) keys.add(key);
  }
  return keys;
}

function areImageKeySetsEqual(left, right) {
  if (!(left instanceof Set) || !(right instanceof Set)) return false;
  if (left.size !== right.size) return false;
  for (const key of left) {
    if (!right.has(key)) return false;
  }
  return true;
}

function findImageIndex(images, src) {
  const list = Array.isArray(images) ? images : [];
  const target = String(src || '').trim();
  if (!target || !list.length) return -1;
  const exact = list.findIndex((value) => String(value || '').trim() === target);
  if (exact >= 0) return exact;
  const key = canonicalImageKey(target);
  if (!key) return -1;
  return list.findIndex((value) => canonicalImageKey(value) === key);
}

function openEditor(itemId) {
  const board = getActiveBoard();
  if (!board) return;

  const item = findItemInBoard(board, itemId);
  if (!item) return;

  editingItemId = itemId;
  editBrand.value = item.brand || inferBrandFromDescription(item.name);
  editDescription.value = item.name || '';
  editSeller.value = item.seller || '';
  editPrice.value = formatPrice(item.price);
  editImage.value = getItemPrimaryImage(item) || item.image || '';
  editHighlights.value = formatHighlightsForEditor(normalizeHighlights(item.highlights));
  editDialog.showModal();
}

function removeItem(itemId) {
  const board = getActiveBoard();
  if (!board) return;
  const located = findItemLocationInBoard(board, itemId);
  const targetCollection = Array.isArray(located?.collection)
    ? located.collection
    : getActiveItemCollection(board);
  removeItemFromCollection(targetCollection, itemId);
}

function removeItemFromCollection(items, itemId) {
  if (!Array.isArray(items)) return;
  const next = items.filter((entry) => entry.id !== itemId);
  items.length = 0;
  items.push(...next);
  saveData();
  renderBoardDetail();
}

function closeErrorDialog() {
  if (errorDialog?.open) errorDialog.close();
}

function showErrorDialog(message, options = {}) {
  const text = String(message || '').trim();
  const title = String(options?.title || 'Notice').trim() || 'Notice';
  if (!text || !errorDialog || !errorDialogMessage) return false;
  if (errorDialogTitle) errorDialogTitle.textContent = title;
  errorDialogMessage.textContent = text;
  if (!errorDialog.open) errorDialog.showModal();
  return true;
}

function showNoticeDialog(message) {
  return showErrorDialog(message, { title: 'Notice' });
}

function setStatus(message, isError = false) {
  const text = String(message || '').trim();
  if (!text) return;
  if (!isError) return;
  showErrorDialog(text, { title: 'Error' });
}

function setExtracting(isExtracting) {
  if (extractingOverlay) extractingOverlay.classList.toggle('hidden', !isExtracting);
  if (addItemPanel) addItemPanel.classList.toggle('is-extracting', isExtracting);
}

function normalizeProductUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
    ? value
    : value.startsWith('//')
      ? `https:${value}`
      : `https://${value}`;
  try {
    const parsed = new URL(withScheme);
    if (!parsed.hostname) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function shouldFallbackToBasicItem(errorText) {
  const text = String(errorText || '').toLowerCase();
  if (!text) return false;
  return (
    /status\s*(403|429|430|451|500|502|503|504)/i.test(text) ||
    text.includes('access denied') ||
    text.includes('forbidden') ||
    text.includes('blocked') ||
    text.includes('bot') ||
    text.includes('captcha')
  );
}

function inferBrandFromDescription(description) {
  const text = String(description || '').trim();
  const commaIndex = text.indexOf(',');
  if (commaIndex <= 0) return '';
  return text.slice(0, commaIndex).trim();
}

function truncateItemName(text, maxChars = ITEM_NAME_MAX_LENGTH) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxChars) return normalized;
  const sliced = normalized.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(' ');
  const clipped = lastSpace > Math.floor(maxChars * 0.65) ? sliced.slice(0, lastSpace) : sliced;
  return `${clipped.trim()}...`;
}

function normalizeItemName(name, sourceUrl = '') {
  const value = cleanExtractedItemName(name);
  if (
    !value ||
    isRetailerOnlyName(value) ||
    /^(access denied|forbidden|untitled item)$/i.test(value)
  ) {
    return truncateItemName(cleanExtractedItemName(itemNameFromUrl(sourceUrl)) || 'Untitled item');
  }
  return truncateItemName(value);
}

function itemNameFromUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const ignored = new Set(['product', 'products', 'shop', 'item', 'p', 'pd', 'collections']);
    const parts = url.pathname.split('/').filter(Boolean);
    const part = [...parts].reverse().find((segment) => {
      const s = segment.toLowerCase().replace(/\.\w+$/i, '');
      return s && !ignored.has(s) && /[a-z]/i.test(s) && !/^\d+$/.test(s);
    }) || parts[parts.length - 1] || url.hostname;
    const text = decodeURIComponent(part)
      .replace(/\.\w+$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = text
      .split(' ')
      .filter(Boolean)
      .filter((word) => !isRetailerToken(word))
      .filter((word) => !/^w?\d{5,}$/i.test(word));
    const full = words.slice(0, 20).map(toTitle).join(' ');
    return cleanExtractedItemName(full || 'Untitled item');
  } catch {
    return 'Untitled item';
  }
}

function shortenItemName(name) {
  const text = stripRetailerPrefixes(String(name || '').replace(/\s+/g, ' ').trim());
  if (!text) return 'Untitled item';

  const q = (() => {
    const m = text.match(/\b(\d+)\s*[- ]?\s*(piece|pc)\b/i);
    return m ? `${m[1]} Piece` : '';
  })();
  const material = (() => {
    const low = text.toLowerCase();
    const map = ['teak', 'eucalyptus', 'acacia', 'oak', 'walnut', 'aluminum', 'steel', 'wood'];
    const found = map.find((m) => low.includes(m));
    return found ? toTitle(found) : '';
  })();
  const type = (() => {
    const low = text.toLowerCase();
    if (/\bpatio\b.*\btable\b|\bdining table\b|\boutdoor\b.*\btable\b/.test(low)) return 'Patio Table';
    return detectLocalItemType(low);
  })();
  const model = (() => {
    const stop = new Set([
      'outdoor', 'indoor', 'dining', 'table', 'chair', 'sofa', 'rug', 'oven', 'vanity', 'set',
      'piece', 'rectangular', 'round', 'with', 'umbrella', 'hole', 'light', 'dark', 'wood',
      'teak', 'eucalyptus', 'aluminum', 'metal', 'modern', 'collection', 'and', 'for', 'the',
      'wayfair', 'allmodern', 'all', 'joss', 'main', 'jossandmain', 'birchlane', 'birch',
      'lane', 'perigold', 'hand', 'tufted', 'wool', 'area', 'rectangle'
    ]);
    const words = text
      .split(' ')
      .map((w) => w.replace(/[^a-z0-9'-]/gi, ''))
      .filter(Boolean);
    for (const word of words) {
      const lower = word.toLowerCase();
      if (stop.has(lower)) continue;
      if (/^\d+$/.test(lower)) continue;
      if (word.length < 3) continue;
      return toTitle(word);
    }
    return '';
  })();

  let compact = [q, material, type].filter(Boolean).join(' ').trim();
  if (model && type && !compact) compact = `${model} ${type}`;
  if (model && type && compact === type) compact = `${model} ${type}`;
  if (model && type && q && compact === `${q} ${type}`) compact = `${q} ${model} ${type}`;
  if (model && type && material && compact === `${material} ${type}`) compact = `${model} ${material} ${type}`;
  if (compact) return compact;

  const stop = new Set(['with', 'and', 'the', 'for', 'from', 'by', 'rectangular', 'round', 'outdoor', 'indoor']);
  const words = text
    .split(' ')
    .map((w) => w.replace(/[^a-z0-9'-]/gi, ''))
    .filter(Boolean)
    .filter((w) => !stop.has(w.toLowerCase()));

  return words.slice(0, 4).map(toTitle).join(' ') || 'Untitled item';
}

function detectLocalItemType(text) {
  const value = String(text || '').toLowerCase();
  if (/\bwall oven\b|\boven\b/.test(value)) return 'Oven';
  if (/\btable\b/.test(value)) return 'Table';
  if (/\brug\b/.test(value)) return 'Rug';
  if (/\bvanity\b/.test(value)) return 'Vanity';
  if (/\bchair\b/.test(value)) return 'Chair';
  if (/\bsofa\b|\bcouch\b/.test(value)) return 'Sofa';
  if (/\bmirror\b/.test(value)) return 'Mirror';
  return '';
}

function isRetailerToken(word) {
  const token = String(word || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const retailerTokens = new Set([
    'wayfair',
    'allmodern',
    'jossandmain',
    'jossmain',
    'birchlane',
    'perigold',
    'amazon'
  ]);
  return retailerTokens.has(token);
}

function isRetailerOnlyName(name) {
  const value = String(name || '').trim();
  if (!value) return true;
  const words = value.split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  return words.every((word) => isRetailerToken(word) || /^[-|,:]+$/.test(word));
}

function stripRetailerPrefixes(name) {
  return String(name || '')
    .replace(/^(all\s*modern|allmodern|wayfair|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold)\b[\s,:-]*/i, '')
    .trim();
}

function cleanExtractedItemName(value) {
  return String(value || '')
    .replace(/\s+[|]\s+(?:buy|shop|wayfair|allmodern|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold|article|lowes|bed\s*bath\s*&?\s*beyond|amazon(?:\.com)?).*$/i, '')
    .replace(/\s+-\s+(?:wayfair|allmodern|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold|article|lowes|bed\s*bath\s*&?\s*beyond|amazon(?:\.com)?).*$/i, '')
    .replace(/\s+-\s+(buy|shop).*/i, '')
    .replace(/^\s*see\s+more\s+by\s+[^|]+$/i, '')
    .replace(/^\s*by\s+[^|]+$/i, '')
    .replace(/^\s*by\s+[a-z0-9&' .()\-]+\s*[:|-]\s*/i, '')
    .replace(/^\s*amazon(?:\.com)?\s*:\s*/i, '')
    .replace(/\s*:\s*(?:toys?\s*&\s*games?|home\s*&\s*kitchen|sports?\s*&\s*outdoors?)\s*$/i, '')
    .replace(/^(all\s*modern|allmodern|wayfair|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold|amazon(?:\.com)?)\b[\s,:-]*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLocalHighlights(name, url = '') {
  const source = `${name || ''} ${url || ''}`.toLowerCase();
  const out = [];
  if (/\bair[- ]?fry\b/.test(source)) out.push('Air Fry');
  if (/\bconvection\b/.test(source)) out.push('Convection Oven');
  if (/\bstainless\b/.test(source)) out.push('Stainless Steel');
  if (/\boutdoor\b/.test(source)) out.push('Outdoor');
  if (/\bumbrella hole\b/.test(source)) out.push('Umbrella Hole');
  if (/\beucalyptus\b/.test(source)) out.push('Eucalyptus Wood');
  if (/\bwood|oak|walnut|teak|acacia\b/.test(source)) out.push('Wood');
  if (/\bround\b/.test(source)) out.push('Round');
  const inch = source.match(/\b(\d{2,3})\s?(in|inch|inches)\b/);
  if (inch) out.push(`${inch[1]} Inch`);
  const dimensionPairs = source.match(/(\d{2,3}(?:\.\d+)?)\s?(?:\"|in|inch|inches)\s?(l|w|h|d|length|width|height|depth)\b/g) || [];
  for (const dim of dimensionPairs) {
    const m = dim.match(/(\d{2,3}(?:\.\d+)?)\s?(?:\"|in|inch|inches)\s?(l|w|h|d|length|width|height|depth)\b/);
    if (!m) continue;
    const map = { l: 'L', length: 'L', w: 'W', width: 'W', h: 'H', height: 'H', d: 'D', depth: 'D' };
    const axis = map[m[2]];
    if (axis) out.push(`${m[1]}in ${axis}`);
  }
  if (!out.length) {
    const type = detectLocalItemType(source);
    if (type) out.push(type);
  }
  return Array.from(new Set(out)).slice(0, 5);
}

function toTitle(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeImageCandidateUrl(rawUrl) {
  const text = String(rawUrl || '')
    .trim()
    .replace(/\\\//g, '/')
    .replace(/\\u0026/gi, '&');
  if (!text) return '';
  try {
    const url = new URL(text);
    const resizeParams = ['w', 'h', 'width', 'height', 'size', 's', 'fit', 'crop', 'dpr', 'thumb', 'thumbnail'];
    for (const key of resizeParams) {
      if (url.searchParams.has(key)) url.searchParams.delete(key);
    }
    if (/(^|\.)amazon\.[a-z.]+$/i.test(url.hostname) || /(^|\.)media-amazon\.com$/i.test(url.hostname) || /(^|\.)ssl-images-amazon\.com$/i.test(url.hostname)) {
      url.pathname = url.pathname.replace(/\._[^.]+_\.(jpg|jpeg|png|webp)$/i, '._SL1500_.$1');
    }
    return url.toString();
  } catch {
    return text;
  }
}

function normalizeImages(value) {
  const list = Array.isArray(value) ? value : [value];
  const buckets = new Map();
  const out = [];
  for (const entry of list) {
    const text = normalizeImageCandidateUrl(entry);
    if (!text) continue;
    const isHttpUrl = /^https?:\/\//i.test(text);
    const isDataImage = /^data:image\//i.test(text);
    if (!isHttpUrl && !isDataImage) continue;
    if (isHttpUrl && !looksLikeProductImage(text)) continue;
    const key = canonicalImageKey(text);
    if (!key) continue;
    const score = isHttpUrl ? estimateImageQualityScore(text) : 0;
    if (!buckets.has(key)) {
      buckets.set(key, { url: text, score, firstSeen: buckets.size });
      continue;
    }
    const current = buckets.get(key);
    if (score > current.score) {
      buckets.set(key, { url: text, score, firstSeen: current.firstSeen });
    }
  }
  const ordered = Array.from(buckets.values()).sort((a, b) => a.firstSeen - b.firstSeen);
  for (const best of ordered) {
    out.push(best.url);
    if (out.length >= 24) break;
  }
  return out;
}

function pinPrimaryImage(images, primaryImage) {
  const normalized = normalizeImages(images);
  const primary = String(primaryImage || '').trim();
  if (!primary) return normalized;
  const primaryKey = canonicalImageKey(primary);
  if (!primaryKey) return normalized;
  const match = normalized.find((src) => canonicalImageKey(src) === primaryKey);
  if (!match) return normalized;
  return [match, ...normalized.filter((src) => src !== match)];
}

function canonicalImageKey(rawUrl) {
  const text = String(rawUrl || '').trim();
  if (!text) return '';
  if (/^data:image\//i.test(text)) return text;
  try {
    const url = new URL(text);
    if (url.protocol === 'data:') return text;
    const pathname = url.pathname || '';
    const parts = pathname.split('/').filter(Boolean);
    const file = (parts[parts.length - 1] || '').toLowerCase()
      .replace(/\._[^.]+_(?=\.[a-z0-9]+$)/i, '')
      .replace(/[-_](?:\d{2,5}x\d{2,5})(?=\.[a-z0-9]+$)/i, '')
      .replace(/@[\dx]+(?=\.[a-z0-9]+$)/i, '');
    const dir = parts.slice(0, -1).join('/').toLowerCase();
    return `${url.hostname.toLowerCase()}/${dir}/${file}`;
  } catch {
    return text
      .toLowerCase()
      .replace(/[?#].*$/, '')
      .trim();
  }
}

function estimateImageQualityScore(rawUrl) {
  const text = String(rawUrl || '').trim();
  if (!text) return 0;
  let score = 0;
  try {
    const url = new URL(text);
    const combined = `${url.pathname} ${url.search}`.toLowerCase();
    const dims = [];
    for (const match of combined.matchAll(/(\d{2,5})[x_](\d{2,5})/g)) {
      dims.push(Number(match[1]) * Number(match[2]));
    }
    for (const match of combined.matchAll(/(?:w|width)=([0-9]{2,5})/g)) {
      dims.push(Number(match[1]) * Number(match[1]));
    }
    for (const match of combined.matchAll(/_s(?:x|y|l)(\d{2,5})_/g)) {
      const size = Number(match[1]);
      dims.push(size * size);
    }
    for (const match of combined.matchAll(/_ac_[a-z]{1,8}(\d{2,5})_/g)) {
      const size = Number(match[1]);
      dims.push(size * size);
    }
    const bestDim = dims.length ? Math.max(...dims) : 0;
    score += bestDim;
    if (/(thumbnail|thumb|icon|swatch|small|tiny|mini|_sm\b|\/sm\/)/i.test(combined)) score -= 120000;
    if (/(large|xl|zoom|hires|hero|full|original|2048|3000)/i.test(combined)) score += 80000;
  } catch {
    const lower = text.toLowerCase();
    if (/(thumbnail|thumb|icon|swatch|small|tiny|mini)/i.test(lower)) score -= 120000;
    if (/(large|xl|zoom|hires|hero|full|original)/i.test(lower)) score += 80000;
  }
  return score;
}

function looksLikeProductImage(url) {
  const text = String(url || '').trim();
  const lower = text.toLowerCase();
  if (!text) return false;
  if (
    lower.includes('logo') ||
    lower.includes('icon') ||
    lower.includes('favicon') ||
    lower.includes('sprite') ||
    lower.includes('avatar') ||
    lower.includes('placeholder') ||
    lower.includes('badge') ||
    lower.includes('verified') ||
    lower.includes('watermark') ||
    lower.includes('stamp') ||
    lower.includes('seal') ||
    lower.includes('swatch') ||
    lower.includes('captcha') ||
    lower.includes('perimeterx') ||
    lower.includes('px-captcha') ||
    lower.includes('px-cloud') ||
    lower.includes('/error/') ||
    lower.includes('images/g/01/error/') ||
    lower.includes('diagram') ||
    lower.includes('line-art') ||
    lower.includes('outline') ||
    lower.includes('glyph')
  ) {
    return false;
  }
  try {
    const parsed = new URL(text);
    const path = parsed.pathname.toLowerCase();
    if (/\.svg(?:$|\?)/i.test(path)) return false;
    if (/\/(?:icons?|logos?|sprites?|badges?)\//i.test(path)) return false;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const isAmazon =
      /(^|\.)amazon\.[a-z.]+$/.test(host) ||
      /(^|\.)media-amazon\.com$/.test(host) ||
      /(^|\.)ssl-images-amazon\.com$/.test(host);
    if (isAmazon) {
      if (!/\/images\/i\//i.test(path)) return false;
      const combined = `${path} ${parsed.search.toLowerCase()}`;
      if (/(amazonprime|primevideo|exploreprimevideo|sponsored|sims-|\/gp\/slredirect|customerimages|customerimage|reviewimage|review-media|reviewphotos|customerphotos|cr_arp|ratings)/i.test(combined)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function normalizeComments(value) {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((comment) => ({
      id: String(comment?.id || crypto.randomUUID()),
      author: String(comment?.author || currentUserName).trim() || currentUserName,
      text: String(comment?.text || '').trim(),
      createdAt: String(comment?.createdAt || '')
    }))
    .filter((comment) => comment.text);
}

function normalizeFeedbacks(value) {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((entry) => {
      const author = String(entry?.author || currentUserName).trim() || currentUserName;
      const initials = String(entry?.initials || getInitialsFromName(author)).trim() || getInitialsFromName(author);
      const text = String(entry?.text || '').replace(/\s+/g, ' ').trim().slice(0, 200);
      const emojis = Array.isArray(entry?.emojis)
        ? entry.emojis
          .map((emoji) => String(emoji || '').trim())
          .filter((emoji) => EMOJI_OPTIONS.includes(emoji))
          .slice(0, 3)
        : [];
      return {
        id: String(entry?.id || crypto.randomUUID()),
        author,
        initials,
        text,
        emojis
      };
    })
    .filter((entry) => entry.text || entry.emojis.length);
}

function getInitialsFromName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'U';
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

function normalizeDetailList(value, limit = 12) {
  const list = Array.isArray(value) ? value : [];
  const out = [];
  const seen = new Set();
  for (const entry of list) {
    const text = String(entry || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= limit) break;
  }
  return out;
}

function normalizeDetailSections(value) {
  const list = Array.isArray(value) ? value : [];
  const out = [];
  const seen = new Set();
  for (const section of list) {
    const title = String(section?.title || '').replace(/\s+/g, ' ').trim();
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    const lines = normalizeDetailList(section?.lines || section?.entries || [], 12);
    if (!lines.length) continue;
    seen.add(key);
    out.push({ title, lines });
    if (out.length >= 8) break;
  }
  return out;
}

function normalizeOverviewBullets(value, limit = 6) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\r?\n/) : [];
  const out = [];
  const seen = new Set();
  for (const entry of list) {
    const text = String(entry || '').replace(/^[•\-\s]+/, '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= limit) break;
  }
  return out;
}

function truncateAtWordBoundary(text, maxChars = 500) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxChars) return normalized;
  const limit = Math.max(maxChars - 3, 1);
  const sliced = normalized.slice(0, limit);
  const cut = sliced.lastIndexOf(' ');
  const clipped = cut > Math.floor(limit * 0.65) ? sliced.slice(0, cut) : sliced;
  return `${clipped.trim()}...`;
}

function splitToSentencesForSummary(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .split(/[.!?]\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function stripLeadingName(text, name) {
  const source = String(text || '').replace(/\s+/g, ' ').trim();
  const itemName = String(name || '').replace(/\s+/g, ' ').trim();
  if (!source || !itemName) return source;
  const escaped = escapeRegExp(itemName);
  const noLead = source
    .replace(new RegExp(`^${escaped}\\s*[:\\-–—]\\s*`, 'i'), '')
    .replace(new RegExp(`^${escaped}\\s+`, 'i'), '')
    .trim();
  return noLead || source;
}

function tokenizeForSimilarity(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
  );
}

function isMostlyItemTitleText(text, name) {
  const left = tokenizeForSimilarity(text);
  const right = tokenizeForSimilarity(name);
  if (left.size < 4 || right.size < 4) return false;
  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) overlap += 1;
  }
  const ratio = overlap / Math.max(1, Math.min(left.size, right.size));
  return ratio >= 0.75 && left.size <= right.size + 5;
}

function cleanOverviewSourceText(text, name = '') {
  let clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  clean = clean
    .replace(/^\s*(?:amazon(?:\.com)?|wayfair|allmodern|joss\s*&?\s*main|jossandmain|birch\s*lane|birchlane|perigold|article|lowes|bed\s*bath\s*&?\s*beyond|target|walmart)\s*:\s*/i, '')
    .replace(/\s*:\s*(?:toys?\s*&\s*games?|home\s*&\s*kitchen|sports?\s*&\s*outdoors?|patio,\s*lawn\s*&\s*garden|beauty\s*&\s*personal\s*care|electronics?)\s*$/i, '')
    .trim();
  clean = stripLeadingName(clean, name);
  if (isMostlyItemTitleText(clean, name)) return '';
  if (
    /^(?:amazon(?:\.com)?|wayfair|allmodern|perigold|target|walmart)\b/i.test(clean) &&
    clean.length < 220 &&
    !/[.!?]/.test(clean)
  ) {
    return '';
  }
  return clean;
}

function extractQuantityHint(text) {
  const value = String(text || '');
  const rules = [
    { pattern: /\bset of\s*(\d+)\b/i, map: (m) => `set of ${m[1]}` },
    { pattern: /\bpack of\s*(\d+)\b/i, map: (m) => `pack of ${m[1]}` },
    { pattern: /\b(\d+)\s*[- ]?(?:piece|pc)\b/i, map: (m) => `${m[1]}-piece` },
    { pattern: /\b(\d+)\s*count\b/i, map: (m) => `${m[1]} count` }
  ];
  for (const rule of rules) {
    const match = value.match(rule.pattern);
    if (match) return rule.map(match);
  }
  return '';
}

function extractAgeRangeHint(text) {
  const value = String(text || '');
  const range = value.match(/\bages?\s*(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\b/i) || value.match(/\b(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\s*(?:years?|yrs?)\b/i);
  if (range) return `Ages ${range[1]}-${range[2]}`;
  const plus = value.match(/\bages?\s*(\d{1,2})\s*\+\b/i) || value.match(/\b(\d{1,2})\s*\+\s*(?:years?|yrs?)\b/i);
  if (plus) return `Ages ${plus[1]}+`;
  const spaced = value.match(/\bfor\s+((?:\d{1,2}\s+){2,6})year old\b/i);
  if (spaced?.[1]) {
    const numbers = spaced[1].trim().split(/\s+/).map((n) => Number(n)).filter((n) => Number.isFinite(n));
    if (numbers.length) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      if (min === max) return `Ages ${min}`;
      return `Ages ${min}-${max}`;
    }
  }
  return '';
}

function extractIncludedItemsHint(text, specs = []) {
  const search = `${String(text || '')} ${Array.isArray(specs) ? specs.join(' ') : ''}`.replace(/\s+/g, ' ').trim();
  if (!search) return '';
  const match = search.match(/\b(?:includes?|comes with|in the box|package includes?)\s*[:\-]?\s*([^.!?;]{8,130})/i);
  if (!match?.[1]) return '';
  return match[1].replace(/\s+/g, ' ').trim();
}

function pickNarrativeSpecLines(specs = [], limit = 3) {
  const out = [];
  for (const raw of Array.isArray(specs) ? specs : []) {
    const line = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!line) continue;
    if (line.length < 35 || line.length > 420) continue;
    if (/^(dimensions?|size|color|material|weight|capacity)\s*:/i.test(line)) continue;
    if (/(shipping|returns|warranty|customer reviews|sponsored|compare with|report an issue|sign in)/i.test(line)) continue;
    out.push(line);
    if (out.length >= limit) break;
  }
  return out;
}

function composeOverviewParagraph({ name = '', description = '', specs = [], highlights = [], maxChars = 300 }) {
  const seen = new Set();
  const candidates = [];
  const pushCandidate = (value) => {
    const clean = cleanOverviewSourceText(String(value || '').replace(/^[•\-\s]+/, '').trim(), name);
    if (!clean) return;
    if (clean.length < 28) return;
    if (/(shipping|returns|warranty|customer reviews|sponsored|compare with|report an issue|sign in)/i.test(clean)) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(clean);
  };

  for (const sentence of splitToSentencesForSummary(description)) {
    pushCandidate(sentence);
  }
  for (const line of pickNarrativeSpecLines(specs, 4)) {
    for (const sentence of splitToSentencesForSummary(line)) {
      pushCandidate(sentence);
    }
  }

  let text = '';
  for (const candidate of candidates) {
    const next = text ? `${text} ${candidate}` : candidate;
    if (next.length > 250 && text) break;
    text = next;
    if (text.length >= 140) break;
  }

  if (!text && description) {
    text = cleanOverviewSourceText(description, name);
  }
  if (!text && specs.length) {
    text = pickNarrativeSpecLines(specs, 1)[0] || String(specs[0] || '');
  }

  if (text.length < 90) {
    const featureTerms = normalizeDetailList(highlights, 3);
    if (featureTerms.length) {
      const prefix = text ? `${text}${/[.!?]$/.test(text) ? '' : '.'} ` : '';
      text = `${prefix}Notable features include ${featureTerms.join(', ')}.`;
    }
  }

  text = cleanOverviewSourceText(text, name);
  if (text && !/[.!?]$/.test(text)) text = `${text}.`;
  return truncateAtWordBoundary(text, maxChars);
}

function extractColorHint(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  const explicit = value.match(/\bcolou?r\s*[:\-]?\s*([a-z][a-z0-9\s/-]{1,28})(?:[,.;]|$)/i);
  if (explicit?.[1]) return explicit[1].trim().toLowerCase();
  const palette = [
    'black', 'white', 'gray', 'grey', 'silver', 'gold', 'bronze', 'beige', 'brown',
    'tan', 'cream', 'blue', 'navy', 'green', 'olive', 'red', 'burgundy', 'orange',
    'yellow', 'purple', 'pink', 'teal', 'charcoal'
  ];
  for (const color of palette) {
    if (new RegExp(`\\b${color}\\b`, 'i').test(value)) return color;
  }
  return '';
}

function pickSizeOrDimensionHint(item) {
  const dimensions = normalizeDetailList(item?.dimensions || [], 8);
  if (dimensions.length) return dimensions[0];
  const specs = normalizeDetailList(item?.specs || [], 12);
  return specs.find((line) => /(?:\d+\s*(?:\"|in|inch|inches|cm|mm|ft|oz|lb|lbs|kg|qt|gal)\b|dimension|length|width|height|depth|capacity|weight)/i.test(line)) || '';
}

function collectUseCaseHints(text) {
  const value = String(text || '').toLowerCase();
  const rules = [
    [/\boutdoor\b|\bpatio\b/, 'outdoor spaces'],
    [/\bindoor\b/, 'indoor spaces'],
    [/\bkitchen\b/, 'kitchen'],
    [/\bbath(?:room)?\b/, 'bathroom'],
    [/\bdining\b/, 'dining area'],
    [/\bliving room\b/, 'living room'],
    [/\bbedroom\b/, 'bedroom'],
    [/\boffice\b/, 'office']
  ];
  const out = [];
  for (const [pattern, label] of rules) {
    if (pattern.test(value)) out.push(label);
    if (out.length >= 2) break;
  }
  return out;
}

function collectFeatureHints(text) {
  const value = String(text || '');
  const rules = [
    [/\bwaterproof\b|\bwater-resistant\b/i, 'water-resistant'],
    [/\bweather[- ]?resistant\b/i, 'weather-resistant'],
    [/\brust[- ]?resistant\b/i, 'rust-resistant'],
    [/\badjustable\b/i, 'adjustable'],
    [/\bfold(?:ing|able)?\b/i, 'foldable'],
    [/\bmachine washable\b/i, 'machine washable'],
    [/\bdishwasher safe\b/i, 'dishwasher safe'],
    [/\bcordless\b/i, 'cordless'],
    [/\bheavy[- ]?duty\b/i, 'heavy-duty']
  ];
  const out = [];
  for (const [pattern, label] of rules) {
    if (pattern.test(value)) out.push(label);
    if (out.length >= 2) break;
  }
  return out;
}

function buildOverviewModel(item, maxChars = 500) {
  const name = String(item?.name || '').replace(/\s+/g, ' ').trim();
  const description = cleanOverviewSourceText(item?.description || '', name);
  const specs = normalizeDetailList(item?.specs || [], 12);
  const materials = normalizeDetailList(item?.materials || [], 8);
  const highlights = normalizeHighlights(item?.highlights || []);
  const explicitOverview = cleanOverviewSourceText(
    truncateAtWordBoundary(item?.overview || item?.aiOverview || '', maxChars),
    name
  );
  const search = [description, ...specs, ...materials, ...highlights, name].join(' ');

  const bullets = [];
  const addBullet = (label, value) => {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const line = `${label}: ${clean}`;
    if (bullets.some((entry) => entry.toLowerCase() === line.toLowerCase())) return;
    bullets.push(line);
  };
  const quantity = extractQuantityHint(search);
  addBullet('Quantity', quantity);

  const size = pickSizeOrDimensionHint(item);
  addBullet(/x|×|dimension|length|width|height|depth/i.test(size) ? 'Dimensions' : 'Size', size);

  const color = extractColorHint([description, ...specs].join(' '));
  addBullet('Color', color);

  addBullet('Age range', extractAgeRangeHint(search));
  addBullet('Material', materials.slice(0, 2).join(', '));
  addBullet('Includes', extractIncludedItemsHint(`${description} ${highlights.join(' ')}`, specs));

  const uses = collectUseCaseHints(search);
  addBullet('Best for', uses.join(', '));

  const features = collectFeatureHints([description, ...specs, ...highlights].join(' '));
  addBullet('Features', features.join(', '));

  if (!bullets.length) {
    for (const spec of specs) {
      const line = String(spec || '').replace(/\s+/g, ' ').trim();
      if (!/^[a-z][a-z0-9\s/&()+.-]{2,24}:\s+.+/i.test(line)) continue;
      if (bullets.some((entry) => entry.toLowerCase() === line.toLowerCase())) continue;
      bullets.push(line);
      if (bullets.length >= 3) break;
    }
  }

  const explicitBullets = normalizeOverviewBullets(item?.overviewBullets || []);
  for (const line of explicitBullets) {
    if (bullets.length >= 6) break;
    if (!bullets.some((entry) => entry.toLowerCase() === line.toLowerCase())) bullets.push(line);
  }

  let text = explicitOverview;
  if (text && /(?:^|[.\s])(?:quantity|size|dimensions|color|material|features|best for|age range)\s*:/i.test(text)) {
    text = '';
  }
  if (!text) {
    text = composeOverviewParagraph({
      name,
      description,
      specs,
      highlights,
      maxChars: Math.min(maxChars, 300)
    });
  }
  text = cleanOverviewSourceText(text, name);
  text = truncateAtWordBoundary(text, Math.min(maxChars, 300));

  const clippedBullets = [];
  let used = text.length;
  for (const line of bullets) {
    const candidate = String(line || '').replace(/\s+/g, ' ').trim();
    if (!candidate) continue;
    const extra = candidate.length + (used > 0 ? 1 : 0);
    if (used + extra > maxChars) break;
    clippedBullets.push(candidate);
    used += extra;
    if (clippedBullets.length >= 6) break;
  }

  return { text, bullets: clippedBullets };
}

const HIGHLIGHT_BULLET = '• ';
const HIGHLIGHT_MARKER_PATTERN = /^\s*(?:[\u2022•◦·\-*]|[0-9]+[.)])\s*/;

function normalizeHighlights(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|[•-]\s+/)
      .map((entry) => String(entry || '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  return [];
}

function parseHighlightsText(text) {
  return normalizeHighlights(
    String(text || '')
      .split(/\r?\n/)
      .map((line) => line.replace(HIGHLIGHT_MARKER_PATTERN, '').trim())
      .filter(Boolean)
  );
}

function formatHighlightsForEditor(lines) {
  const normalized = Array.isArray(lines) ? lines : [];
  if (!normalized.length) return HIGHLIGHT_BULLET;
  return normalized
    .map((line) => `${HIGHLIGHT_BULLET}${String(line || '').replace(HIGHLIGHT_MARKER_PATTERN, '')}`)
    .join('\n');
}

function attachHighlightsEditorHandlers(field) {
  if (!field || field.dataset.highlightsEditor === 'true') return;
  if (!(field instanceof HTMLTextAreaElement)) return;
  field.dataset.highlightsEditor = 'true';
  field.classList.add('inline-highlights-editor');
  const handleEnter = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
    if (typeof field.selectionStart !== 'number' || typeof field.selectionEnd !== 'number') return;
    event.preventDefault();
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const value = field.value;
    const insertion = `\n${HIGHLIGHT_BULLET}`;
    field.value = `${value.slice(0, start)}${insertion}${value.slice(end)}`;
    const cursor = start + insertion.length;
    field.setSelectionRange(cursor, cursor);
  };
  const handlePaste = (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) return;
    const text = String(clipboard.getData('text/plain') || '');
    if (!text) return;
    event.preventDefault();
    const start = typeof field.selectionStart === 'number' ? field.selectionStart : field.value.length;
    const end = typeof field.selectionEnd === 'number' ? field.selectionEnd : start;
    const before = field.value.slice(0, start);
    const after = field.value.slice(end);
    const bulletized = formatHighlightsForEditor(text.split(/\r?\n/));
    field.value = `${before}${bulletized}${after}`;
    const cursor = start + bulletized.length;
    field.setSelectionRange(cursor, cursor);
  };
  field.addEventListener('keydown', handleEnter);
  field.addEventListener('paste', handlePaste);
}

if (editHighlights) {
  attachHighlightsEditorHandlers(editHighlights);
}

function normalizeAmountString(rawAmount) {
  const compact = String(rawAmount || '')
    .replace(/[,\s]/g, '')
    .trim();
  if (!compact) return '';
  if (!/^\d+(?:\.\d{1,2})?$/.test(compact)) return '';
  const [wholeRaw, fractionRaw = ''] = compact.split('.');
  const whole = wholeRaw.replace(/^0+(?=\d)/, '') || '0';
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (!fractionRaw) return formattedWhole;
  const fraction = fractionRaw.padEnd(2, '0').slice(0, 2);
  return `${formattedWhole}.${fraction}`;
}

function normalizePriceToken(rawToken) {
  const token = String(rawToken || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!token) return '';

  const leading = token.match(/^(US\$|CA\$|C\$|AU\$|A\$|USD|CAD|AUD|EUR|GBP|\$|£|€)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)$/i);
  if (leading) {
    const currency = leading[1].toUpperCase();
    const amount = normalizeAmountString(leading[2]);
    if (!amount) return '';
    if (currency === '$' || currency === 'US$' || currency === 'USD') return `$${amount}`;
    if (currency === '£' || currency === 'GBP') return `£${amount}`;
    if (currency === '€' || currency === 'EUR') return `€${amount}`;
    if (currency === 'CA$' || currency === 'C$' || currency === 'CAD') return `C$${amount}`;
    if (currency === 'AU$' || currency === 'A$' || currency === 'AUD') return `A$${amount}`;
    return `${currency} ${amount}`;
  }

  const trailing = token.match(/^([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(USD|CAD|AUD|EUR|GBP)$/i);
  if (trailing) {
    const amount = normalizeAmountString(trailing[1]);
    const code = trailing[2].toUpperCase();
    if (!amount) return '';
    if (code === 'USD') return `$${amount}`;
    if (code === 'GBP') return `£${amount}`;
    if (code === 'EUR') return `€${amount}`;
    if (code === 'CAD') return `C$${amount}`;
    if (code === 'AUD') return `A$${amount}`;
    return `${code} ${amount}`;
  }

  const numericOnly = token.match(/^([0-9][0-9,]*(?:\.[0-9]{1,2})?)$/);
  if (numericOnly) {
    const amount = normalizeAmountString(numericOnly[1]);
    return amount ? `$${amount}` : '';
  }

  return '';
}

function formatPrice(value) {
  const text = String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#36;/g, '$')
    .trim();
  if (!text) return '';

  const patterns = [
    /(?:US\$|CA\$|C\$|AU\$|A\$|USD|CAD|AUD|EUR|GBP|\$|£|€)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi,
    /[0-9][0-9,]*(?:\.[0-9]{1,2})?\s*(?:USD|CAD|AUD|EUR|GBP)\b/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const normalized = normalizePriceToken(match[0]);
      if (!normalized) continue;
      const suffix = text.slice(match.index + match[0].length).trim();
      return suffix ? `${normalized} ${suffix}` : normalized;
    }
    pattern.lastIndex = 0;
  }

  const normalized = normalizePriceToken(text);
  if (normalized) return normalized;
  return text;
}

function loadView() {
  try {
    const value = localStorage.getItem(VIEW_STORAGE_KEY);
    return value === 'image' ? 'image' : 'list';
  } catch {
    return 'list';
  }
}

function saveView() {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, activeView);
  } catch {
    // ignore storage quota errors for non-critical view preference
  }
}

function applyViewMode() {
  const showImage = activeView === 'image';
  listViewSection.classList.toggle('hidden', showImage);
  imageViewSection.classList.toggle('hidden', !showImage);
  for (const button of viewToggleButtons) {
    button.classList.toggle('active', button.dataset.view === activeView);
  }
  boardScreen?.classList.toggle('image-view-mode', activeView === 'image');
}

function createViewToggle() {
  const toggle = document.createElement('div');
  toggle.className = 'view-toggle';
  toggle.setAttribute('role', 'tablist');
  toggle.setAttribute('aria-label', 'View mode');
  toggle.appendChild(createViewToggleButton('list', 'List View'));
  toggle.appendChild(createViewToggleButton('image', 'Image View'));
  return toggle;
}

function createViewToggleButton(viewValue, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'view-btn';
  button.dataset.view = viewValue;
  button.textContent = label;
  button.addEventListener('click', () => {
    activeView = viewValue === 'image' ? 'image' : 'list';
    saveView();
    const board = getActiveBoard();
    if (board && activeView === 'image') {
      if (activeCategoryPath.length) {
        activeImageRootCategoryId = '';
        expandImageViewTargetCategory(board);
      } else {
        activeImageRootCategoryId = '';
        expandedCategoryIds.clear();
        lastExpandedCategoryId = '';
      }
    }
    if (board && activeView === 'list' && activeCategoryPath.length === 0) {
      if (activeImageRootCategoryId) {
        // Leaving focused image root: keep expanded category/subcategory context in list view.
        activeImageRootCategoryId = '';
      } else {
        // Leaving root image gallery: reset to fully collapsed list view.
        expandedCategoryIds.clear();
        lastExpandedCategoryId = '';
      }
    }
    if (board) {
      renderBoardDetail();
    } else {
      applyViewMode();
    }
  });
  viewToggleButtons.add(button);
  button.classList.toggle('active', button.dataset.view === activeView);
  return button;
}

function expandImageViewTargetCategory(board) {
  const path = resolveImageViewTargetPath(board);
  if (!path.length) return;
  for (const id of path) {
    expandedCategoryIds.add(id);
  }
  lastExpandedCategoryId = path[path.length - 1] || '';
}

function resolveImageViewTargetPath(board) {
  const activePath = getValidatedActiveCategoryPath(board);
  if (activePath.length) return withFirstRealChild(board, activePath);

  const expandedRootPath = getExpandedRootPath(board);
  if (expandedRootPath.length) return withFirstRealChild(board, expandedRootPath);

  if (lastExpandedCategoryId && expandedCategoryIds.has(lastExpandedCategoryId)) {
    const path = findCategoryPathById(board, lastExpandedCategoryId);
    if (path.length) return path;
  }

  const expandedIds = Array.from(expandedCategoryIds);
  for (let i = expandedIds.length - 1; i >= 0; i -= 1) {
    const path = findCategoryPathById(board, expandedIds[i]);
    if (path.length) return path;
  }

  return getDefaultImageViewPath(board);
}

function getExpandedRootPath(board) {
  const roots = Array.isArray(board?.categories) ? board.categories : [];
  for (const root of roots) {
    if (root?.id && expandedCategoryIds.has(root.id)) {
      return [root.id];
    }
  }
  return [];
}

function getValidatedActiveCategoryPath(board) {
  if (!Array.isArray(activeCategoryPath) || !activeCategoryPath.length) return [];
  const node = getCategoryNodeByPath(board, activeCategoryPath);
  return node ? [...activeCategoryPath] : [];
}

function withFirstRealChild(board, path) {
  if (!Array.isArray(path) || !path.length) return [];
  if (path.length !== 1) return [...path];
  const node = getCategoryNodeByPath(board, path);
  if (!node) return [...path];
  const child = getFirstRealChildNode(node);
  if (!child?.id) return [...path];
  return [...path, child.id];
}

function getDefaultImageViewPath(board) {
  const roots = Array.isArray(board?.categories) ? board.categories : [];
  const firstRoot = roots[0];
  if (!firstRoot?.id) return [];
  const firstChild = getFirstRealChildNode(firstRoot);
  return firstChild?.id ? [firstRoot.id, firstChild.id] : [firstRoot.id];
}

function getFirstRealChildNode(node) {
  const children = Array.isArray(node?.children) ? node.children : [];
  const realChildren = children.filter((child) => !/^all items$/i.test(String(child?.name || '').trim()));
  if (!realChildren.length) return null;
  const withImages = realChildren.find((child) => categoryNodeHasAnyImages(child));
  return withImages || null;
}

function categoryNodeHasAnyImages(node) {
  if (!node) return false;
  const items = collectAllItemsFromCategory(node);
  return items.some((item) => normalizeImages(item?.images || item?.image).length > 0);
}

function findCategoryPathById(board, targetId) {
  const roots = Array.isArray(board?.categories) ? board.categories : [];
  if (!targetId || !roots.length) return [];

  const stack = roots.map((node) => ({ node, path: [node.id] }));
  while (stack.length) {
    const current = stack.pop();
    if (!current?.node) continue;
    if (current.node.id === targetId) return current.path;
    const children = Array.isArray(current.node.children) ? current.node.children : [];
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const child = children[i];
      if (!child?.id) continue;
      stack.push({ node: child, path: [...current.path, child.id] });
    }
  }

  return [];
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeRegExp(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeCssUrl(text) {
  return String(text).replaceAll('\"', '\\\"');
}

function escapeCssSelector(text) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(String(text || ''));
  }
  return String(text || '').replace(/["\\]/g, '\\$&');
}

function buildFallbackItem(rawUrl) {
  let seller = 'Unknown seller';
  let name = 'Untitled item';
  try {
    const url = new URL(rawUrl);
    seller = url.hostname.replace(/^www\./, '');
    const segments = url.pathname.split('/').filter(Boolean);
    const slug = decodeURIComponent(segments[segments.length - 1] || seller);
    name = slug
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  } catch {
    // Keep defaults if URL parsing fails unexpectedly.
  }

  return {
    id: crypto.randomUUID(),
    url: rawUrl,
    brand: inferBrandFromDescription(name),
    name: normalizeItemName(name, rawUrl),
    image: '',
    images: [],
    seller,
    price: '',
    highlights: [],
    description: '',
    dimensions: [],
    materials: [],
    specs: [],
    overview: '',
    overviewBullets: [],
    detailSections: [],
    customFieldValues: {},
    feedbacks: [],
    comments: []
  };
}
