const express = require('express');
const elasticsearch = require('elasticsearch');
const FluentClient = require('@fluent-org/logger').FluentClient;
const app = express();

const logger = new FluentClient('fluentd.test', {
  socket: {
    host: 'fluentd',
    port: 24224,
    timeout: 3000,
  }
});

const client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
  log: 'trace'
});

app.use((request, response, next) => {
  const { ip, headers: { 'user-agent': ua } } = request;
  logger.emit('follow', {ip, ua});
  next()
})

app.get('/', async function(request, response) {
  const logs = await getLogs();
  const content = logs.hits.hits.map((log) => {
    return `
      <tr>
        <td>${log._source.ip}</td>
        <td>${log._source.ua}</td>
        <td>${convertTimestamp(log._source['@timestamp'])}</td>
      </tr>
    `;
  }).join('');

  response.send(`
    <html>
      <head>
        <title>Fluentd Test</title>
      </head>
      <div>
        <table border="1">
          <tr>
            <th>ip</th>
            <th>ua</th>
            <th>timestamp</th>
          </tr>
          ${
            content
          }
        </table>
      </div>
    </html>
  `);
});

const port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Listening on " + port);
});

const getLogs = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const index = `fluentd-${year}${month}${day}`;
  return client.search({
    index,
    size: 50,
    sort: '@timestamp:desc',
  });
}

const convertTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  date.setHours(date.getHours() + 9);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}