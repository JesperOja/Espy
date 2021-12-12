'use strict';

const google = 'https://www.google.com/maps/dir/?api=1&';

let id;
let name;
let katu;
let kaupunki;
let cords;
let tama;
let posti;
const navigoi = document.querySelector('#navigoi a');
//const punainenIkoni = L.divIcon({className: 'punainen-ikoni'});
const vihreaIkoni = L.divIcon({className: 'vihrea-ikoni'});

const markkerit = [];

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

//const navigoi = document.querySelector('#navigoi a');


const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function paivitaKartta(crd) {
  map.setView([crd.latitude, crd.longitude], 13);
}

function lisaaMarker(crd, ikoni) {
  const markkeri = L.marker([crd.latitude, crd.longitude], {icon: ikoni}).addTo(map);
  return markkeri;
}

function success(pos) {
  const crd = pos.coords;
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  paivitaKartta(crd);
  const omaPaikka = lisaaMarker(crd, vihreaIkoni);
  omaPaikka.bindPopup('Olen tässä.').openPopup();
  markkerit.push(omaPaikka);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);


async function haku(){
  try{
    const vastaus = await   fetch("https://avoindata.prh.fi/bis/v1?totalResults=false&maxResults=200&resultsFrom=0&businessLineCode=47650");
    if(!vastaus.ok) throw new Error('Ei toimi');
    const yritykset = await vastaus.json();
    for (let i=0; i<yritykset.results.length; i++){
      id=yritykset.results[i].businessId;
      try{
        const tiedot = await fetch(`https://avoindata.prh.fi/bis/v1/${id}`)
        if(!tiedot.ok) throw new Error('Ei hyvä')
        const yhteys=await tiedot.json();
        name = yhteys.results[0].name;
        for (let j = 0; j < yhteys.results[0].addresses.length; j++) {
          if (yhteys.results[0].addresses[j].street === '' ||
              yhteys.results[0].addresses[j].street === katu) {
          } else {
            katu = yhteys.results[0].addresses[j].street;
            kaupunki = yhteys.results[0].addresses[j].city;
            posti = yhteys.results[0].addresses[j].postCode;
            try {
              {
                const vastaus1 = await fetch(
                    `https://api.digitransit.fi/geocoding/v1/search?text=${katu}&size=1`)
                if (!vastaus1.ok) throw new Error('Ei toimi');
                const yritykset1 = await vastaus1.json();
                cords = yritykset1.bbox[0];
                tama = yritykset1.bbox[1];
                nain(tama, cords)
              }
            } catch (er) {
              console.log(er)
            }
          }
        }
      }catch (er){
        console.log(er)
      }
    }
  }catch (er){
    console.log(er);
  }
}

function nain(tama, cords){
  L.marker([tama, cords]).addTo(map)
  .bindPopup(name + ', ' + katu + ', ' +posti+ ' ' +kaupunki )
      .on("popupopen", function(popup){
    navigoi.href = `${google}destination=${tama},${cords}&travelmode=transit&dir_action=navigate`
  console.log(tama);
      console.log(cords)
      })
}

haku();
