'use strict'

const { $jsonld } = require('@metascraper/helpers')

/**
 * A set of rules we want to declare under the `metascraper-events` namespace.
 *
**/
module.exports = () => {
  const rules = {
	name: [
	  ({ htmlDom: $, url }) => $jsonld('name')($,url),     
	],
	subevent: [
	  ({ htmlDom: $, url }) => $jsonld('subEvent')($,url),
	],
  }
  return rules
}