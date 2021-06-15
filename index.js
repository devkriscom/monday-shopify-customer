const Shopify = require("shopify-api-node");
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

  async function createShopifyCustomer(data) {
    cleanedCustomer = Object.assign(
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
      phone: cleanedCustomer.phone,
      verified_email: false,
      addresses: [
        {
          address1: cleanedCustomer.billing_address,
          address2: cleanedCustomer.bill_addy_unit7,
          city: cleanedCustomer.bill_addy_city,
          province: cleanedCustomer.bill_addy_state,
          phone: cleanedCustomer.item_id5,
          zip: cleanedCustomer.bill_addy_zip,
          last_name: cleanedCustomer.last_name,
          first_name: cleanedCustomer.first_name,
          country: cleanedCustomer.bill_addy_country5,
        },
      ],
      send_email_invite: true,
      tags: "wholesale",
      accepts_marketing: true,
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

  //	if (event.event !== null && event.event !== undefined) {
  //recievedData = event.event;
  //if (recievedData.value.label.text == "APPROVED") {
  //	itemId = recievedData.pulseId;
  //hardcoding the item ID for testing
  itemId = 11111111;

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
    .then((data) => createShopifyCustomer(data.data.items[0].column_values));
  //}
  //	}

  response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };

  // log for debugging
  /*
		console.info("EVENT\n" + JSON.stringify(event, null, 2));
  console.info("EVENT\n" + event.body);
  console.info("BODY\n" + body);
  */

  return response;
};

// uncomment to test locally with node
exports.handler();
