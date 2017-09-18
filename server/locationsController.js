const db = require('./knex');

const addLocation = (req, res) => {
  const location = req.body;

  for (let requiredParams of [
    'name',
    'latitude',
    'longitude',
    'phone_number',
    'website_url',
    'google_maps_id',
    'location_type_id'
  ]) {
    if (!location[requiredParams]) {
      return res
        .status(422)
        .json({ error: `Missing required parameter (${requiredParams}).` });
    }
  }

  db('locations')
    .insert(location, '*')
    .then(location => res.status(201).json({ data: location }))
    .catch(error => res.status(500).json({ error }));
};

const getLocations = (req, res) => {
  db('locations')
    .where(req.query)
    .select()
    .then(locations => res.status(200).json({ data: locations }))
    .catch(error => res.status(500).json({ error }));
};

const deleteLocation = (req, res) => {
  const businessName = req.headers.businessName;
  console.log(req.headers);
  if (req.headers.userStatus !== 'admin') {
    return res
      .status(401)
      .json({ message: 'You are not authorized to remove this business.' });
  }

  db('locations')
    .where('name', businessName)
    .select('id')
    .then(businessId => {
      db('happy_hours')
        .where('id', businessId[0].id)
        .del()
        .then(noMore => {
          res.status(200).json({
            deleted: `'${businessName}' with the id '${noMore}' has been deleted`
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

module.exports = {
  addLocation,
  getLocations,
  deleteLocation
};
