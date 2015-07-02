/* 
 * -------------------------------------------------------------------------------
 * util.js
 *
 * Utility functions.
 * ------------------------------------------------------------------------------- 
 */

var moment = require('moment')
  , _ = require('underscore')
  , INFO = 1
  , WARN = 2
  , ERROR = 3
  , ABBR = [
      {key: 'Sunday', val: 'Sun'}
      , {key: 'Monday', val: 'Mon'}
      , {key: 'Tuesday', val: 'Tue'}
      , {key: 'Wednesday', val: 'Wed'}
      , {key: 'Thursday', val: 'Thu'}
      , {key: 'Friday', val: 'Fri'}
      , {key: 'Saturday', val: 'Sat'}
    ]
  ;

/* --------------------------------------------------------
 * formatDohID()
 *
 * Return the specified dohID formatted per the usual spec,
 * which is xx-xx-xx.
 *
 * If useAltFormat is true, the alternate format for Phil
 * Health is used which is xx-xxxx.
 *
 * param      dohID
 * param      useAltFormat  - boolean
 * return     formatted string
 * -------------------------------------------------------- */
var formatDohID = function(dohID, useAltFormat) {
  if (! useAltFormat) {
    return dohID? dohID.slice(0,2) + '-' + dohID.slice(2,4) + '-' + dohID.slice(4): '';
  } else {
    return dohID? dohID.slice(0,2) + '-' + dohID.slice(2): '';
  }
};

/* --------------------------------------------------------
 * writeLog()
 *
 * Writes a log message to the console.
 *
 * param      msg
 * param      logType
 * return     undefined
 * -------------------------------------------------------- */
var writeLog = function(msg, logType) {
  var fn = 'info'
    , id = process.env.WORKER_ID? process.env.WORKER_ID: 0
    ;
  if (logType === WARN || logType === ERROR) fn = 'error';
  console[fn]('%d|%s: %s', id, moment().format('YYYY-MM-DD HH:mm:ss.SSS'), msg);
};

/* --------------------------------------------------------
 * logInfo()
 *
 * Writes an informative message to the console.
 *
 * param      msg
 * return     undefined
 * -------------------------------------------------------- */
var logInfo = function(msg) {
  writeLog(msg, INFO);
};

/* --------------------------------------------------------
 * logWarn()
 *
 * Writes a warning message to the console.
 *
 * param      msg
 * return     undefined
 * -------------------------------------------------------- */
var logWarn = function(msg) {
  writeLog(msg, WARN);
};

/* --------------------------------------------------------
 * logError()
 *
 * Writes an error message to the console.
 *
 * param      msg
 * return     undefined
 * -------------------------------------------------------- */
var logError = function(msg) {
  writeLog(msg, ERROR);
};

/* --------------------------------------------------------
 * getGA()
 *
 * Returns the gestational age as a string in the format
 * 'ww d/7' where ww is the week and d is the day of the
 * current week, e.g. 38 2/7 or 32 5/7.
 *
 * Uses a reference date, which is either passed or if
 * not passed it is assumed to be today. The reference
 * date is the date that the gestational age should be
 * computed for. In other words, given the estimated
 * due date and the reference date, what is the
 * gestational age from the perspective of the reference
 * date.
 *
 * Calculation assumes a 40 week pregnancy and subtracts
 * the refDate from the estimated due date, which is
 * also passed as a parameter. Params edd and rDate can be
 * Moment objects, JS Date objects, or strings in YYYY-MM-DD
 * format.
 *
 * Note: if parameters are not 'date-like' per above specifications,
 * will return an empty string.
 *
 * param      edd - estimated due date as JS Date or Moment obj
 * param      rDate - the reference date use for the calculation
 * return     GA - as a string in ww d/7 format
 * -------------------------------------------------------- */
var getGA = function(edd, rDate) {
  if (! edd) throw new Error('getGA() must be called with an estimated due date.');
  var estDue
    , refDate
    , tmpDate
    ;
  // Sanity check for edd.
  if (typeof edd === 'string' && /....-..-../.test(edd)) {
    estDue = moment(edd, 'YYYY-MM-DD');
  }
  if (moment.isMoment(edd)) estDue = edd.clone();
  if (_.isDate(edd)) estDue = moment(edd);
  if (! estDue) return '';

  // Sanity check for rDate.
  if (rDate) {
    if (typeof rDate === 'string' && /....-..-../.test(rDate)) {
      refDate = moment(rDate, 'YYYY-MM-DD');
    }
    if (moment.isMoment(rDate)) refDate = rDate.clone();
    if (_.isDate(rDate)) refDate = moment(rDate);
    if (! refDate) return '';
  } else {
    refDate = moment();
  }

  // --------------------------------------------------------
  // Sanity check for reference date before pregnancy started.
  // --------------------------------------------------------
  tmpDate = estDue.clone();
  if (refDate.isBefore(tmpDate.subtract(280, 'days'))) {
    return '0 0/7';
  }

  var weeks = Math.abs(40 - estDue.diff(refDate, 'weeks') - 1)
    , days = Math.abs(estDue.diff(refDate.add(40 - weeks, 'weeks'), 'days'))
    ;
  if (_.isNaN(weeks) || ! _.isNumber(weeks)) return '';
  if (_.isNaN(days) || ! _.isNumber(days)) return '';
  if (days >= 7) {
    weeks++;
    days = days - 7;
  }
  return weeks + ' ' + days + '/7';
};

/* --------------------------------------------------------
 * calcEdd()
 *
 * Calculate the estimated due date based upon the date of
 * the last mentral period passed. The returned date is a
 * String in YYYY-MM-DD format unless an alternative date
 * format is passed using Moment formatting rules.
 *
 * NOTE: this function is also included in mercy.js on the
 * client side. Changes made here should also be made there.
 *
 * param       lmp - date of the last mentral period
 * param       format - the alternative format string to use
 * return      edd - due date as a String
 * -------------------------------------------------------- */
var calcEdd = function(lmp, format) {
  if (! lmp) throw new Error('calcEdd() must be called with the lmp date.');
  var edd
    ;

  // --------------------------------------------------------
  // Sanity check that we are passed a Date or Moment.
  // --------------------------------------------------------
  if (! _.isDate(lmp) && ! moment.isMoment(lmp)) {
    throw new Error('calcEdd() must be called with a valid date.');
  }
  edd = moment(lmp).add(280, 'days');
  if (format) return edd.format(format);
  return edd.format('YYYY-MM-DD');
};

/* --------------------------------------------------------
 * adjustSelectData()
 *
 * "Adjusts" the selectData list for the passed selectData
 * list to have a selected element that matches key, if key
 * is passed.
 *
 * param       list - the selectData list
 * param       key - the key that matches selectKey
 * return      the new list
 * -------------------------------------------------------- */
var adjustSelectData = function(list, key) {
    var newList = []
      ;
    _.each(list, function(obj) {
      var newObj = {}
        ;
      newObj.selectKey = obj.selectKey;
      newObj.label = obj.label;
      if (key) {
        if (obj.selectKey === key) {
          newObj.selected = true;
        } else {
          newObj.selected = false;
        }
      } else {
        newObj.selected = obj.selected;
      }
      newList.push(newObj);
    });
  return newList;
};

/* --------------------------------------------------------
 * addBlankSelectData()
 *
 * Adds a blank select data record to the beginning of the
 * select data list passed. This allows a select in a form
 * to be unselected until the user decides to select something.
 *
 * Note that this deselects all other records and causes the
 * new blank record to be the only one that is selected.
 *
 * Note also that this does nothing if there already is a
 * record with a selectKey equal to ''.
 *
 * The list is passed by reference and therefore the original
 * list is modified.
 *
 * param      list - an array of select data objects
 * return     undefined
 * -------------------------------------------------------- */
var addBlankSelectData = function(list) {
  if (_.find(list, function(e) {return e.selectKey === '';})) return list;
  _.each(list, function(obj) {obj.selected = false;});
  list.unshift({selectKey: '', label: '', selected: true});
};

/* --------------------------------------------------------
 * getAbbr()
 *
 * Returns an abbreviation for the string passed if known,
 * otherwise returns the string itself.
 *
 * TODO: store the abbreviations in the database as opposed
 * to being hard-coded in this module.
 *
 * param      key
 * return     abbreviation
 * -------------------------------------------------------- */
var getAbbr = function(key) {
  var abbr = _.find(ABBR, function(obj) {return obj.key === key;})
    ;
  if (abbr) return abbr.val;
  return key;
};


/* --------------------------------------------------------
 * isValidDate()
 *
 * Returns true if the "date" passed is valid, otherwise
 * false. The "date" field can be a JS Date object, a
 * Moment instance, or a String. If it is a string, a second
 * parameter is required that specifies the format of the
 * string. Formats accepted are the same as the Moment library.
 *
 * param      dte
 * param      format
 * return     boolean 
 * -------------------------------------------------------- */
var isValidDate = function(dte, format) {
  var m;
  if (dte && _.isDate(dte)) return true;
  if (dte && moment.isMoment(dte) && dte.isValid()) return true;
  if (dte && _.isString(dte) && format && _.isString(format)) {
    m = moment(dte, format, true);    // strict parsing mode is true
    return m.isValid();
  }

  return false;
};

/* --------------------------------------------------------
 * collateRecs()
 *
 * Build an array of objects within objects aligned by the
 * passed sortFld.
 *
 * Expected input is an object with elements that are arrays.
 * Each of the arrays contain homogeneous objects, each of
 * which contain the sortFld element, the name of which is the
 * second parameter passed. The sortFld can be a number or Date.
 * Each of the arrays are expected to already by sorted by
 * the sortFld in ascending order.
 *
 *   input = {
 *    a: [{..., sortFld: 11}, {..., sortFld: 12}],
 *    b: [{..., sortFld: 9}, {..., sortFld: 10}],
 *    c: [{..., sortFld: 17}, {..., sortFld: 18}],
 *    ...
 *   }
 *
 * The output will consist of an array of records (objects),
 * each of which contains the combined state of all of the
 * input elements (arrays) based upon the sortFld match.
 *
 *   output = [
 *    {sortFld: 1, a: {...}, b: {...}, c: {...}},
 *    {sortFld: 2, a: {...}, b: {...}, c: {...}},
 *    {sortFld: 3, a: {...}, b: {...}, c: {...}},
 *    ...
 *    {sortFld: 18, a: {...}, b: {...}, c: {...}},
 *   ]
 *
 * Some input arrays may not have representations at certain
 * values of the sortFld. In that case, the object used for the
 * missing value will be an empty object.
 *
 * param      data    - input object
 * param      sortFld - name of the sort field
 * return     data    - output object
 * -------------------------------------------------------- */
var collateRecs = function(data, sortFld) {
  var output = []
    , flds = _.keys(data)
    , makeRec = function(fields, vals, sFldVal) {
        var obj = {};
        obj[sortFld] = sFldVal;
        _.each(fields, function(f, idx) {
          obj[f] = vals[idx];
        });
        return obj;
      }
    , inProcess = true
    , sortVal
    , recIdx = {}
    , tmpRecs = []
    , moreRecs = true
    , isSortFldDate
    ;

  // --------------------------------------------------------
  // Set up the recIdx object to hold how far we have progressed
  // through each array.
  // --------------------------------------------------------
  _.each(flds, function(f) {
    recIdx[f] = 0;
  });

  while (inProcess) {
    // --------------------------------------------------------
    // Get the initial minimum sort field value for this round.
    // --------------------------------------------------------
    moreRecs = false;
    _.each(flds, function(f) {
      if (data[f][recIdx[f]]) {
        tmpRecs.push(data[f][recIdx[f]][sortFld]);
        moreRecs = true;
      }
    });
    if (! moreRecs) {
      inProcess = false;
    } else {
      sortVal = _.min(tmpRecs);
      isSortFldDate = _.isDate(sortVal);

      tmpRecs = [];
      _.each(flds, function(f) {
        var rec = _.find(data[f], function(o) {
          if (isSortFldDate) {
            return o[sortFld].getTime() === sortVal.getTime();
          } else {
            return o[sortFld] === sortVal;
          }
        });
        if (rec) {
          tmpRecs.push(rec);
          recIdx[f]++;  // We have used a record, so move on.
        } else {
          tmpRecs.push({});
        }
      });
      output.push(makeRec(flds, tmpRecs, sortVal));
    }
  }   // end while(inProcess)

  return output;
};


/* --------------------------------------------------------
 * mergeRecs()
 *
 * Take the output of collateRecs and merge populated records
 * "up" the data structure filling in elements with empty
 * objects along the way.
 *
 *   input = [
 *    {sortFld: 1, a: {...}, b: {}, c: {...}},
 *    {sortFld: 2, a: {}, b: {...}, c: {}},
 *    {sortFld: 3, a: {}, b: {...}, c: {...}},
 *    {sortFld: 4, a: {...}, b: {...}, c: {...}},
 *   ]
 *
 * In the above example, empty objects would be "filled" with
 * the prior objects of that record type, but only if they
 * existed prior. sortFld 2 record "a" is an empty object but
 * the prior record in sortFld 1 record "a" was not empty.
 * Therefore populate sortFld 2 record "a" with the contents
 * of sortFld 1 record "a". The same holds true for sortFld 2
 * record "c" and sortFld 3 record "a".
 *
 * But sortFld 1 record "b" is not changed because there is no
 * prior record to model after.
 *
 * Note: the input data structure is modified by this function.
 *
 * param       data - output from collateRecs is expected
 * return      undefined
 * -------------------------------------------------------- */
var mergeRecs = function(data, sortFld) {
  var sources = _.difference(_.keys(data[0]), [sortFld])
    , lastRecs = {}
    , output = []
    ;

  // --------------------------------------------------------
  // Populate lastRecs with the initial elements we are tracking.
  // --------------------------------------------------------
  _.each(sources, function(s) {lastRecs[s] = {};});

  // --------------------------------------------------------
  // Merge "up" the records filling in empty objects with prior
  // non-empty objects for corresponding elements.
  // --------------------------------------------------------
  // Each collection of sources at a particular timestamp.
  _.each(data, function(row) {
    // Each source at that timestamp.
    _.each(lastRecs, function(val, src) {
      // This particular source has nothing at this timestamp, so
      // populate it from the last prior record if available.
      if (_.isEmpty(row[src])) {
        if (! _.isEmpty(lastRecs[src])) {
          row[src] = lastRecs[src];
        }
      } else {
        // This particular source does have an entry at this timestamp
        // so update lastRecs accordingly for future timestamps.
        lastRecs[src] = row[src];

        // --------------------------------------------------------
        // Record which data sources changed in the "whatChanged"
        // field in the record. These "changes" represent table
        // level changes in the database, i.e. a save but not
        // necessarily a change from the previous record because
        // the same data could have been saved again.
        // --------------------------------------------------------
        if (! _.has(row, 'whatChanged')) {
          row.whatChanged = [];
        }
        row.whatChanged.push(src);
      }
    });
  });
};


module.exports = {
  logInfo: logInfo
  , logWarn: logWarn
  , logError: logError
  , getGA: getGA
  , calcEdd: calcEdd
  , adjustSelectData: adjustSelectData
  , addBlankSelectData: addBlankSelectData
  , getAbbr: getAbbr
  , formatDohID: formatDohID
  , isValidDate: isValidDate
  , collateRecs: collateRecs
  , mergeRecs: mergeRecs
};


