# monday-shopify-customer
A NodeJS app to automatically create a customer in Shopify based on a Monday.com Webhook

Deployed via AWS Lambda.

This app uses the AWS API Gateway to listen for a Monday Webhook. We then query the Monday GraphQL API to get the entire new item (customer) JSON, and send that to our store's authenticated Shopify API to automate the new customer creation process.
