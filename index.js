#!/usr/bin/env node

/*jslint node: true */
"use strict";

//  netmask     notation
//  255.0.0.0   /8
//  255.255.0.0   /16
//  255.255.255.0 /24

var ping = require("ping"),
  dns = require("dns"),
  network = process.argv[2]; // Example: "192.168.1.1/24"

if (!network) {
  throw new Error("Parameter #1 missing!");
}

function reverseLookup(ip, dataCallback) {
  dns.reverse(ip, function (err, domains) {
    if (err) {
      dataCallback(ip);
    } else {
      dataCallback(ip, domains[0]);
    }
  });
}
function testIp(ip, reachableCallback) {
  ping.sys.probe(ip, function (reachable) {
    if (reachable) {
      reachableCallback(ip);
    }
  });
}
function toDecInt(elem) {
  return parseInt(elem, 10);
}
function foreachIpIn(network, callback) {
  var n = network.split("/"),
    ip = n[0].split(".").map(toDecInt),
    mask = toDecInt(n[1]),
    i,
    j,
    k,
    curr;
  
  if (mask === 24) {
    for (i = 1; i <= 254; i = i + 1) {
      curr = ip;
      curr[3] = i;
      callback(curr.join("."));
    }
  } else if (mask === 16) {
    for (i = 0; i <= 255; i = i + 1) {
      for (j = 1; j <= 254; j = j + 1) {
        curr = ip;
        curr[2] = i;
        curr[3] = j;
        callback(curr.join("."));
      }
    }
  } else if (mask === 8) {
    for (i = 0; i <= 255; i = i + 1) {
      for (j = 0; j <= 255; j = j + 1) {
        for (k = 1; k <= 254; k = k + 1) {
          curr = ip;
          curr[1] = i;
          curr[2] = j;
          curr[3] = k;
          callback(curr.join("."));
        }
      }
    }
  } else {
    throw new Error("Subnet mask not supported");
  }
}
function pingAll(network) {
  foreachIpIn(network, function (ip) {
    testIp(ip, function (ip) {
      reverseLookup(ip, function (ip, domain) {
        console.log(ip + (domain ? " - " + domain : ""));
      });
    });
  });
}

pingAll(network);
