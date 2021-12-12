'use strict';
//Luodaan ja valitaan kaikki elementit joita tarvitsee vain kerran luoda/valita
const m = document.querySelector('main');
const aside = document.querySelector('aside');
const url = 'https://api.rawg.io/api/games?key=e5846629f39541849125b3db1dfabb69&';
const article = document.createElement('article');
const kivijalka = document.createElement('a');
const pf = document.createElement('p');
const stores = document.createElement('p');
const div = document.createElement('div');
const h2 = document.createElement('h2');
const details = document.querySelector('details');
const info_img = document.createElement('img');
const req = document.createElement('p');
const form = document.querySelector('form');
const rating = document.createElement('div');
const slider = document.getElementById('myRange');
const value = document.getElementById('range');
const info_genre = document.createElement('p');
const rec_img = document.createElement('img');
const rec_h1 = document.createElement('h1');
const rec_h2 = document.createElement('h2');
const rec_genre = document.createElement('p');
const rec_rating = document.createElement('div');
const info_web = document.createElement('a');
const rec_plat = document.createElement('p');
const found = document.createElement('h2');
let dlc;
let range;
let haku;
let tyyli;
let page;
let arrange;
let plat;

//Asetetaan media querylle raja
const mediaQuery = window.matchMedia('(max-width: 700px)');

function handleTabletChange(e) {
  // tarkistaa onko query totta ja jos on, muuttaa aside ja main leveyden
  if (e.matches) {
    aside.style.width = '100%';
    m.style.width = '100%';
  } else {
    if (pf.innerText === '') {
      aside.style.width = '30%';
      m.style.width = '66%';
    } else {
      aside.style.width = '48%';
      m.style.width = '48%';
    }
  }
}

// asettaa kuuntelijan media queryyn
mediaQuery.addListener(handleTabletChange);

// Käynnistää media queryn
handleTabletChange(mediaQuery);

//random numero funktio suositusten näyttämiseen
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//Tulostetaan suosituspeli
suositus();

//Päivitetään slider value näkyviin käyttäjälle jatkuvasti
value.innerHTML = document.getElementById('myRange').value;
slider.oninput = function() {
  value.innerHTML = this.value;
};

//Asetetaan event kuuntelija hakukoneelle ja käynnistetään haku funktio
form.addEventListener('submit', async function(evt) {
  evt.preventDefault();
  m.innerHTML = ''; //Tyhjätään main-tagin sisältö aina jokaisen haun aluksi

  //Pienennetään advanced search valikko, jos se on isona kun painetaan search
  if (details.hasAttribute('open')) {
    details.removeAttribute('open');
  }

  //Tarkastetaan haluaako käyttäjä, että näytetään kaikki DLC:t ja erikoispainokset
  if (document.querySelector('input[name=dlc]:checked') === null) {
    dlc = '';
  } else {
    dlc = `exclude_additions=${document.querySelector(
        'input[name=dlc]:checked').value}&`;
  }

  /*Tarkistetaan missä järjestyksessä käyttäjä haluaa tulokset ja jos ei ole valittu
  asetetaan järjestys-muuttujan arvoksi tyhjä kenttä
   */
  if (document.querySelector('input[name=sort]:checked') === null) {
    arrange = '';
  } else {
    const sort = document.querySelector('input[name=sort]:checked');
    //Tarkistetaan järjestysmuuttujan 'sort' arvo ja muutetaan se vastakkaiseksi, jos arvot ovat tiettyjä
    if (sort.id === 'newest' || sort.value === 'metacritic' || sort.value ===
        'rating') {
      arrange = `ordering=-${sort.value}&`;
    } else {
      arrange = `ordering=${sort.value}&`;
    }
  }

  //Tulostetaan käyttäjän haluttu määrä haku tuloksia
  if (document.querySelector('input[name=page]:checked') === null) {
    page = '';
  } else {
    page = `page_size=${document.querySelector(
        'input[name=page]:checked').value}&`;
  }

  //Otetaan arvo sliderista ja asetetaan se range muuttujaan, mikä etsii pelejä, joilla on vähintään sliderin arvon verran pisteitä
  if (slider.value === '0') {
    range = '';
  } else {
    range = `metacritic=${slider.value},100&`;
  }

  /*Tarkistetaan onko tekstikenttään annettu arvoa ja jos ei ole, annetaan 'haku' muuttujan
  arvoksi tyhjä kenttä, muuten asetetaan tekstikentän arvo 'haku' muuttujaan
   */
  if (document.querySelector('input[name=search]').value === '') {
    haku = '';
  } else {
    const etsi = document.querySelector('input[name=search]');
    haku = `search=${etsi.value}&search_precise=true&`;
  }

  //Tarkistetaan minkä arvon käyttäjä on dropboxista ja annetaan se arvo 'tyyli' muuttujaan
  if (document.querySelector('#genre').value === '') {
    tyyli = '';
  } else {
    const genre = document.querySelector('#genre');
    tyyli = `genres=${genre.value}&`;
  }

  //Tarkistetaan onko käyttäjä valinnut hakurajaukseen jonkin alustan
  if (document.getElementById('platform').value === '') {
    plat = '';
  } else {
    plat = `parent_platforms=${document.getElementById('platform').value}&`;
  }

  //luodaan kokonainen hakuosoite api:lle
  const furl = url + dlc + arrange + tyyli + plat + range + haku + page;
  try {
    const vastaus = await fetch(furl);      //Haetaan api:sta halutulla tavalla tietoa
    if (!vastaus.ok) new Error('Jokin meni pieleen');
    const games = await vastaus.json();
    if (games.results.length === 0) {       //Jos yhtäkään hakutulosta ei löytynyt, tulostetaan ettei löytynyt
      const header = document.createElement('h1');
      header.innerText = 'Not even one result found!';
      m.appendChild(header);
    } else {
      /*
      Asetetaan main-tagin ja aside-tagin leveys
       */
      if (mediaQuery.matches) {

      } else {
        aside.style.width = '30%';
        m.style.width = '66%';
      }
      suositus();

      //Tulostetaan käyttäjälle kuinka monta tulosta löytyi
      found.innerText = `${games.count} games found!`;
      m.appendChild(found);

      //käydään läpi kaikki saadut tulokset ja luodaan jokaiselle tulokselle pelin kuva ja nimi
      for (let i = 0; i < games.results.length; i++) {
        const figure = document.createElement('figure');
        const caption = document.createElement('figcaption');
        const img = document.createElement('img');
        caption.classList.add('figcaption');
        caption.innerText = games.results[i].name;
        if (games.results[i].background_image === null) {
          img.src = 'pictures/noimagenew.jpg';
          img.alt = `Image of ${games.results[i].name} was not available`;
        } else {
          img.src = games.results[i].background_image;
          img.alt = `Image of ${games.results[i].name}`;
        }

        /*
        Luodaan jokaiselle kuvalle event kuuntelija, jota painamalla saa lisätietoa kyseisestä pelistä
        mikä näytettään aside-tagin sisällä.
         */
        img.addEventListener('click', async function() {
          try {
            //Etsitään pelin tietoja käyttäen pelien id:tä api:ssa
            const id = await fetch(
                `https://api.rawg.io/api/games/${games.results[i].id}?key=e5846629f39541849125b3db1dfabb69`);
            if (!vastaus.ok) new Error('Jokin meni pieleen');
            const info = await id.json();
            article.innerHTML = '';     //Tyhjätään article aina kun painetaan kuvaa, jotta tiedot ovat aina oikealle pelille

            //Pienennetään advanced search valikko, jos se on isona kun kuvaa painetaan
            if (details.hasAttribute('open')) {
              details.removeAttribute('open');
            }

            //Jos kuvaa ei ole saatavilla, asetataan meidän tekemä kuva pelille,
            //ja jos kuva on saatavilla, näytetään se
            if (info.background_image === null) {
              info_img.src = 'pictures/noimagenew.jpg';
              info_img.alt = `Image of ${games.results[i].name} was not available`;
            } else {
              info_img.src = games.results[i].background_image;
              info_img.alt = `Image of ${games.results[i].name}`;
            }
            /*
            Asetetaan aside- ja main-tagin leveys uudestaan, jotta enemmän tilaa tulisi pelien tiedoille,
            mutta jos on puhelimessa niin pitää nykyisen muotoilun
             */
            if (mediaQuery.matches) {

            } else {
              aside.style.width = '48%';
              m.style.width = '48%';
            }
            /*
            Asetetaan pelin tietoja erilaisiin muuttujiin ja asetetaan kaikki tiedot
            article-tagin sisälle
             */
            h2.innerText = info.name;

            info_genre.innerHTML = 'Genres: ';
            for (let j = 0; j < games.results[i].genres.length; j++) {
              if (j === games.results[i].genres.length - 1) {
                info_genre.innerText += games.results[i].genres[j].name;
              } else {
                info_genre.innerText += games.results[i].genres[j].name;
                info_genre.innerHTML += ', ';
              }
            }

            if (games.results[i].stores === null) {
              stores.innerHTML = `${info.name} not available at any virtual storefront`;
            } else {
              //Käydään läpi jokainen virtuaalinen kauppapaikka, mistä peli on saatavilla
              stores.innerText = 'Available at: ';
              for (let k = 0; k < games.results[i].stores.length; k++) {
                const link = document.createElement('a');
                link.classList.add('storeLink');
                if (k === games.results[i].stores.length - 1) {
                  link.innerText = games.results[i].stores[k].store.name;
                  link.href = `https://${games.results[i].stores[k].store.domain}`;
                  stores.appendChild(link);
                } else {
                  link.innerText = games.results[i].stores[k].store.name;
                  link.href = `https://${games.results[i].stores[k].store.domain}`;
                  stores.appendChild(link);
                  stores.innerHTML += ', ';
                }
              }
            }
            rating.innerText = `User rating: ${info.rating}/5`;

            //Tarkistetaan onko metacritic tietoa saatavilla, ja jos on, tulostetaan se
            if (info.metacritic === null) {
              div.innerText = 'No metacritic score available!';
            } else {
              div.innerText = `Metacritic score: ${info.metacritic}%`;
            }

            //Käydään läpi jokainen alusta, missä peliä pystyy pelaamaan ja tulostetaan ne
            pf.innerHTML = 'For platforms: ';
            for (let j = 0; j < info.platforms.length; j++) {
              let plat = info.platforms[j].platform.name;

              if (j === info.platforms.length - 1) {
                pf.innerText += plat;
              } else {
                pf.innerText += `${plat}, `;
              }

              //Tarkistetaan onko peliä saatavilla PC:lle ja jos on tulostetaan minimi-vaatimukset
              if (plat === 'PC') {
                req.innerHTML = 'PC specs: ';
                if (info.platforms[j].requirements.minimum === undefined) {
                  req.innerText += 'Minimum requirements not available!';
                } else {
                  req.innerText += info.platforms[j].requirements.minimum;
                }
              }
            }

            //Linkki karttasovellukseen, jossa kaikki suomen pelikaupat
            kivijalka.href = 'Kartta/kartta1.html';
            kivijalka.innerText = 'Game retail stores!';

            article.appendChild(info_img);
            article.appendChild(h2);
            //Jos pelillä on kotisivut, tulostetaan se näkyville
            if (!info.website === false) {
              info_web.href = info.website;
              info_web.classList.add('officialLink');
              info_web.innerText = `${info.name}'s official website`;
              article.appendChild(info_web);
            }

            article.appendChild(info_genre);
            article.innerHTML += info.description;
            article.appendChild(pf);
            article.appendChild(stores);
            article.appendChild(req);
            article.appendChild(rating);
            article.appendChild(div);
            article.appendChild(kivijalka);
            aside.appendChild(article);
          } catch (err) {
            console.log(err);
          }
        });

        /*
        Asetetaan jokainen hakutuloksen kuva ja nimi main-tagin sisälle.
         */
        figure.appendChild(img);
        figure.appendChild(caption);

        m.appendChild(figure);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

/*
Pelisuosittelu funktio: Suosittelee yhtä peliä 40 pelin joukosta aina kun sivu avataan ja kun painetaan etsi nappulaa
Tulostaa pelin nimen, genret, alustat, kuvan ja pelaajien arvion.
 */
async function suositus() {
  const page_size = 'page_size=40&';
  const ordering = 'ordering=-rating&';
  const exclude = 'exclude_additions=true&';
  const meta = 'metacritic=60,100&';
  try {
    const reco = await fetch(url + exclude + ordering + meta + page_size);
    if (!reco.ok) new Error('tapahtui jokin virhe!');
    const suosittele = await reco.json();
    article.innerHTML = '';
    const random = getRandomInt(40);

    rec_h1.innerText = 'Recommended game';

    rec_h2.innerText = suosittele.results[random].name;

    rec_genre.innerHTML = 'Genres : ';
    for (let i = 0; i < suosittele.results[random].genres.length; i++) {
      if (i === suosittele.results[random].genres.length - 1) {
        rec_genre.innerText += suosittele.results[random].genres[i].name;
      } else {
        rec_genre.innerText += `${suosittele.results[random].genres[i].name}, `;
      }
    }

    rec_plat.innerHTML = 'Platforms: ';
    for (let i = 0; i < suosittele.results[random].platforms.length; i++) {
      if (i === suosittele.results[random].platforms.length - 1) {
        rec_plat.innerText += suosittele.results[random].platforms[i].platform.name;
      } else {
        rec_plat.innerText += `${suosittele.results[random].platforms[i].platform.name}, `;
      }
    }

    rec_rating.innerText = `User raiting: ${suosittele.results[random].rating}/5`;

    article.appendChild(rec_h1);
    if (suosittele.results[random].background_image === null) {
      const no_pic = document.createElement('img');
      no_pic.src = 'pictures/noimagenew.jpg';
      no_pic.alt = 'No picture available';
      article.appendChild(no_pic);
    } else {
      rec_img.src = suosittele.results[random].background_image;
      rec_img.alt = `Image of ${suosittele.results[random].name}`;
      article.appendChild(rec_img);
    }
    article.appendChild(rec_h2);
    article.appendChild(rec_genre);
    article.appendChild(rec_plat);
    article.appendChild(rec_rating);
    aside.appendChild(article);
  } catch (e) {
    console.log(e);
  }
}

