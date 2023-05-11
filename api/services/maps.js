const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise
});

const geocode = async address => {
  try {
    const response = await googleMapsClient
      .geocode({
        address
      })
      .asPromise();

    return response.json.results[0].geometry.location;
  } catch (err) {
    return err;
  }
};

module.exports = {
  geocode
};
