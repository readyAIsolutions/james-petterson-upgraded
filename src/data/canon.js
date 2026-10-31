'use strict';
/** The playable library: authored cases + enhancements, in display order. */
const { enhance } = require('./enhancements');

const CANON_IDS = ['case-100', 'case-101', 'case-102', 'case-103', 'case-104', 'case-001'];

function getCanon() {
  return CANON_IDS.map((id) => {
    const { manifest } = require(`./${id}`);
    return { id, manifest: enhance(id, manifest) };
  });
}

module.exports = { CANON_IDS, getCanon };
