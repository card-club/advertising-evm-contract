const linkAmount = args[0];
const publisherId = args[1];

if (!linkAmount) {
  throw "Link amount is required";
}

if (!publisherId) {
  throw "Publisher ID is required";
}

// Max retries HTTP requests are 4 because total HTTP requests a Chainlink Function can do is 5 https://docs.chain.link/chainlink-functions/resources/service-limits
function httpRequest(url, headers, data, retries = 4) {
  return new Promise((resolve, reject) => {
    Functions.makeHttpRequest({ url, headers, data })
      .then((response) => {
        if (response.statusText === "OK") {
          resolve(response.data);
        } else if (retries > 0) {
          console.log(`Retry attempts remaining: ${retries}`);
          setTimeout(() => {
            httpRequest(url, headers, retries - 1)
              .then(resolve)
              .catch(reject);
          }, 1000); // retry after 1 second
        } else {
          reject(new Error("Failed after 5 attempts"));
        }
      })
      .catch((error) => {
        if (retries > 0) {
          console.log(`Retry attempts remaining: ${retries}`);
          setTimeout(() => {
            httpRequest(url, headers, retries - 1)
              .then(resolve)
              .catch(reject);
          }, 1000); // retry after 1 second
        } else {
          reject(error);
        }
      });
  });
}
// TODO: Test speed SpaceAndTime query speed after inserting a lot of events
// with Kafka producer and discover where the pain points are

// TODO: SpaceAndTime url for API call
// There are three approaches, discuss during office hours
  // 1. Get the total views, minus the reserved ads and write it on chain so it can be 
  // automatically populated in spacexTime table when that feature is ready, but what to do with amount that is left?
  // 2. Do a write directly to the SpaceAndTime table that is idempotent, I can probably use the requestID for this
  // 3. Let only one node do the write to SpaceAndTime table, but this feels like a single point of failure
httpRequest("https://hackathon.spaceandtime.dev/v1/sql/dql", {
  'Authorization': `Bearer ${ secrets.accessToken }`,
    "Content-Type": "application/json"
}, {
  "resourceId": "cardclub.events", 
  "sqlText": sqlText
})
  .then((data) => {
    // TODO: SpaceAndTime query
    console.log(data);
  })
  .catch((error) => console.error(error));

// TODO: Remove hardcoded value for ad slot
return Functions.encodeUint256(173);
