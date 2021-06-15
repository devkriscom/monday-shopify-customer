//const Shopify = require("shopify-api-node");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  let body = {};
  let response = {};
  let recievedData = {};
  let itemId;

  //this is used to connect to a Monday.com Webhook integration and only necessary to run on first setting up
  // https://support.monday.com/hc/en-us/articles/360003540679-Webhook-Integration-
  /*
	if (event.body !== null && event.body !== undefined) {
		body = JSON.parse(event.body);
	}
	if (event.challenge) body.challenge = event.challenge;
  */

  if (event.event !== null && event.event !== undefined) {
    console.info("EVENT\n" + JSON.stringify(event.event, null, 2));
    recievedData = event.event;
    if (recievedData.value.label.text == "APPROVED") {
      itemId = recievedData.pulseId;

      //construct GraphQL query to get the entire Monday.com item data, since the webhook only sends us one column's value initially
      let query =
        "query items($id: Int) { items(ids: [$id] ) { id name column_values { id title value } } }";

      fetch("https://api.monday.com/v2", {
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
        //.then(function (data) {
        //   recievedData = data;
        //});
        .then((data) => console.log("data returned:", JSON.stringify(data)));
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
  /*
  console.info("EVENT\n" + event.body);
  console.info("BODY\n" + body);
  */

  return response;
};

// uncomment to test locally with node
exports.handler();
