const Shopify = require("shopify-api-node");
const fetch = require("node-fetch");

exports.handler = async(event) => {
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

    //console.info("DATA PASSED TO CREATE SHOPIFY CUSTOMER\n" + JSON.stringify(data, null, 2));

    let cleanedCustomer = Object.assign({},
      ...data.map((obj) => {
        let reformattedObj = {};
        if (obj.id == "email") {
          obj.value = JSON.parse(obj.value).email;
        }
        else if (obj.value != null) {
          obj.value = obj.value.replace(/"/g, "");
        }
        reformattedObj[obj.id] = obj.value;
        return reformattedObj;
      })
    );

    //console.info("CLEANED_CUSTOMER\n" + JSON.stringify(cleanedCustomer, null, 2));


    let newCustomer = {
      first_name: cleanedCustomer.first_name,
      last_name: cleanedCustomer.last_name,
      email: cleanedCustomer.email,
      phone: cleanedCustomer.item_id5,
      verified_email: false,
      addresses: [{
        address1: cleanedCustomer.billing_address,
        address2: cleanedCustomer.bill_addy_unit7,
        city: cleanedCustomer.bill_addy_city,
        phone: cleanedCustomer.item_id5,
        last_name: cleanedCustomer.last_name,
        first_name: cleanedCustomer.first_name,
      }, ],
      send_email_invite: true,
      tags: "wholesale",
      accepts_marketing: true,
      //Shopify will not create the customer unless the country, province, and zip are validated & correct, so since the Monday form has no validation, we pass it along in the notes
      note: `Billing Address - State: ${cleanedCustomer.bill_addy_state} Zip: ${cleanedCustomer.bill_addy_zip} Country: ${cleanedCustomer.bill_addy_country5}`,
    };
    //console.info("NEW_CUSTOMER\n" + JSON.stringify(newCustomer, null, 2));

    const shopify = new Shopify({
      shopName: process.env.shopName,
      apiKey: process.env.APIKey,
      password: process.env.APIPass,
    });

    function customerExists(returnedEmail) {
      return shopify.customer
        .search({ email: returnedEmail });
    }

    async function createCustomer(newCustomer) {

      const returnCustomerObj = await customerExists(newCustomer.email);

      if (returnCustomerObj[0]?.email) {
        console.info('Customer already exists in Shopify database\n' + JSON.stringify(returnCustomerObj));

        let customerId = returnCustomerObj[0].id;

        //add function to tag existing customer
        await shopify.customer.update(customerId, { tags: `wholesale, ${returnCustomerObj[0].tags}` })
          .then((customer) => console.info(customer))
          .catch((error) => console.info(error));

        await shopify.customer.sendInvite(customerId, { to: returnCustomerObj.email })
          .then((customer) => console.info(customer))
          .catch((error) => console.info(error));

      }
      else {
        await shopify.customer
          .create(newCustomer)
          .then((customer) => console.info(customer))
          .catch((error) => console.info(error));
      }
    }

    await createCustomer(newCustomer);

  }

  //console.info("EVENT\n" + JSON.stringify(event, null, 2));

  if (event.body !== null && event.body !== undefined) {
    //if (event !== null && event !== undefined) {
    let recievedData = JSON.parse(event.body).event;
    //let recievedData = event;
    //console.info("RECIEVED_DATA\n" + JSON.stringify(recievedData, null, 2));

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
