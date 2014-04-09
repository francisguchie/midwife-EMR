/* 
 * -------------------------------------------------------------------------------
 * test.util.js
 *
 * Testing of the util.js module at the top level of the application (not the
 * utils.js in the test folder).
 * ------------------------------------------------------------------------------- 
 */

// --------------------------------------------------------
// Sanity check - only run with a test configuration.
// --------------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
  console.error('Not using the "test" environment...aborting!');
  process.exit(1);
}

var should = require('should')
  , _ = require('underscore')
  , moment = require('moment')
  , cfg = require('../config')
  , util = require('../util')
  ;


describe('Util', function(done) {
  this.timeout(5000);

  describe('getGA', function(done) {
    it('should throw exception if called with no parameters', function(done) {
      (function() {
        util.getGA();
      }).should.throw();
      done();
    });

    it('should handle calculation with edd set to today', function(done) {
      var edd = moment()
        , result
        ;
      result = util.getGA(edd);
      result.should.equal('40 0/7');
      done();
    });

    it('should handle edd in the future by 23 days', function(done) {
      var edd = moment().add('days', 23)
        , result
        ;
      result = util.getGA(edd);
      result.should.equal('36 5/7');
      done();
    });

    it('should handle edd in the future by 180 days', function(done) {
      var edd = moment().add('days', 180)
        , result
        ;
      result = util.getGA(edd);
      result.should.equal('14 2/7');
      done();
    });

    it('should handle edd in the past by 23 days', function(done) {
      var edd = moment().subtract('days', 23)
        , result
        ;
      result = util.getGA(edd);
      result.should.equal('43 2/7');
      done();
    });

    it('should handle edd in the past by 180 days', function(done) {
      var edd = moment().subtract('days', 180)
        , result
        ;
      result = util.getGA(edd);
      result.should.equal('65 5/7');
      done();
    });

    it('should handle edd & rDate parameters', function(done) {
      var edd = moment().subtract('days', 100)
        , rDate = moment(edd).subtract('days', 23)
        , result
        ;
      result = util.getGA(edd, rDate);
      result.should.equal('36 5/7');
      done();
    });

    it('should handle edd & rDate parameters with rDate greater than edd', function(done) {
      var edd = moment().subtract('days', 100)
        , rDate = edd.clone().add('days', 23)
        , result
        ;
      result = util.getGA(edd, rDate);
      result.should.equal('43 2/7');
      done();
    });

    it('should handle date objects as parameters', function(done) {
      var edd = moment().subtract('days', 100).toDate()
        , rDate = moment(edd).add('days', 23).toDate()
        , result
        ;
      result = util.getGA(edd, rDate);
      result.should.equal('43 2/7');
      done();
    });

    it('should handle strings as parameters in YYYY-MM-DD format', function(done) {
      var edd = '2013-10-01'
        , rDate = '2013-07-13'
        , result
        ;
      result = util.getGA(edd, rDate);
      result.should.equal('28 4/7');
      done();
    });

    it('should return empty string if first param is not date-like', function(done) {
      var edd = 'something else'
        , rDate = new Date()
        , result
        ;
      result = util.getGA(edd, rDate);
      result.should.have.length(0);
      result.should.equal('');
      done();
    });

    it('should return empty string if second param is not date-like', function(done) {
      var edd = '2013-10-01'
        , rDate = 'bad input'
        , result
        ;
      result = util.getGA(edd, rDate);
      result.should.have.length(0);
      result.should.equal('');
      done();
    });

  });
});



