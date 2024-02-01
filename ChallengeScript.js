
// definition of reusable elements
const closeButton = document.createElement('span');
closeButton.innerHTML = '&times;';
closeButton.className = 'close-button';

const popup = document.createElement('div');
popup.className = 'popup';

const overlay = document.createElement('div');
overlay.className = 'overlay';

let popUpOpened = false;


// function to get images from the url of the Detail Page
const fetchImages = async(url) => {
  try{
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // parse the plain text of the Detail Page
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Get all image elements and extract image URLs
    const images = doc.querySelectorAll('li.item[data-gallery*=".jpg"]');
    const imageURLs = Array.from(images).map(img => img.dataset.gallery);

    console.log('Image URLs:', imageURLs);
    return imageURLs;
  }
  catch (error){ 
      console.error('Fetch error:', error);
  };
}

// handler for the click on the Quick View element
const quickViewButtonClickHandler = async(event, imageElement) => {
  event.preventDefault();
  if(!popUpOpened) {
    popUpOpened = true;
    let currentIndex = 0; 
    popup.innerHTML = ''; // cleans the previous popup

    const carousel = document.createElement('div');
    carousel.id = 'carousel';

    const carouselContainer = document.createElement('div');
    carouselContainer.id = 'carousel-container';

    const prevBtn  = document.createElement('button');
    prevBtn.id = 'prevBtn';
    prevBtn.innerHTML = '<'

    const nextBtn = document.createElement('button');
    nextBtn.id = 'nextBtn';
    nextBtn.innerHTML = '>'

    const productURL = imageElement.getElementsByTagName('a')[0].href;
    console.log(productURL);
    
    // set and show the Overlay element
    overlay.innerHTML = 'Loading...';
    document.body.appendChild(overlay);

    // get the images from the Detail Page
    const images = await fetchImages(productURL);

    // remove the loading Overlay
    overlay.innerHTML = '';
    document.body.removeChild(overlay);

    // fill the carousel with all the images
    carousel.innerHTML = '';
    images.forEach((imageUrl) => {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.classList.add('carousel-image');

      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container');
      imgContainer.appendChild(img);

      carousel.appendChild(imgContainer);
    });

    // function to move the carousel to the next image
    function showNextImage() {
      currentIndex = (currentIndex + 1) % images.length;
      updateCarousel();
    }

    // function to move the carousel to the previous image
    function showPrevImage() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateCarousel();
    }

    // function to update the carousel's position
    function updateCarousel() {
      var transformValue = -currentIndex * 300 + 'px'; // since each image if fixed to 300px width, it will move 1 image
      carousel.style.transform = 'translateX(' + transformValue + ')';
      updateButtons();
    }
    
    // function to update the state of next and previous buttons
    function updateButtons() {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex > images.length - 4;
      nextBtn.style.display = currentIndex > images.length - 4 ? 'none' : ''
      prevBtn.style.display = currentIndex === 0 ? 'none' : ''
    }
    
    updateButtons();
    
    // set up event listeners for next and previous buttons
    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);
    
    carouselContainer.appendChild(prevBtn);
    carouselContainer.appendChild(carousel);
    carouselContainer.appendChild(nextBtn);
    
    // function to close the popup by clicking the 'x' button
    closeButton.addEventListener('click', () => {
      popUpOpened = false;
      document.body.removeChild(popup);
      document.body.removeChild(overlay);
    });

    // function to close the popup by clicking on the overlay element
    overlay.addEventListener('click', () => {
      popUpOpened = false;
      document.body.removeChild(popup);
      document.body.removeChild(overlay);
    });

    popup.innerHTML = '';
    popup.appendChild(closeButton);
    popup.appendChild(carouselContainer);
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
  }
}

// function to set the hover event on every image once the page is loaded
const setMouseOverEvent = () => {
  const imageElements = document.querySelectorAll('article.product-card');

  imageElements.forEach((imageElement) => {
    imageElement.addEventListener('mouseenter', () => {
      const quickViewButton = document.createElement('div');
      quickViewButton.textContent = 'Quick View';
      quickViewButton.className = 'quick-view-button';
      
       // remove existing click event listeners
       quickViewButton.removeEventListener('click', quickViewButtonClickHandler);

       // add click event listener
      quickViewButton.addEventListener('click', (event) => quickViewButtonClickHandler(event, imageElement));

      imageElement.appendChild(quickViewButton);
    });


    // remove the quick button when leaving the focus
    imageElement.addEventListener('mouseleave', () => {
      const quickViewButton = document.querySelector('.quick-view-button');
      if (quickViewButton) {
        imageElement.removeChild(quickViewButton);
      }
    });
  });
};

// set the hover event on every image once the page is loaded
window.onload = function() {
  setMouseOverEvent();
};

