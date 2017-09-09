const 		express 				= require('express');
const 		app 								= express();
const 		path 							= require('path');
const 		bodyParser 	= require('body-parser');
const 		jwt 								= require('jsonwebtoken');
const { checkAuth } = require('./serverMiddleware');
																						require('dotenv').config();

const PORT 									= process.env.PORT || 5000;

const environment 		= process.env.NODE_ENV || 'development'
const configuration = require('../knexfile')[environment]
const db 											= require('knex')(configuration)

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));
app.use(bodyParser.json());

// app.set('secretKey', process.env.SECRET_KEY);
app.set('secretKey', 'FAKE-process.env.SECRET_KEY');



// All remaining requests return the React app, so it can handle routing.
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});




app.post('/api/v1/admin/', (req, res) => {
	const payload = req.body;

	for (let requiredParams of ['userType', "email"]) {
		if (!req.body[requiredParams]) {
			return res.status.json({ error: `Mising requried parameter "${requiredParams}"`})
		}
	}

	if (payload.email.endsWith('@controllerAdmin.com')) {
		Object.assign(payload, { admin:true })
	} else { Object.assign(payload, { admin:false }) }

	const token = jwt.sign(payload, app.get('secretKey'), {expiresIn: '7d'})
	return res.status(200).json({ token })
})

// GET ALL LOCATIONS
app.route('/api/v1/location')
.get((req, res) => {
	db('location').select()
	.then(location =>  res.status(200).json({ location }) )
	.then(info => {
		console.log('some info fer da conole: ', info)
	})
	.catch(error => console.log(`ERROR: GET /api/v1/location:`, error))
})



.post(checkAuth, (req, res) => {
	const locationType = req.body.locationType;
	const newSocialMedia 	= req.body.socialMedia;
	const newLocation 	= req.body.location;
	const statusType 		= req.body.statusType;
	const newHappyHour = req.body.happyHour;

	for (let requiredParams of ["name","latitude","longitude"]) {
		if (!newLocation[requiredParams]) {
			return res.status(422).json({
				error: `missing required parameter ${requiredParams}`
			})
		}
	}

db('location_type').insert(locationType, 'id')
.then(locTypeID => {
		Object.assign(newLocation, { location_type_id:locTypeID[0] })

		db('social_media').insert(newSocialMedia, 'id')
		.then(socialMediaID => {
			Object.assign(newLocation, { social_media_id:socialMediaID[0] })

			db('location').insert(newLocation, ['id'])
			.then(newLocID => {

				db('status_type').insert(statusType, 'id')
				.then(statusID => {
					Object.assign(newHappyHour, { status_type_id:statusID[0] }, { location_id:newLocID[0].id })

					db('happy_hour').insert(newHappyHour, ['location_id'])
					.then(locID => {

						db('location').where('id', locID[0].location_id).select()
						.then(data => res.status(200).json({ data }))
					})
					.catch(error => res.status(200).json({ error }))
				})
				.catch(error => res.status(200).json({ error }))
			})
			.catch(error => res.status(200).json({ error }))
		})
		.catch(error => res.status(500).json({ error }))
	})
	.catch(error => res.status(500).json({ error }))
})






app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});

module.exports = app;