let GSAProxy = require('./gsaproxy');

module.exports = function(api) {
  // Serve requests to /api/results
  api.route('/api/results')
    .get((req, res) => {
      // If we're doing a secure search
      if(req.query.access === 'a') {
        // Setup our proxy to use the cookie
        let gsaProxy = new GSAProxy('http://path-to-gsa.com/', req.query, req.get("Cookie"));
      } else {
        // Setup our proxy without the use of the cookie
        let gsaProxy = new GSAProxy('http://path-to-gsa.com/', req.query, null);
      }

      // Execute a GSA search and give us back JSON
      gsaProxy.executeJson(handleData);

      // Function to handle our GSA response data
      function handleData(err, data, setCookieHeader) {
        if (err)
          // Log any errors
          console.log(err);
        // If there is a set-cookie header, send it to the client
        if(setCookieHeader) {
          res.append('Set-Cookie', setCookieHeader + "; Path=/");
        }
        // Send the user the data!
        res.send(data);
      }
    });
};
