
import './css/styles.css';
//import { fetchPixabay } from './js/feachApiService';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
// Описаний в документації
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";
const searchForm = document.querySelector('.js-search');
const addCountry = document.querySelector('.js-add');
const list = document.querySelector('.js-list');
const formContainer = document.querySelector('.js-form-container');
addCountry.addEventListener('click', onAddInput);

function onAddInput() {
  const markup = '<input type="text" name="country">';
  formContainer.insertAdjacentHTML('beforeend', markup);
}
searchForm.addEventListener('submit', onForm);

function onForm(e) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const arr = data.getAll('country').filter(item => item).map(item=>item.trim());
 // console.log(arr);
  getCountries(arr).then(async resp => {
    const capitals = resp.map(({ capital }) => capital[0]);
    //console.log(capitals);
    const weatherService = await getWeather(capitals);
    list.innerHTML=createMarkup(weatherService)
  }).catch(e=>console.log(e));
  //console.log(data.getAll('country'));
}

async function getCountries(arr) {
  const resps = arr.map(async item => {
    const resp=await fetch(`https://restcountries.com/v3.1/name/${item}`)
    if (!resp.ok) {
    throw new Error()
    }
    return resp.json();
  })
  const data = await Promise.allSettled(resps);
  const countryObj = data.filter(({ status }) => status === 'fulfilled').map(({ value }) => value[0]);
 return countryObj;
}
async function getWeather(arr) {
  const BASE_URL = 'http://api.weatherapi.com/v1';
  const API_KEY = '4f5e71f90d35417195c172609231704';

  const resps = arr.map(async city => {
     const params = new URLSearchParams({
    key: API_KEY,
    q: city,
    lang: 'uk'
     });
    const resp = await fetch(`${BASE_URL}/current.json?${params}`);
     if (!resp.ok) {
        throw new Error(resp.statusText);
      }
      return resp.json();
  })
 const data = await Promise.allSettled(resps);
  const objs = data.filter(({ status }) => status === "fulfilled").map(({ value }) => value);

    return objs
}
function createMarkup(arr) {
    return arr.map(({ current: { temp_c, condition: { text, icon } }, location: { country, name } }) =>
        `<li>
    <div>
        <h2>${country}</h2>
        <h3>${name}</h3>
    </div>
    <img src="${icon}" alt="${text}">
    <p>${text}</p>
    <p>${temp_c}</p>
</li>`).join('')
}
