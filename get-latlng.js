const axios = require('axios');
const Places = require('./database/Places');
const API_KEY = 'AIzaSyBsG3lf2qagDLt2-ZYcXwCIntmtmXMln1A';

(async () => {
  let data = await Places.findAll({
    where: {
      latitude: null,
      longitude: null
    },
    limit: 1000
  });

  asyncForEach(data, async item => {
    try {
      let response = await axios({
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(item.dataValues.address)}&key=${API_KEY}`
      });

      if(response.data.status == 'OK') {
        let haveNumber = response.data.results[0].address_components.filter(address => {
          return address.types.includes('street_number');
        });
        let number = haveNumber.length > 0 ? haveNumber[0]['short_name'] : null;

        let haveNeighborhood = response.data.results[0].address_components.filter(address => {
          return address.types.includes('sublocality');
        });
        let neighborhood = haveNeighborhood.length > 0 ? haveNeighborhood[0]['short_name'] : null;

        item.update({
          latitude: response.data.results[0].geometry.location.lat,
          longitude: response.data.results[0].geometry.location.lng,
          number: number,
          street: response.data.results[0].address_components.filter(address => {
            return address.types.includes('route');
          })[0]['short_name'],
          neighborhood: neighborhood,
          city: response.data.results[0].address_components.filter(address => {
            return address.types.includes('administrative_area_level_2');
          })[0]['short_name'],
        });
      } else {
        console.log('There was an error');
      }
    } catch(error) {
      console.log('There was an error', error);
    }
  });

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();