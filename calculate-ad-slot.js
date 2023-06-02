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
    // Timeout 3000ms is because of the chainlink service limits
    Functions.makeHttpRequest({ url, headers, data, method: "POST" })
      .then((response) => {
        if (response.statusText === "OK") {
          resolve(response.data);
        } else if (retries > 0) {
          console.log(`Retry attempts remaining: ${retries}`);
          setTimeout(() => {
            httpRequest(url, headers, data, retries - 1)
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
            httpRequest(url, headers, data, retries - 1)
              .then(resolve)
              .catch(reject);
          }, 1000); // retry after 1 second
        } else {
          reject(error);
        }
      });
  });
}

const boughtAdViews = httpRequest(
  "https://card.club/api/ads",
  {
    "Authorization": `Bearer ${secrets.BEARER_TOKEN}`,
    "Content-Type": "application/json",
  },
  { publisherId: publisherId, linkAmount: linkAmount }
)
  .then((data) => {
    return Functions.encodeUint256(data.adViews);
  })
  .catch((error) => console.error(error));

return boughtAdViews;
