'use strict'

const _ = require('lodash')
const url = require('url')
const urlConfig = require('../../helper').urlConfig
const logger = require('../../helper').logger
const validators = require('../../helper').validators

const blacklistedAttributes = [
  'class', 'id'
]

/**
 * Remove node with blacklisted source.
 * @param {Object} node DOM node
 * @return {Object} DOM node
 */
const filterBlacklistedSites = function (node) {
  if (!node) {
    return null
  }
  const src = node.getAttribute('src') ||
    node.getAttribute('href')
  if (src && validators.isBlacklisted(src)) {
    logger.debug('Removing blacklisted source: %s', src)
    node.parentNode.removeChild(node)
    // Break the chain.
    return null
  } else {
    // Continue filter chain
    return node
  }
}

/**
 * Remove blacklisted attributes.
 * @param {Object} node DOM node
 * @return {Object} DOM node
 */
const filterAttributes = function (node) {
  if (!node) {
    return null
  }
  blacklistedAttributes.forEach(function (attr) {
    if (node.hasAttribute(attr)) {
      // logger.debug('Removing blacklisted attribute: %s', attr);
      node.removeAttribute(attr)
    }
  })
  return node
}

/**
 * Filter images src.
 * - Remove 1px images.
 * - Fix relative URL into absolute.
 * @param {Object} document DOM
 */
const filterImages = function (document, options) {
  const images = document.getElementsByTagName('img')
  for (let img of images) {
    // Remove 1px images
    if (img.hasAttribute('height') || img.hasAttribute('width')) {
      const height = img.getAttribute('height')
      const width = img.getAttribute('width')
      if (height === '1' && width === '1') {
        logger.debug('Removeing 1px image: %s', img.getAttribute('src'))
        img.parentNode.removeChild(img)
        return
      }
    }

    // Remove v1 attribute
    if (img.hasAttribute('app-src')) {
      img.setAttribute('src', img.getAttribute('app-src'))
      img.removeAttribute('app-src')
    }
    // Remove data attribute
    if (img.hasAttribute('data-src')) {
      img.setAttribute('src', img.getAttribute('data-src'))
      img.removeAttribute('data-src')
    }

    const src = img.getAttribute('src')
    if (src) {
      if (src.startsWith(urlConfig.baseUrl)) {
        // Remove src pointing to the current server
        img.removeAttribute('src')
      } else if (!/^data:/i.test(src)) {
        // Create absolute URL if possible
        if (options && options.baseUrl && !/^https?:\/\//i.test(src)) {
          img.setAttribute('src', url.resolve(options.baseUrl, src))
        }
      }
    }
  }
}

/**
 * Filter links href.
 * - Add target _blank.
 * @param {Object} document DOM
 */
const filterLinks = function (document /*, options*/) {
  const links = document.getElementsByTagName('a')
  for (let link of links) {
    if (link.hasAttribute('href')) {
      link.setAttribute('target', '_blank')
    }
  }
}

/**
 * HTML cleaner.
 * @module cleaner
 */
module.exports = {
  /**
   * HTML cleanup chain.
   * @param {Object} document DOM
   * @param {Object} options options
   * @return {String} cleaned HTML
   */
  cleanup: function (document, options) {
    // Filter all nodes...
    const nodes = document.getElementsByTagName('*')
    for (let node of nodes) {
      var filterChain = _.flow(
        filterBlacklistedSites,
        filterAttributes
      )
      filterChain(node)
    }

    // Filter images...
    filterImages(document, options)
    // Filter links...
    filterLinks(document, options)
    // Return document.
    return document
  }
}
