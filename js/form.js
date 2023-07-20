import { isEscapeKey } from './util.js';
import { body } from './picture-modal.js';
import { onScaleClick } from './scale.js';
import { createSlider, onEffectsChange, setSliderUpdates } from './filters.js';


import { postData } from './api.js';
import { showSuccessPopup, showErrorPopup} from './submit-popup.js';
const submitButton = document.querySelector('.img-upload__submit');
const SubmitButtonText = {
  DEFAULT: 'Опубликовать',
  SENDING: 'Публикую...'
};



const MAX_COMMENTS_LENGTH = 140;
const MAX_HASHTAGS_LENGTH = 5;
const REGEX = /^#[a-zа-яё0-9]{1,19}$/i;
const ERORHASHTAGS = {
  validCount: 'Превышено количество хэш-тегов',
  validHashtag: 'Введён невалидный хэш-тег',
  nonrepeatingHashtag: 'Хэш-теги повторяются'
};

const uploadForm = document.querySelector('.img-upload__form');
const uploadOverlay = document.querySelector('.img-upload__overlay');
const uploadScale = document.querySelector('.img-upload__scale ');
const slider = uploadForm.querySelector('.effect-level__slider');
const effects = uploadForm.querySelector('.effects__list');
const sliderContainer = uploadForm.querySelector('.img-upload__effect-level');
const imagePreview = uploadForm.querySelector('.img-upload__preview img');
const effectLevel = uploadForm.querySelector('.effect-level__value');


const textHashtags = uploadForm.querySelector('.text__hashtags');
const textDescripton = uploadForm.querySelector('.text__description');


const pristine = new Pristine(uploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextClass: 'img-upload__error'
});

const validateDescripton = (value) => value.trim().length <= MAX_COMMENTS_LENGTH;
const descriptonError = () => `Длина комментария не больше ${MAX_COMMENTS_LENGTH} символов`;


pristine.addValidator(
  textDescripton, validateDescripton, descriptonError
);

const normalaseHashtags = (string) =>
  string.trim().toLowerCase().split(' ').filter((str) => str !== '');


const validCount = (value) =>
  normalaseHashtags(value).length <= MAX_HASHTAGS_LENGTH;

const validHashtag = (value) => normalaseHashtags(value).every((hashtag) => REGEX.test(hashtag));

const nonrepeatingHashtag = (value) => normalaseHashtags(value).length === new Set(normalaseHashtags(value)).size;


pristine.addValidator(
  textHashtags, validCount, ERORHASHTAGS.validCount
);

pristine.addValidator(
  textHashtags, validHashtag, ERORHASHTAGS.validHashtag
);

pristine.addValidator(
  textHashtags, nonrepeatingHashtag, ERORHASHTAGS.nonrepeatingHashtag
);


const blockSubmitButton = () => {
  submitButton.disabled = true;
  submitButton.textContent = SubmitButtonText.SENDING;
};

const unblockSubmitButton = () => {
  submitButton.disabled = false;
  submitButton.textContent = SubmitButtonText.DEFAULT;
};





const validatePristine = (evt) => {
  evt.preventDefault();
  const isValid = pristine.validate();
  if (isValid) {
    blockSubmitButton();
    postData(new FormData(evt.target))
      .then(() => {
        closeUploadOverlay();
        showSuccessPopup();
      })
      .catch(
        (error) => {
          showErrorPopup(error.message);
        }
      )
      .finally(unblockSubmitButton);
  }
  // const isValid = pristine.validate();
  // if (!isValid) {
  //   evt.preventDefault();
  //   console.log('Нельзя отправлять');
  // } else {
  //   console.log('Можно отправлять');
  // }
};


const onDocumentKeydown = (evt) => {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    if (document.activeElement !== textHashtags &&
      document.activeElement !== textDescripton) {
      closeUploadOverlay();
    }
  }
};

const onOverlayClick = (evt) => {
  if (evt.target.matches('.img-upload__overlay') || evt.target.closest('.img-upload__cancel')) {
    closeUploadOverlay();
  }
};

function closeUploadOverlay() {
  uploadForm.reset();
  pristine.reset();
  slider.noUiSlider.destroy();
  body.classList.remove('modal-open');
  uploadOverlay.classList.add('hidden');
  document.removeEventListener('keydown', onDocumentKeydown);
  uploadForm.removeEventListener('click', onOverlayClick);
  uploadForm.removeEventListener('submit', validatePristine);
  uploadScale.removeEventListener('click', onScaleClick);
  effects.removeEventListener('change', onEffectsChange);
}

const onOpenReset = () => {
  sliderContainer.classList.add('hidden');
  imagePreview.style.filter = null;
};

const openUploadOverlay = () => {
  uploadOverlay.classList.remove('hidden');
  body.classList.add('modal-open');
  createSlider(slider);
  setSliderUpdates();
  onOpenReset();
  uploadForm.addEventListener('click', onOverlayClick);
  uploadForm.addEventListener('submit', validatePristine);
  uploadScale.addEventListener('click', onScaleClick);
  document.addEventListener('keydown', onDocumentKeydown);
  effects.addEventListener('change', onEffectsChange);
};

export { openUploadOverlay };
export { uploadScale };
export { sliderContainer, slider, imagePreview, effectLevel };
