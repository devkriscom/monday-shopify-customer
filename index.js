//const Shopify = require("shopify-api-node");

exports.handler = async (event) => {
	let body = {};
	let response = {};
	let recievedData = {};

	//this is used to connect to a Monday.com Webhook integration and only necessary to run on first setting up
	// https://support.monday.com/hc/en-us/articles/360003540679-Webhook-Integration-
	/*
	if (event.body !== null && event.body !== undefined) {
		body = JSON.parse(event.body);
	}
	if (event.challenge) body.challenge = event.challenge;
	
	//change groupName depending on what group EW has results inside
	//todo: move Shopify request inside if statement to only run when form results are sent with appropriate data
		if (event.body !== null && event.body !== undefined) {
		body = JSON.parse(event.body);
	}
*/
	if (event.event !== null && event.event !== undefined) {
		console.info("EVENT\n" + JSON.stringify(event.event, null, 2));
		recievedData = event.event;
		if (recievedData.value.label.text == "APPROVED") {
			body.approved = "yes, it was approved";
			body.item = recievedData.pulseId;
		}
	}

	/*
	if (event?.event?.groupName == "NEW CUSTOMERS NEED SHOPIFY ACTIVATION") {
		body.event = event.event;
	}
	*/
	/*
	const shopify = new Shopify({
		shopName: process.env.shopName,
		apiKey: process.env.APIKey,
		password: process.env.APIPass,
	});
	
	let newCustomer = {
			first_name: "FakePerson",
			last_name: "Lastnameson",
			email: "yikirim888@jmpant.com",
			phone: "+15142546011",
			verified_email: false,
			addresses: [
				{
					address1: "123 Oak St",
					city: "Ottawa",
					province: "ON",
					phone: "555-1212",
					zip: "123 ABC",
					last_name: "Lastnameson",
					first_name: "FakePerson",
					country: "CA",
				},
			],
			send_email_invite: true,
	}
	*/
	/*
	await shopify.customer
		.create(newCustomer)
		.then((customer) => console.info(customer))
		.catch((error) => console.info(error));
	*/

	response = {
		statusCode: 200,
		body: JSON.stringify(body),
	};

	// log for debugging
	//console.info("EVENT\n" + JSON.stringify(event, null, 2));
	console.info("EVENT\n" + event.body);
	console.info("BODY\n" + body);

	return response;
};
