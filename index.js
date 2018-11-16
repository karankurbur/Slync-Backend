const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
app.use(bodyParser.json());

var transactions = [];
var transactionGraph = new Graph();

function validateAddress(address, res) {
  if (address.substring(0, 2) != '0x') {
    res.send(false);
  }
}

app.post('/sendTransaction', (req, res) => {
  validateAddress(req.body.sender);
  validateAddress(req.body.receiver);
  addToTransactions(req.body.sender, req.body.receiver, req.body.amount, req.body.hash);
  res.send(true);
})


app.get('/getTransactionsFrom', (req, res) => {
  var fromAddress = req.query.from;
  validateAddress(fromAddress);

  var output = [];
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].sender == fillAddress(fromAddress, 42)) {
      output.push(transactions[i]);
    }
  }
  res.send(output);
}
)

app.get('/getTransactionsTo', (req, res) => {
  var toAddress = req.query.to;
  validateAddress(toAddress);
  var output = [];
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].receiver == fillAddress(toAddress, 42)) {
      output.push(transactions[i]);
    }
  }
  res.send(output);
}
)

app.get('/getTransactionsBetweenTwoAddresses', (req, res) => {
  var fromAddress = req.query.from;
  var toAddress = req.query.to;
  validateAddress(fromAddress);
  validateAddress(toAddress);
  var output = [];
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].receiver == fillAddress(toAddress, 42) && transactions[i].sender == fillAddress(fromAddress, 42)) {
      output.push(transactions[i]);
    }
  }
  res.send(output);
}
)

app.get('/getShortestPath', (req, res) => {
  var fromAddress = fillAddress(req.query.from);
  var toAddress = fillAddress(req.query.to);
  validateAddress(fromAddress);
  validateAddress(toAddress);
  var output = shortestPath(transactionGraph, fillAddress(fromAddress, 42), fillAddress(toAddress, 42));
  if (output == null) {
    res.send("No path");
  }
  res.send(output);
}
)

//https://stackoverflow.com/questions/32527026/shortest-path-in-javascript

function Graph() {
  var neighbors = this.neighbors = {}; // Key = vertex, value = array of neighbors.

  this.addEdge = function (u, v) {
    if (neighbors[u] === undefined) {  // Add the edge u -> v.
      neighbors[u] = [];
    }
    neighbors[u].push(v);
    if (neighbors[v] === undefined) {  // Also add the edge v -> u in order
      neighbors[v] = [];               // to implement an undirected graph.
    }                                  // For a directed graph, delete
    neighbors[v].push(u);              // these four lines.
  };

  return this;
}

function shortestPath(graph, source, target) {
  if (source == target) {   // Delete these four lines if
    print(source);          // you want to look for a cycle
    return;                 // when the source is equal to
  }                         // the target.
  var queue = [source],
    visited = { source: true },
    predecessor = {},
    tail = 0;
  while (tail < queue.length) {
    var u = queue[tail++],  // Pop a vertex off the queue.
      neighbors = graph.neighbors[u];
    for (var i = 0; i < neighbors.length; ++i) {
      var v = neighbors[i];
      if (visited[v]) {
        continue;
      }
      visited[v] = true;
      if (v === target) {   // Check if the path is complete.
        var path = [v];   // If so, backtrack through the path.
        while (u !== source) {
          path.push(u);
          u = predecessor[u];
        }
        path.push(u);
        path.reverse();
        //print(path.join(' &rarr; '));
        //print(path.join(' '));
        //return path.join();
        return path;
      }
      predecessor[v] = u;
      queue.push(v);
    }
  }
  return null;
  //print('there is no path from ' + source + ' to ' + target);
}

function print(s) {  // A quick and dirty way to display output.
  s = s || '';
  console.log(s);
}

function addToTransactions(send, rec, amt, hashValue) {
  var send1 = fillAddress(send, 42);
  var rec1 = fillAddress(rec, 42)
  var sample = {
    sender: send1,
    receiver: rec1,
    amount: 1000,
    hash: fillAddress(hashValue, 66)
  }
  transactions.push(sample);
  transactionGraph.addEdge(send1, rec1);
}

function fillAddress(address, length) {
  var zeros = length - address.length;
  var out = '0x';

  for (var i = 0; i < zeros; i++) {
    out += '0';
  }
  return out += address.substring(2, address.length);
}

app.listen(port, () => {

  //sample data
  var senders = ["0xa", "0xb", "0xb", "0xc", "0xc", "0xc", "0xd", "0xd"];
  var receivers = ["0xb", "0xc", "0xe", "0xd", "0xe", "0xg", "0xe", "0xf"];

  for (var i = 0; i < senders.length; i++) {
    var amount = Math.floor(Math.random() * 10000);
    var hash = "0x" + i;
    addToTransactions(senders[i], receivers[i], amount, hash);
  }
  console.log(`Example app listening on port ${port}!`)
})