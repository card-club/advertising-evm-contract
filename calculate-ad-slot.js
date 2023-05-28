const linkAmount = args[0];
const publisherId = args[1];

if (!linkAmount) {
  throw "Link amount is required";
}

if (!publisherId) {
  throw "Publisher ID is required";
}

// Max retries HTTP requests are 4 because total HTTP requests a Chainlink Function can do is 5 https://docs.chain.link/chainlink-functions/resources/service-limits
function httpRequest(url, headers, retries = 4) {
  return new Promise((resolve, reject) => {
    Functions.makeHttpRequest({ url, headers })
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
          reject(new Error("Failed after multiple attempts"));
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

// TODO: SpaceAndTime url for API call
httpRequest("https://jsonplaceholder.typicode.com/todos/1", {})
  .then((data) => {
    // TODO: SpaceAndTime query
    console.log(data);
  })
  .catch((error) => console.error(error));

return Functions.encodeUint256(173);
