const Shopify = require("shopify-api-node");
const fetch = require("node-fetch");

exports.handler = async (event) => {
	let itemId;

	//this is used to connect to a Monday.com Webhook integration and only necessary to run on first setting up
	// https://support.monday.com/hc/en-us/articles/360003540679-Webhook-Integration-
	/*
  let body = {};
  
	if (event.body !== null && event.body !== undefined) {
		body = JSON.parse(event.body);
	}
	if (event.challenge) {
	body.challenge = event.challenge;

  let response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };
  return response;
	}
  */

	async function createShopifyCustomer(data) {
		let cleanedCustomer = Object.assign(
			{},
			...data.map((obj) => {
				let reformattedObj = {};
				if (obj.id == "email") {
					obj.value = JSON.parse(obj.value).email;
				} else if (obj.value != null) {
					obj.value = obj.value.replace(/"/g, "");
				}
				reformattedObj[obj.id] = obj.value;
				return reformattedObj;
			})
		);

		let newCustomer = {
			first_name: cleanedCustomer.first_name,
			last_name: cleanedCustomer.last_name,
			email: cleanedCustomer.email,
			phone: cleanedCustomer.item_id5,
			verified_email: false,
			addresses: [
				{
					address1: cleanedCustomer.billing_address,
					address2: cleanedCustomer.bill_addy_unit7,
					city: cleanedCustomer.bill_addy_city,
					phone: cleanedCustomer.item_id5,
					last_name: cleanedCustomer.last_name,
					first_name: cleanedCustomer.first_name,
				},
			],
			send_email_invite: true,
			tags: "wholesale",
			accepts_marketing: true,
			//Shopify will not create the customer unless the country, province, and zip are validated & correct, so since the Monday form has no validation, we pass it along in the notes
			note: `Billing Address - State: ${cleanedCustomer.bill_addy_state} Zip: ${cleanedCustomer.bill_addy_zip} Country: ${cleanedCustomer.bill_addy_country5}`,
		};

		const shopify = new Shopify({
			shopName: process.env.shopName,
			apiKey: process.env.APIKey,
			password: process.env.APIPass,
		});

		await shopify.customer
			.create(newCustomer)
			.then((customer) => console.info(customer))
			.catch((error) => console.info(error));
	}

	if (event.body !== null && event.body !== undefined) {
		let recievedData = JSON.parse(event.body).event;
		if (recievedData.value.label.text == "APPROVED") {
			itemId = recievedData.pulseId;

			//construct GraphQL query to get the entire Monday.com item data, since the webhook only sends us one column's value initially
			let query =
				"query items($id: Int) { items(ids: [$id] ) { id name column_values { id title value } } }";

			await fetch("https://api.monday.com/v2", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: process.env.MONDAY_API,
				},
				body: JSON.stringify({
					query: query,
					variables: { id: itemId },
				}),
			})
				.then((r) => r.json())
				.then((data) =>
					createShopifyCustomer(data.data.items[0].column_values)
				);
		}
	}
};

// uncomment to test locally with node
//exports.handler();
