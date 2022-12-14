import { Modal } from './UI/Modal';
import { Map } from './UI/Map';
import { getCoordsFromAddress, getAddressFromCoords } from './Utility/Location'

class PlaceFinder {
  constructor() {
    const addressForm = document.querySelector('form');
    const locateUserBtn = document.getElementById('locate-btn');
    this.shareBtn = document.getElementById('share-btn');

    locateUserBtn.addEventListener('click', this.locateUserHandler.bind(this));
    this.shareBtn.addEventListener('click', this.sharePlaceHandler);
    addressForm.addEventListener('submit', this.findAddressHandler.bind(this));
  }

  sharePlaceHandler() {
    const shareedLinkInputElement = document.getElementById('share-link');
    if (!navigator.clipboard) {
      shareedLinkInputElement.select();
      return;
    }

    navigator.clipboard.writeText(shareedLinkInputElement.value).then(() => {
      alert('Copied into clipboard!');
    }).catch(err => {
      console.log(err);
      shareedLinkInputElement.select();
    })

  }

  selectPlace(coordinates, address) {
    if (this.map) {
      this.map.render(coordinates);
    } else {
      this.map = new Map(coordinates);
    }
    this.shareBtn.desabled = false;
    const shareedLinkInputElement = document.getElementById('share-link');
    shareedLinkInputElement.value = `${location.origin}/my-place?address=${encodeURI(address)}&lat=${coordinates.lat}&lng=${coordinates.lng}`;

  }

  locateUserHandler() {
    if (!navigator.geolocation) {
      alert(
        'Location feature is not available in your browser - please use a more modern browser or manually enter an address.'
      );
      return;
    }

    const modal = new Modal('loading-modal-content', 'Loading location - please wait');
    modal.show();

    navigator.geolocation.getCurrentPosition(
      async successResult => {

        const coordinates = {
          lat: successResult.coords.latitude + Math.random() * 50,
          lng: successResult.coords.longitude + Math.random() * 50,
        };
        // console.log(coordinates);
        const address = await getAddressFromCoords(coordinates);
        modal.hide();
        this.selectPlace(coordinates, address);
      },
      error => {
        modal.hide();

        alert(
          'Could not locate you unfortunately. Please enter an address manually!'
        );
      }
    );
  }

  async findAddressHandler(event) {
    event.preventDefault();
    const address = event.target.querySelector('input').value;
    if (!address || address.trim().length === 0) {
      alert('Invalid address entered - plaese try again!');
      return;
    }

    const modal = new Modal('loading-modal-content', 'Loading location - please wait');
    modal.show();

    try {
      const coordinates = await getCoordsFromAddress(address);
      this.selectPlace(coordinates, address);
    } catch (err) {
      alert(err.message);
    }
    modal.hide();
  }
}

const placeFinder = new PlaceFinder();