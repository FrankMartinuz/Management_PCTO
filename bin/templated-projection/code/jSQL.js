/*!
 * jSQL v1.0.4
 * https://jsql.codeplex.com/
 * Copyright 2015 Julian T Hill.
 * Licensed under MIT https://jsql.codeplex.com/license
 */

/*jshint -W089 */ /* Ignore jshint: 'The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.' */
var jSQL = (function (undefined) {
    "use strict";

    var utils = (function () {

        var typeshash = {};
        var toString = Object.prototype.toString;

        var _each = function (items, callback) {
            for (var i = 0; i < items.length; i++) {
                if (false === callback(items[i], i)) {
                    break;
                }
            }
        };

        _each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (name) {
            typeshash["[object " + name + "]"] = name.toLowerCase();
        });

        return {
            each: function (items, callback) {
                _each(items, callback);
            },
            // http://jquery.com/
            typeOf: function (obj) {
                if (obj === null) {
                    return obj + "";
                }
                // Support: Android < 4.0, iOS < 6 (functionish RegExp)
                return typeof obj === "object" || typeof obj === "function" ?
                    typeshash[toString.call(obj)] || "object" :
                    typeof obj;
            },
            parseInteger: function (n, min) {
                var n2 = parseInt(n, 10);
                if ((n2 !== n) || ((min !== undefined) && (n2 < min))) {
                    throw new Error();
                }
                return n2;
            },
            isArray: function (obj) {
                return utils.typeOf(obj) === "array";
            },
            isObject: function (obj) {
                return utils.typeOf(obj) === "object";
            },
            isFunction: function (obj) {
                return utils.typeOf(obj) === "function";
            },
            isString: function (obj) {
                return utils.typeOf(obj) === "string";
            },
            isBool: function (obj) {
                return utils.typeOf(obj) === "boolean";
            },
            isNullOrUndefined: function (obj) {
                return obj === undefined || obj === null;
            },
            isNaN: function (obj) {
                return obj !== obj;
            },
            isInfinity: function (obj) {
                return ((obj === Infinity) || (obj === -Infinity));
            },
            copyObject: function (obj) {
                var copy = {};
                for (var p in obj) {
                    copy[p] = obj[p];
                }
                return copy;
            },
            getPropertyCount: function (obj) {
                var count = 0;
                for (var p in obj) {
                    count++;
                }
                return count;
            },
            extractProperty: function (obj, propertyKey) {
                var obj2 = {};
                obj2[propertyKey] = obj[propertyKey];
                return obj2;
            },
            // Modify JSON.stringify to serialize functions; used for serializing error messages.
            serialize: function (obj) {
                if (this.isFunction(obj)) {
                    return obj.toString();
                }
                var res = JSON.stringify(obj, function (key, value) {
                    if (value === undefined) {
                        return '__UNDEFINED';
                    }
                    if (utils.isFunction(value)) {
                        return '__FUNC' + value.toString() + 'FUNC__';
                    }
                    if (value instanceof RegExp) {
                        return value.toString();
                    }
                    if (utils.isNaN(value)) {
                        return '__NAN';
                    }
                    if (utils.isInfinity(value)) {
                        return '__INFINITY';
                    }
                    return value;
                });
                return res.replace(/\"__NAN\"/g, NaN).replace(/\"__INFINITY\"/g, Infinity).replace(/\"__UNDEFINED\"/g, undefined)
                          .replace(/\"__FUNC/g, "").replace(/\FUNC__\"/g, "");
            }
        };
    })();

    function JSQLError(message, infoStack, rowData) {
        this.name = "jSQLError";
        this.message = message ? message : "";

        if (infoStack) {
            var i = 0;

            // The first entry on the stack may be the complete selector or filter expression, so check.
            if (infoStack[0].method) {
                i = 1;
                this.message += " \n==> " + (function (method, args) {
                    var res = method + "(";
                    utils.each(args, function (a, idx) {
                        if (idx > 0) {
                            res += ", ";
                        }
                        res += utils.serialize(a);
                    });
                    return res + ")";
                })(infoStack[0].method, infoStack[0].args);
            }

            for (; i < infoStack.length; i++) {
                if (utils.isObject(infoStack[i]) && infoStack[i].key) {
                    this.message += " \n==> " + infoStack[i].key + ": " + utils.serialize(infoStack[i].value);
                }
                else {
                    this.message += " \n==> " + utils.serialize(infoStack[i]);
                }
            }
        }


        if (rowData) {
            this.message += " \nRow data: " + JSON.stringify(rowData);
        }
    }
    JSQLError.prototype = new Error();
    JSQLError.prototype.constructor = JSQLError;

    var formulas = (function () {
        return {
            variance: function (a, p) {
                if ((a.total === null) || (!p && a.count === 1)) {
                    return null;
                }
                if (a.count === 0) {
                    return 0;
                }
                var avg = a.total / a.count;
                var variance = 0;
                utils.each(a.values, function (val) {
                    variance += Math.pow(val - avg, 2);
                });
                return p ? variance / a.count : variance / (a.count - 1);
            },
            stdev: function (a, p) {
                var v = this.variance(a, p);
                return v === null ? null : Math.sqrt(v);
            }
        };
    })();

    return {
        /// <field>Gets or sets global jSQL options.</field>
        options: {
            /// <field type='Boolean'>When true, following execution-time validation is performed:
            /// <para>&#160;</para>
            /// <para>(1) Ensure that a 'where', 'having' and join 'on' filter expression returns a Boolean value.</para>
            /// <para>(2) Ensure that a selector expression ('select', 'selectDistinct', 'groupBy' and aggregates), an 'update' 
            /// function and a user defined aggregate function returns a non-undefined value. Additionally a check may be made for 
            /// NaN and Infinity depending on the setting of options.allowNaN and options.allowInfinity.</para>
            /// <para>(3) Ensure that an 'update' function, an 'orderBy' expression and a user defined aggregate function doesn't
            /// return an Object.</para>
            /// <para>(4) Ensure that a selector expression doesn't result in a duplicate property name. Note that if the expression 
            /// contains an Object with a duplicate property name then this error will be missed since JavaScript will override the 
            /// previous property.</para>
            /// <para>(5) Ensure that a Function type selector doesn't contain a sub-function.</para>
            /// <para>&#160;</para>
            /// <para>If set to false, some of the above validation will still be performed, where possible, at pre-execution time.</para>
            /// <para>&#160;</para>
            /// <para>The default value is false.</para></field>
            validate: false,
            /// <field type='Boolean'>If true, a check is made to ensure that all table items are objects and that they all have 
            /// the same property names; if false, a check is still made on the first item to ensure it is an object. 
            /// <para>The default values is false.</para></field>
            validateTableItems: false,
            /// <field type='String'>Specifies the argument to use when full lambda syntax is not employed.
            /// <para>The default value is 'x'.</para></field>
            lambdaArg: 'x',
            /// <field type='Boolean | String'><para>Specifies how to generate the name for an aggregate column if a name is 
            /// not specified either through an Object property name or square brackets in a String expression.</para>
            /// <para>&#160;</para>
            /// <para>(1) If false, the next available automatic name, such as 'Column 1', 'Column 2' etc. is used.</para>
            /// <para>(2) If true, and the name can be determined from a simple String expression, that name is used; otherwise the 
            /// column name is auto generated (see above).</para>
            /// <para>e.g. For sum("x.t1.price"), the name will be 'price'. For sum("x.t1.price * x.t1.qty"), the name will be 
            /// 'Column (n)'.</para>
            /// <para>(3) If 'agg_name', and the name can be determined from a simple String expression, the aggregate method name + 
            /// an underscore + the property name is used; otherwise the column name is auto generated (see above).</para>
            /// <para>e.g. For sum("x.t1.price"), the name will be 'sum_price'. For sum("x.t1.price * x.t1.qty"), the name will be 
            /// 'Column (n)'.</para>
            /// <para>&#160;</para>
            /// <para>The default value is 'agg_name'.</para></field>
            aggregateColumnName: "agg_name",
            /// <field type='Boolean'>Specifies whether the result of a function can be NaN (see options.validate).
            /// <para>The default value is false.</para></field>
            allowNaN: false,
            /// <field type='Boolean'>Specifies whether the result of a function can be plus or minus Infinity (see options.validate).
            /// <para>The default value is false.</para></field>
            allowInfinity: false
        },
        qry: function (options) {
            /// <signature>
            /// <summary>Creates a new query.</summary>
            /// <param name="options" type="Object">Specify an object with one or more fields to override the global default jSQL.options.</param>
            /// <returns type="jSQL.qry" />
            /// </signature>
            /// <signature>
            /// <summary>Creates a new query.</summary>
            /// <returns type="jSQL.qry" />
            /// </signature>

            if (options) {
                for (var p in this.options) {
                    if (options[p] === undefined) {
                        options[p] = this.options[p];
                    }
                }
            }
            else {
                options = this.options;
            }

            // 1. Create a Function from a simple ("x.id") or full lambda ("x => x.id") string expression.
            // 2. Provide centralized parse time validation for string expressions.
            // 3. In the case of 'create' and 'createFilter', provide centralized execution-time validation for functions whether 
            //    create from a string or Function. (A selector, that uses functioner.createFromString, implements it's own 
            //    execution-time validation because it deals with more complexitity such as returning key/value objects, having
            //    a property name, etc).
            var functioner = (function () {

                var _createFromString = function (str, checkForConstant, excludeReturn) {
                    var arg, argCount;
                    // regex from: http://lingjs.codeplex.com
                    var expr = str.match(/^[(\s]*([^()]*?)[)\s]*=>(.*)/);
                    // Use the default lambda argument if it's not a full lambda expression.
                    if (expr === null) {
                        arg = options.lambdaArg;
                    }
                    else {
                        arg = expr[1];
                        if (arg.indexOf(".") > -1 || arg.indexOf("=") > -1) {
                            throw new Error("Invalid lambda expression.");
                        }
                        str = expr[2];
                    }
                    // If it's a selector expression, check to see if it's returning a string constant.
                    if (checkForConstant) {
                        argCount = str.split(arg + ".").length - 1;
                        if (argCount === 0) {
                            str = "\"" + str + "\"";
                        }
                    }
                    if (str.trim().indexOf("return") === 0) {
                        throw new Error("Invalid lambda expression; the expression should not contain a 'return' statement.");
                    }
                    return { func: new Function(arg, excludeReturn ? str : "return " + str), arg: arg, argCount: argCount, expr: str.trim() };
                };

                // Validates the function, at index i, and returns it, if it's a Function; otherwise creates a Function from string.
                var _parse = function (fs, i, method, excludeReturn) {
                    try {
                        var f = fs[i];
                        if (utils.isString(f)) {
                            return _createFromString(f, false, excludeReturn).func;
                        }
                        else if (!utils.isFunction(f)) {
                            throw new Error("Invalid argument; the argument must be a function or string that evaluates as a function.");
                        }
                        return f;
                    } catch (e) {
                        var errorInfo = [{ method: method, args: fs }];
                        if (fs.length > 1) {
                            errorInfo.push(f === undefined ? 'undefined' : f);
                        }
                        throw new JSQLError(e.message, errorInfo);
                    }
                };

                return {
                    // Wraps a single function that either makes an assignment or returns a value of any type (except Object).
                    // Used for the updater function of an 'update' method, the expression of an 'orderBy' method and an aggregate 
                    // (sum, count, agg...) function.
                    create: function (f, method, excludeReturn) {
                        var _wrapped = _parse([f], 0, method, excludeReturn);
                        return {
                            exec: function (obj) {
                                try {
                                    if (!excludeReturn) {
                                        var res = _wrapped(obj);
                                        if (options.validate) {
                                            if (res === undefined) {
                                                throw new Error("Invalid function return; the function returned undefined or is missing a return statement.");
                                            }
                                            if (!options.allowNaN && utils.isNaN(res)) {
                                                throw new Error("Invalid function return; the function returned NaN.");
                                            }
                                            if (!options.allowInfinity && utils.isInfinity(res)) {
                                                throw new Error("Invalid function return; the function returned Infinity.");
                                            }
                                            if (utils.isObject(res)) {
                                                throw new Error("Invalid function return; the function returned an Object.");
                                            }
                                        }
                                        return res;
                                    }
                                    _wrapped(obj);
                                } catch (e) {
                                    throw new JSQLError(e.message, [{ method: method, args: [f] }], obj);
                                }
                            }
                        };
                    },
                    // Wraps one or more functions that return a Boolean value. Used by 'where', 'having' and join 'on'.
                    // fs is a parameter array of functions and/or string expressions.
                    // It employs an add method because it's possible to specify 'where', 'having' and 'on' more than once.
                    createFilter: function (method) {
                        var _filters = [], _original;
                        return {
                            add: function (fs) {
                                if (fs.length === 0) {
                                    throw new JSQLError("Invalid argument; no function specified.", [{ method: method, args: fs }]);
                                }
                                _original = fs;
                                for (var i = 0; i < fs.length; i++) {
                                    _filters.push(_parse(fs, i, method));
                                }
                                return this;
                            },
                            isHit: function (row) {
                                var res;
                                for (var i = 0; i < _filters.length; i++) {
                                    try {
                                        res = _filters[i](row);
                                        if (options.validate && !utils.isBool(res)) {
                                            throw new Error("Invalid filter; the function did not return a boolean value. It may be missing a return statement.");
                                        }
                                        if (!res) {
                                            return false;
                                        }
                                    } catch (e) {
                                        var errorInfo = [{ method: method, args: _original }];
                                        if (errorInfo[0].args.length > 1) {
                                            errorInfo.push(_filters[i]);
                                        }
                                        throw new JSQLError(e.message, errorInfo, row);
                                    }
                                }
                                return true;
                            }
                        };
                    },
                    // Creates a Function from a selector string expression.
                    createFromString: function (str, checkForConstant) {
                        return _createFromString(str, checkForConstant);
                    }
                };
            })();

            // 1. Auto generates column names where the name hasn't been specified and can't be determined.
            // 2. Keeps a record of all used names to ensure there are no duplicates. This is done at parse-time except for 
            //    where a selector is implemented as a Function that either returns a key/value pair object or a single value.
            //    In this case, duplicate names are checked for at execution-time if options.validate is true.
            var columnNames = (function () {
                var _names, _columnIndex = 0;
                return {
                    init: function () {
                        _names = {};
                        _columnIndex = 0;
                    },
                    add: function (name, alias) {
                        if (alias) {
                            if (_names[alias] === undefined) {
                                _names[alias] = {};
                            }
                            else if (_names[alias][name] === true) {
                                return false;
                            }
                            _names[alias][name] = true;
                        }
                        else if (_names[name] === true) {
                            return false;
                        }
                        else {
                            _names[name] = true;
                        }
                        return true;
                    },
                    addTableColumnNames: function (alias) {
                        var duplicateName = null, me = this;
                        utils.each(tables.getTables(alias), function (t) {
                            if (t.items.length > 0) {
                                for (var p in t.items[0]) {
                                    if (!me.add(p, t.alias)) {
                                        duplicateName = p;
                                        return false;
                                    }
                                }
                            }
                        });
                        return duplicateName;
                    },
                    autoGen: function () {
                        _columnIndex++;
                        return "Column " + _columnIndex;
                    }
                };
            })();

            // Holds the tables supplied by the 'from', 'join' and 'leftjoin' methods.
            var tables = (function () {
                var _tables, t1;

                var throwError = function (msg, alias, row, invalidValue) {
                    var errorInfo = [];
                    if (!utils.isNullOrUndefined(alias)) {
                        errorInfo.push({ key: "Alias", value: alias });
                    }
                    if (!utils.isNullOrUndefined(row)) {
                        errorInfo.push({ key: "Row index (zero based)", value: row });
                    }
                    if (!utils.isNullOrUndefined(invalidValue)) {
                        errorInfo.push({ key: "Invalid value", value: invalidValue });
                    }
                    throw new JSQLError(msg, errorInfo.length > 0 ? errorInfo : null);
                };

                // ({ prop1: "Prop1", prop2: 314 }, "table1") --> { table1: { prop1: "prop1", prop2: 314 } }
                var createAliasedRow = function (row, alias) {
                    var aliasedRow = {};
                    aliasedRow[alias] = row;
                    return aliasedRow;
                };

                // Trim & ensure it's a string 
                var _normalizeAlias = function (a) {
                    if (utils.isNullOrUndefined(a)) {
                        return null;
                    }
                    else if (!utils.isString(a)) {
                        throwError("An alias must be of type string.", null, null, a);
                    }
                    a = a.trim();
                    return (a.length === 0) ? null : a;
                };

                var _getIndexOfAlias = function (alias) {
                    for (var i = 0; i < _tables.length; i++) {
                        if (_tables[i].alias && _tables[i].alias === alias) {
                            return i;
                        }
                    }
                    return -1;
                };

                var _getTable = function (alias) {
                    var idx = _getIndexOfAlias(alias);
                    return idx !== -1 ? _tables[idx] : null;
                };

                var _validateTable = function (items, alias, isJoin) {

                    if (!utils.isArray(items)) {
                        throwError("A table must be an array of objects.");
                    }

                    alias = _normalizeAlias(alias);
                    if (isJoin && ((alias === null) || (t1.alias === null))) {
                        throwError("An alias must be supplied for all tables when a join is specified.");
                    }

                    if (_getTable(alias)) {
                        throwError("Alias has already been used.", alias);
                    }

                    // Ensure each table item is an object and that all items have the same property names.
                    // _Todo: check for plain object (key/value pair) not just object.
                    if (options.validateTableItems) {
                        var i, item;
                        if (!(function () {
                            var template = { names: {}, count: null }, count;
                            for (i = 0; i < items.length; i++) {
                                item = items[i];
                                if (!utils.isObject(item)) {
                                    throwError("Table item is not an object.", alias, i, item);
                        }
                                count = 0;
                                for (var p in item) {
                                    if (i === 0) {
                                        template.names[p] = true;
                        }
                        else if (!template.names[p]) {
                                        return false;
                        }
                                    count += 1;
                        }
                                if (i === 0) {
                                    template.count = count;
                        }
                        else if (count !== template.count) {
                                    return false;
                        }
                        }
                            return true;
                        })()) {
                            throwError("Table item has different properties to the rest of the table.", alias, i, item);
                        }
                    }
                    else if (items.length > 0 && !utils.isObject(items[0])) {
                        throwError("A table must be an array of objects.", alias, null, items[0]);
                    }

                    return alias;
                };

                var _getTableItems = function (items) {
                    if (items === null) {
                        return null;
                    }
                    return items.getItems ? items.getItems() : items;
                };

                return {
                    init: function () {
                        _tables = [];
                        t1 = undefined;
                    },
                    addT1: function (args) {
                        var items = args.length > 0 ? args[0] : null;
                        var alias = args.length > 1 ? args[1] : null;
                        if (_tables.length !== 0) {
                            throwError("Only one from table can be specified; specify other tables with the 'join' or 'leftjoin' method.", alias);
                        }
                        items = _getTableItems(items);
                        alias = _validateTable(items, alias);
                        _tables.push({ alias: alias, items: items });
                        t1 = _tables[0];
                    },
                    addJoin: function (name, args) {
                        var items = args.length > 0 ? args[0] : null;
                        var alias = args.length > 1 ? args[1] : null;
                        if (_tables.length === 0) {
                            throwError("The 'from' method must be specified before a 'join' or 'leftjoin' method.", alias);
                        }
                        items = _getTableItems(items);
                        alias = _validateTable(items, alias, true);
                        var on = functioner.createFilter(name);
                        on.add(args.slice(2));
                        _tables.push({ alias: alias, items: items, join: name === "join" ? "inner" : "left", on: on });
                    },
                    normalizeAlias: function (alias) {
                        return _normalizeAlias(alias);
                    },
                    getAliases: function () {
                        var res = [];
                        utils.each(_tables, function (t) {
                            if (t.alias) {
                                res.push(t.alias);
                            }
                        });
                        return res;
                    },
                    getT1Alias: function () {
                        return t1.alias;
                    },
                    getT1Items: function (copy) {
                        return copy ? t1.items.slice() : t1.items;
                    },
                    getIndexOfAlias: function (alias) {
                        return _getIndexOfAlias(alias);
                    },
                    getTables: function (alias) {
                        return alias ? [_getTable(alias)] : _tables;
                    },
                    aliasExists: function (alias) {
                        //return (_getTable(alias) !== null);
                        return (_getIndexOfAlias(alias) !== -1);
                    },
                    isT1Empty: function () {
                        return t1.length === 0;
                    },
                    hasJoins: function () {
                        return _tables.length > 1;
                    },
                    iterateT1: function (callback) {
                        var items = t1.items, alias = t1.alias;
                        for (var i = 0; i < items.length; i++) {
                            if (callback(alias ? createAliasedRow(items[i], alias) : items[i], i) === false) {
                                break;
                            }
                        }
                    },
                    iterateT1Reverse: function (callback) {
                        var items = t1.items, alias = t1.alias;
                        for (var i = items.length - 1; i > -1; i--) {
                            callback(items, alias ? createAliasedRow(items[i], alias) : items[i], i);
                        }
                    },
                    // Joins the tables and calls the 'on' filter after each join. If the 'on' method returns true*, the join method 
                    // is recursively called to append the next join table; otherwise we move onto the next row of the current table.
                    //
                    // *If the 'on' method returns true and all tables have been joined, we call the callback method. This is used
                    // by an 'update', a 'remove' and a select query. A check is made, for 'false' after a call-back because, in 
                    // the case of a 'find' or 'exists' select query, it may be possible to exit after the first hit.
                    //
                    // row: An object containing the aliased items from each table. Required for:
                    //      1. Calling the 'on' filter.
                    //      2. Calling back the 'update' method.
                    //      3. Calling back a select query so that the row can be added to the results.
                    //
                    // requiresCopy: This is required for situation (3) because the row is modified on each iteration and 
                    //               recursive call. To save time, it's only copied when needed; that is when a select query 
                    //               doesn't contain a selector, a selectDistint, a groupBy or aggregates. In any of those 
                    //               situations, a new object is created base on the individual properties of 'row' thus negateing
                    //               the need for a copy.
                    //
                    // itemIndices:  This is required for a 'remove' method. On each callback, the object contains the current item
                    //               index of each table. For example, an itemIndices of: { "0": 0, "1": 5, "2": 10 } would mean
                    //               that the 'row' object refers to [table 1][item 0], [join 1][item 5] and [join 2][item 10].
                    //
                    join: function (callback, requiresCopy) {
                        var tablesUpper = (_tables.length - 1);

                        // Where a left join is specified and the join fails, append a null template to the row. To save time, 
                        // the template is only created when needed.
                        var nullTemplate = (function () {
                            var _templates = {}, template, t;
                            return {
                                get: function (ti, alias) {
                                    if (_templates[alias] === undefined) {
                                        t = _tables[ti];
                                        if (t.items.length > 0) {
                                            template = {};
                                            for (var p in t.items[0]) {
                                                template[p] = null;
                                            }
                                            _templates[alias] = template;
                                        }
                                        else {
                                            _templates[alias] = null;
                                        }
                                    }
                                    return _templates[alias];
                                }
                            };
                        })();

                        (function joinInternal(ti, itemIndices, row) {
                            var t = _tables[ti], item;
                            var isLeftJoin = (t.join && (t.join === "left"));
                            var alias = t.alias;
                            var hit;

                            for (var i = 0; i < t.items.length; i++) {
                                itemIndices[ti] = i;
                                item = t.items[i];
                                row[alias] = item;
                                if (!t.on || t.on.isHit(row)) {
                                    hit = true;
                                    if (ti < tablesUpper) {
                                        if (joinInternal(ti + 1, itemIndices, row) === false) {
                                            return false;
                                        }
                                    } else {
                                        if (callback(requiresCopy ? utils.copyObject(row) : row, itemIndices) === false) {
                                            return false;
                                        }
                                    }
                                }
                            }

                            if (!hit && isLeftJoin) {
                                row[alias] = nullTemplate.get(ti, alias);
                                itemIndices[ti] = -1;
                                if (ti < tablesUpper) {
                                    if (joinInternal(ti + 1, itemIndices, row) === false) {
                                        return false;
                                    }
                                } else {
                                    if (callback(requiresCopy ? utils.copyObject(row) : row, itemIndices) === false) {
                                        return false;
                                    }
                                }
                            }
                        })(0, {}, {});
                    }
                };
            })();

            // Holds all the aggregates for a query.
            var aggregator = (function () {

                // [{ selector: [selector], func: [functioner.create] }]
                var _aggregates,
                    // See _accumulate
                    _aggregateRows;

                // row: the current table row.
                // idx: either 0 when aggregating the whole table or the index of a group.
                //
                // Each _aggregates selector is called and then the min, max, total, count and values[] properties of the 
                // aggregateRow are modified depending on the result. Like T-SQL, only non null values are considered. This means 
                // if there are 10 items and 3 of them are null, then a count of 7 is used in equations such as average.
                //
                // If an aggregate selector consisted of:
                // { totalQty: "x.qty", totalPrice: "x.price" }
                //
                // Then the aggregateRow would look like: 
                // { totalQty:   { func: Function*, values: [], min: n, max: n, total: n, count: n }, 
                //   totalPrice: { func: Function*, values: [], min: n, max: n, total: n, count: n } }
                //
                // *Function is of type functioner.create()
                //
                var _accumulate = function (row, idx) {
                    if (idx === _aggregateRows.length) {
                        _aggregateRows.push({});
                    }
                    var aggregateRow = _aggregateRows[idx];
                    utils.each(_aggregates, function (agg) {
                        var obj = agg.selector.processRow(row);
                        for (var i in obj) {
                            if (aggregateRow[i] === undefined) {
                                aggregateRow[i] = { func: agg.func, values: [], min: null, max: null, total: null, count: 0 };
                            }
                            var value = obj[i];
                            if (value !== null) {
                                aggregateRow[i].values.push(value);
                                if ((aggregateRow[i].min === null) || (value < aggregateRow[i].min)) {
                                    aggregateRow[i].min = value;
                                }
                                if (value > aggregateRow[i].max) {
                                    aggregateRow[i].max = value;
                                }
                                // We add this null check on the off-chance that a total of strings is being performed. Without it,
                                // the string would start with "null..".
                                if (aggregateRow[i].total === null) {
                                    aggregateRow[i].total = value;
                                }
                                else {
                                    aggregateRow[i].total += value;
                                }
                                aggregateRow[i].count++;
                            }
                        }
                    });
                };

                // idx: either 0 when aggregating the whole table or the index of a group.
                // addTo: either an empty object, when aggregating the whole table, or a group row.
                //
                // Call the aggregate function with the aggregateRow object and append the result to the addTo object. 
                //
                var _computeAndAddToObject = function (idx, addTo) {
                    var ar;
                    var aggregateRow = _aggregateRows[idx];
                    for (var i in aggregateRow) {
                        ar = aggregateRow[i];
                        addTo[i] = ar.func.exec({ values: ar.values, count: ar.count, total: ar.total, min: ar.min, max: ar.max });
                    }
                };

                return {
                    create: function () {
                        _aggregates = []; _aggregateRows = [];
                        return {
                            add: function (selector, func) {
                                _aggregates.push({ func: func, selector: selector });
                            },
                            accumulateTable: function (row) {
                                _accumulate(row, 0);
                            },
                            accumulateGroup: function (row, idx) {
                                _accumulate(row, idx);
                            },
                            computeTable: function (having) {
                                // Because the 'where' clause is executed before aggregating, it's possible that an aggregate row
                                // doesn't exists. In this case we return an empty array - unlike T-SQL which would return a row
                                // with default values. This would be no problem if the selector was in the form of an object but 
                                // where it's in the form of a Function, it would require complex parsing of function.toString().
                                if (_aggregateRows.length === 0) {
                                    return [];
                                }
                                var res = {};
                                _computeAndAddToObject(0, res);
                                return (!having || having.isHit(res)) ? [res] : [];
                            },
                            computeAndAddToGroup: function (group, idx) {
                                _computeAndAddToObject(idx, group);
                            }
                        };
                    }
                };
            })();

            // Used by the select, selectDistinct, groupBy and aggregate methods to parse and process a selector in the 
            // form of a string expression, a key/value pair object, a Function that returns a value or a Function that returns 
            // a key/value pair object.
            //
            // > Multiple selectors can be passed as a parameter array. A single 'selector' contains the details of all those 
            //   selectors.
            // > If a method, such as 'select' or 'groupBy', is specified more than once, then a 'selector' is created for each 
            //   one.
            //
            // A selector can be in the following form (not all are valid for each selector method:
            //
            // 1. An Object that contains pairs of property names and expressions (represented by a Function or String expression).
            //    e.g. select({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... })
            // 2. A Function that returns a value.
            //    e.g. select(function (x) { return x.t2.qty * x.t2.price; }, ... )
            // 3. A Function that returns an Object that contains pairs of property names and values.
            //    e.g. select(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... )
            // 4. A String expression, optionally suffixed with a property name enclosed in square brackets.
            //    e.g. select("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...)
            // 5. A special selector '*' to select all items from all tables or all items from a particular table.
            //    e.g. select("*", ...), select("t1.*", "t4.*", ...)
            // 6. An Array, String, Number or Null constant.
            //    e.g. select(100, "Constant", null, ...)
            // 
            // For a 'select', 'selectDistinct' and 'groupBy' method, where a column name is not specified either through an Object 
            // property name or square brackets in a String expression, it is generated as follows:
            //
            // 1. If the selector is a Function that returns a value, it is automatically generated ('Column 1', 'Column 2', ...).
            // 2. If the selector is a string expression that references just one property, the name of the property is used.
            //    e.g. select("x.table1.id"). In this case, the column name 'id' will be used.
            // 
            // For an aggregate method, the rules depend on the setting of options.aggregateColumnName:
            //
            // 1. If set to false, the name is automatically generated ('Column 1', 'Column 2', ...).
            // 2. If set to true, the same rules as 'select', 'selectDistinct' and 'groupBy' are used.
            // 3. If set to "agg_name", the same rules as 'select', 'selectDistinct' and 'groupBy' are used except that the 
            //    property name is prefixed with the aggregate method name.
            //    e.g. sum("x.table1.price"). In this case, the column name 'sum_price' will be used.
            //
            var selector = (function () {

                var _extractNameAndFunc = function (str, aggregateName) {
                    var name = str.match(/[^[\]]+(?=])/g);
                    if (name !== null) {
                        name = name[0];
                        str = str.replace("[" + name + "]", "");
                    }
                    var res = functioner.createFromString(str, true);
                    if (name === null) {
                        // If no expression (0) or a complex expression (>1), auto generate the column name.
                        if ((res.argCount !== 1) || (aggregateName && !options.aggregateColumnName)) {
                            name = columnNames.autoGen();
                        }
                        else {
                            var prefix = res.arg + ".";
                            var startFrom = prefix.length;
                            utils.each(tables.getAliases(), function (alias) {
                                if (res.expr.lastIndexOf(prefix + alias + ".") === 0) {
                                    startFrom = (prefix + alias + ".").length;
                                    return false;
                                }
                            });
                            name = res.expr.substr(startFrom);
                            if (aggregateName && (options.aggregateColumnName === "agg_name")) {
                                name = aggregateName + "_" + name;
                            }
                        }
                    }
                    return { name: name, func: res.func };
                };

                // Validation that is common to a value -or- a value part of an object -or-
                // a value returned from a function -or- a value part of an object returned from a function.
                var validateCommon = function (value, runtime) {
                    var msg;
                    if (value === undefined) {
                        msg = runtime ? "A selector is referring to a non existent property or a function is missing a return statement."
                                      : "The selector is undefined.";
                    }
                    else if (!options.allowNaN && utils.isNaN(value)) {
                        msg = runtime ? "The selector returned NaN." : "NaN is not valid for a selector.";
                    }
                    else if (!options.allowInfinity && utils.isInfinity(value)) {
                        msg = runtime ? "The selector returned Infinity." : "Infinity is not valid for a selector.";
                    }
                    if (msg) {
                        throw new Error(msg);
                    }
                };

                var _getConstant = function (value) {
                    return function () {
                        return value;
                    };
                };

                return {
                    // Creates a new selector. Each clause associated with a selector, 'select', 'selectDistinct' and 'groupBy', 
                    // has just one selector created for it. An 'add' method is employed because the methods can be specified more 
                    // than once.
                    create: function (method, isAggregate) {

                        // _selectors holds the parsed selectors specifed in the 'add' method.
                        // One entry is added for every parameter in the parameter array.
                        // Additionally, if one of the parameters is an Object type, one entry is added for each property.

                        /* [{ 
                        name:               String | undefined
                                            > An Object property name, a name extracted from an expression, an auto-generated name 
                                              or 'undefined' if the selector is a Function type - in this case, the name can't be 
                                              determined until execution-time.
                        func:               Function | "*"
                                            > The parsed function that originated from either a Function/string expression 
                                              in a paramArray item or a Function/string expression in a paramArray item property.
                        originalSelector:   ParamArray [Function | String (expression | '*' | 'alias.*') | Any (constant)] 
                                            > For jSQLError.
                        argIndex:           Number
                                            > For jSQLError; the index of the parm array that the selector was created from.
                        subProperty:        String | undefined
                                            > For jSQLError; the sub-property name if the selector was created from part of 
                                              an Object; otherwise 'undefined'.
                        }]*/
                        var _selectors = [];

                        // Returns an object built up of the results of processing each selector, in _selectors.
                        //
                        // e.g. row = { id: 10, price: 2.5, qty: 2, foo: "bar" }
                        // 
                        // _selectors = [ { name: "id", func: function (x) { return x.id; }, argIndex: 0 } 
                        //                { name: "total", func: function (x) { return x.price * x.qty; }, argIndex: 1 } ]
                        //
                        // (for both items in _selectors, originalSelector = ["x.id", "x.price * x.qty[total]"])
                        //
                        // Returned object: { id: 10, total: 5}
                        //
                        var _processRow = function (row) {

                            var obj = {}, res;

                            var validate = function (s, value, obj, propertyKey) {
                                var errorInfo = [];
                                if (obj) {
                                    value = obj[propertyKey];
                                }
                                try {
                                    validateCommon(value, true);
                                    if (propertyKey && !s.nameIsRuntimeValidated) {
                                        if (!columnNames.add(propertyKey)) {
                                            errorInfo.push(propertyKey);
                                            throw new Error("Invalid selector; duplicate name.");
                                        }
                                        s.nameIsRuntimeValidated = true;
                                    }
                                    if (obj && utils.isFunction(value)) {
                                        throw new Error("The function type selector contains a sub-function.");
                                    }
                                } catch (e) {
                                    if (obj) {
                                        // This is part of an object returned from a function. To keep it simple, we just add the 
                                        // property value because we would need complex regex to try and extract the original 
                                        // selector from the function.
                                        errorInfo.splice(0, 0, utils.extractProperty(obj, propertyKey));
                                    }
                                    throw { message: e.message, errorInfo: errorInfo };
                                }
                            };

                            utils.each(_selectors, function (s, idx) {

                                try {
                                    if (s.name) {
                                        // Generated originally from a part of an Object.
                                        res = s.func(row);
                                        if (options.validate) {
                                            validate(s, res);
                                        }
                                        obj[s.name] = res;
                                    }
                                    else if (s.func === "*") {
                                        if (s.alias) {
                                            // select("alias.*")
                                            obj[s.alias] = {};
                                            for (var i in row[s.alias]) {
                                                obj[s.alias][i] = row[s.alias][i];
                                            }
                                        }
                                        else {
                                            // select("*")
                                            for (var r in row) {
                                                obj[r] = row[r];
                                            }
                                        }
                                    }
                                    else {
                                        // Generated originally from a Function
                                        res = s.func(row);
                                        if (options.validate) {
                                            validate(s, res);
                                        }
                                        if (utils.isObject(res)) {
                                            // Generated originally from a Function that returns an Object.
                                            if (idx === 0 && !options.validate) {
                                                obj = res;
                                            }
                                            else {
                                                for (var p in res) {
                                                    if (options.validate) {
                                                        validate(s, null, res, p);
                                                    }
                                                    obj[p] = res[p];
                                                }
                                            }
                                        }
                                        else {
                                            // Generated originally from a Function that returns a value.
                                            // At parse time, it couldn't be determined whether the Function returned an Object 
                                            // (with property names) or a value. Now we know it's a value so we auto-generate the name here.
                                            s.name = columnNames.autoGen();
                                            if (options.validate) {
                                                validate(s, res, null, s.name);
                                            }
                                            obj[s.name] = res;
                                        }
                                    }
                                } catch (e) {
                                    var errorInfo = [{ method: method, args: s.originalSelector }];
                                    // Only add an entry if the paramArray had more than one entry otherwise it is superfluous.
                                    if (s.originalSelector.length > 1) {
                                        errorInfo.push(s.originalSelector[s.argIndex]);
                                    }
                                    // If the error occurred on a sub-property of an object and the object contains more than one 
                                    // sub-property, add the details.
                                    if (s.subProperty && utils.getPropertyCount(s.originalSelector[s.argIndex]) > 1) {
                                        errorInfo.push(utils.extractProperty(s.originalSelector[s.argIndex], s.subProperty));
                                    }
                                    if (e.errorInfo && e.errorInfo.length > 0) {
                                        errorInfo = errorInfo.concat(e.errorInfo);
                                    }
                                    throw new JSQLError(e.message, errorInfo, row);
                                }
                            });
                            return obj;
                        };

                        // Each entry on the hash table consists of the group and the group index. The group index is required
                        // so that we have a relationship between the group and it's aggregates.
                        var grouper = (function () {
                            var hashtable = {}, index = 0;

                            return {
                                add: function (row, aggregates) {
                                    var group = _processRow(row);
                                    // _Todo: Implement serializer that ignores the property names to save memory.
                                    // http://jsperf.com/stringifyvsserializejustvalues
                                    var hash = JSON.stringify(group);
                                    var item = hashtable[hash];
                                    if (!item) {
                                        item = { group: group, index: index };
                                        hashtable[hash] = item;
                                        index++;
                                    }
                                    if (aggregates) {
                                        aggregates.accumulateGroup(row, item.index);
                                    }
                                },
                                // Add all the groups to an array. If there are any aggregates, append those to each group.
                                getComputed: function (aggregates, having, exitAfterFirstHit) {
                                    var res = [], item;
                                    for (var i in hashtable) {
                                        item = hashtable[i];
                                        if (aggregates) {
                                            aggregates.computeAndAddToGroup(item.group, item.index);
                                        }
                                        if (!having || having.isHit(item.group)) {
                                            res.push(item.group);
                                            if (exitAfterFirstHit) {
                                                return res;
                                            }
                                        }
                                    }
                                    return res;
                                },
                                getDistinct: function () {
                                    var res = [];
                                    for (var i in hashtable) {
                                        res.push(hashtable[i].group);
                                    }
                                    return res;
                                }
                            };
                        })();

                        return {

                            // For each selector in the 'paramArray':
                            //   If it's not an Object, parse it and add to _selectors.
                            //   else for each property in the Object, parse it and add to _selectors.
                            add: function (paramArray) {

                                var obj,
                                    rawSelector, // The current selector of the 'paramArray'.
                                    p; // If the selector is an object, the current property name.

                                try {

                                    if (paramArray.length === 0) {
                                        throw new Error("No selector specified.");
                                    }

                                    var addTableColumnNames = function (alias) {
                                        var duplicateName = columnNames.addTableColumnNames(alias);
                                        if (duplicateName !== null) {
                                            throw { message: "Invalid selector; duplicate name.", value: duplicateName };
                                        }
                                    };

                                    var _add = function (s, argIndex, subProperty) {
                                        if (s.name) {
                                            if (!columnNames.add(s.name)) {
                                                throw { message: "Invalid selector; duplicate name.", value: s.name };
                                            }
                                        }
                                        s.originalSelector = paramArray;
                                        s.argIndex = argIndex;
                                        s.subProperty = subProperty;
                                        _selectors.push(s);
                                    };

                                    for (var i = 0; i < paramArray.length; i++) {

                                        var alias;
                                        rawSelector = paramArray[i]; p = null;

                                        validateCommon(rawSelector);

                                        if (utils.isFunction(rawSelector)) {
                                            // e.g. 1. function (x) { return x.t2.price * x.t2.qty; }
                                            //      2. function (x) { return { id: x.t1.id, total: x.t2.price * x.t2.qty }; }
                                            _add({ func: rawSelector }, i);
                                        }
                                        else if (utils.isString(rawSelector)) {
                                            if ((rawSelector === "*") || (rawSelector.indexOf(".*") !== -1)) {
                                                if (method !== "select" && method !== "selectDistinct" && method !== "count") {
                                                    throw new Error("The selector '*' is only valid with the 'select', 'selectDistinct' and 'count' methods.");
                                                }
                                                if (rawSelector.length === 1) {
                                                    if (method === "count") {
                                                        // count("*")
                                                        // By returning anything, other than null, we ensure that each line will be counted.
                                                        _add({ name: columnNames.autoGen(), func: function () { return "*"; } }, i);
                                                    }
                                                    else {
                                                        // select("*")
                                                        addTableColumnNames(alias);
                                                        _add({ func: "*" }, i);
                                                    }
                                                }
                                                else if (method === "count") {
                                                    throw new Error("The selector '[alias].*' is only valid with the 'select' and 'selectDistinct' methods.");
                                                }
                                                else {
                                                    // select("[alias].*")
                                                    alias = rawSelector.substr(0, rawSelector.length - 2);
                                                    if (!tables.aliasExists(alias)) {
                                                        throw new Error("Invalid selector; the alias doesn't exist.");
                                                    }
                                                    addTableColumnNames(alias);
                                                    _add({ func: "*", alias: alias }, i);
                                                }
                                            }
                                            else {
                                                // e.g. 1. "x.t1.price * x.t1.qty[total]"
                                                //      2. "x => x.id"
                                                //      3. "x => x.t1.price * x.t1.qty[total]"
                                                //      4. "constant[constant]" 
                                                _add(_extractNameAndFunc(rawSelector, (isAggregate ? method : null)), i);
                                            }
                                        }
                                        else if (utils.isObject(rawSelector)) {
                                            // e.g. { total: "x.price * x.qty", profit: function (x) { return x.sales - x.cost; } }
                                            // Add one entry for each object property.
                                            for (p in rawSelector) {

                                                obj = rawSelector[p];
                                                validateCommon(obj);

                                                if (utils.isFunction(obj)) {
                                                    _add({ name: p, func: obj }, i, p);
                                                }
                                                else if (obj === "*") {
                                                    if (method !== "count") {
                                                        throw new Error("The selector '*', as a property value of an object, is only valid with the count method.");
                                                    }
                                                    // By returning anything, other than null, we ensure that each line will be counted.
                                                    _add({ name: p, func: function () { return "*"; } }, i, p);
                                                }
                                                else if (utils.isString(obj)) {
                                                    _add({ name: p, func: functioner.createFromString(obj, true).func }, i, p);
                                                }
                                                else {
                                                    // A Number, Array, null etc. constant.
                                                    // Because 'obj' will change, we need to pass to a wrapping function, _getConstant, to realize to a primitive value.
                                                    _add({ name: p, func: _getConstant(obj) }, i, p);
                                                }
                                            }
                                        }
                                        else {
                                            // A Number, Array, null etc. constant.
                                            // Because 'obj' will change, we need to pass to a wrapping function, _getConstant, to realize to a primitive value.
                                            _add({ name: columnNames.autoGen(), func: _getConstant(rawSelector) }, i);
                                        }
                                    }

                                    return this;
                                } catch (e) {
                                    var stack = [{ method: method, args: paramArray }];
                                    // Only add an entry if the paramArray had more than one entry otherwise it is superfluous.
                                    if (paramArray.length > 1) {
                                        stack.push(rawSelector);
                                    }
                                    // If the error occurred on a sub-property of an object and the object contains more than one 
                                    // sub-property, add the details.
                                    if (!utils.isNullOrUndefined(p) && utils.getPropertyCount(rawSelector) > 1) {
                                        stack.push(utils.extractProperty(rawSelector, p));
                                    }
                                    // Add any other specific details (such as duplicate name).
                                    if (e.value) {
                                        stack.push(e.value);
                                    }
                                    throw new JSQLError(e.message, stack);
                                }
                            },
                            processRow: function (row) {
                                return _processRow(row);
                            },
                            groupRow: function (row, aggregates) {
                                grouper.add(row, aggregates);
                            },
                            computeGroupAggregates: function (aggregates, having, exitAfterFirstHit) {
                                return grouper.getComputed(aggregates, having, exitAfterFirstHit);
                            },
                            getDistinct: function () {
                                return grouper.getDistinct();
                            }
                        };
                    }
                };

            })();

            // A list of every table, expression, clause, etc. in the query.
            // Nothing is done with the actions queue until an 'update', 'delete' or select method is performed. This ensures that:
            // 1. All the selects and filters are completely fresh each execution.
            // 2. Its easy to extend the query, by simply copying the queue array. This allows one to create a partial query and then 
            //    create others based on it without effecting the original.
            var actions = (function () {

                var queue = [];
                var where, select, selectDistinct, groupBy, aggregates, having, orderBy;

                var processQueue = function () {

                    var _actions = { where: null, select: null, selectDistinct: null, groupBy: null, aggregates: null, having: null, orderBy: null };
                    var addedSelector;

                    var aggregateError = function (method) {
                        return new JSQLError("Aggregates are not valid with the '" + method + "' method.");
                    };

                    tables.init();
                    columnNames.init();

                    utils.each(queue, function (item) {
                        var name = item.name;
                        var args = item.args;

                        if (name == "from") {
                            tables.addT1(args);
                        }
                        else if (name === "join") {
                            tables.addJoin("join", args);
                        }
                        else if (name === "leftjoin") {
                            tables.addJoin("leftjoin", args);
                        }
                        else if (item.type === "selector") {
                            if (addedSelector && (addedSelector !== name)) {
                                throw new JSQLError("Specify either the 'select', 'selectDistinct' or 'groupBy' method.");
                            }
                            // Check incase an aggregate has been specified before 'selectDistinct'.
                            if ((name === "selectDistinct") && _actions.aggregates) {
                                throw aggregateError(name);
                            }
                            addedSelector = name;
                            if (!_actions[name]) {
                                _actions[name] = selector.create(name);
                            }
                            _actions[name].add(args);
                        }
                        else if (item.type === "filter") {
                            if ((name === "having") && !_actions.aggregates) {
                                throw new JSQLError("The having clause must be specified with aggregates.");
                            }
                            if (!_actions[name]) {
                                _actions[name] = functioner.createFilter(name);
                            }
                            _actions[name].add(args);
                        }
                        else if (name === "orderBy") {
                            // The orderBy object holds a sort function and an array that contains an entry for each orderBy expression 
                            // (whether specified multiple times via a param array or via multiple 'orderBy' methods). Each item also 
                            // specifies whether the sort is descending or not.
                            if (args.length === 0) {
                                // Force an error
                                functioner.create(null, name);
                            }
                            if (!_actions.orderBy) {
                                _actions.orderBy = {
                                    args: [], sort: function (items) {
                                        var compare = function (obj1, obj2, ob) {
                                            var func = ob.func;
                                            var a = func.exec(obj1);
                                            var b = func.exec(obj2);
                                            var res = (a < b) ? -1 : (a > b) ? 1 : 0;
                                            return ob.desc ? res * -1 : res;
                                        };
                                        items.sort(function (obj1, obj2) {
                                            var res;
                                            utils.each(orderBy.args, function (ob) {
                                                res = compare(obj1, obj2, ob);
                                                if (res !== 0) {
                                                    return false;
                                                }
                                            });
                                            return res;
                                        });
                                    }
                                };
                            }
                            utils.each(args, function (a) {
                                _actions.orderBy.args.push({ func: functioner.create(a, name), desc: item.desc });
                            });
                        }
                        else {
                            // Aggregate.
                            // The _actions.aggregates objects holds the details for all aggregates. Each entry is made up of one or more 
                            // selector expressions and an aggregate function (such as sum, min, max, etc.)
                            if (_actions.selectDistinct) {
                                throw aggregateError("selectDistinct");
                            }
                            if (_actions.select) {
                                throw aggregateError("select");
                            }
                            _actions.aggregates = _actions.aggregates || aggregator.create();
                            _actions.aggregates.add(selector.create(name, true).add(args), functioner.create(item.func, name));
                        }
                    });
                    if (tables.getTables().length === 0) {
                        throw new JSQLError("No tables have been specified.");
                    }
                    where = _actions.where; select = _actions.select; selectDistinct = _actions.selectDistinct;
                    groupBy = _actions.groupBy; aggregates = _actions.aggregates; having = _actions.having; orderBy = _actions.orderBy;
                };

                return {
                    add: function (instance, a) {
                        a.args = Array.prototype.slice.call(a.args);
                        queue.push(a);
                        return instance;
                    },
                    copy: function () {
                        var actionsCopy = [];
                        utils.each(queue, function (item) {
                            actionsCopy.push(utils.copyObject(item));
                        });
                        return actionsCopy;
                    },
                    set: function (actions) {
                        queue = actions;
                    },
                    execQry: function (method, iterateCallback, onIterateCompleteCallback, skip, take) {

                        processQueue();

                        if (tables.isT1Empty()) {
                            return [];
                        }

                        var res = [];

                        if ((method === "exists" || method === "find")) {
                            orderBy = null;
                        }

                        var groupingRequired = (groupBy || aggregates || selectDistinct);
                        var exitAfterFirstHit;

                        // The same query can be used for multiple result methods, such as 'exists' and 'toArray', so only get rid of the 
                        // non-applicable methods depending on the requirment.
                        if ((method === "exists") && !having) {
                            select = null; selectDistinct = null; groupBy = null; aggregates = null;
                            groupingRequired = false; exitAfterFirstHit = true;
                        }
                        else if ((method === "find") && !groupingRequired) {
                            exitAfterFirstHit = true;
                        }

                        if (!tables.hasJoins() && !tables.getT1Alias() && !where && !select && !groupingRequired) {
                            if (exitAfterFirstHit) {
                                return [tables.getT1Items()[0]];
                            }
                            res = tables.getT1Items(orderBy);
                        }
                        else {
                            // See tables.join for an explanation of 'requiresCopy'.
                            var requiresCopy = (!select && !groupingRequired);
                            (tables.hasJoins() ? tables.join : tables.iterateT1)(function (row) {
                                if (!where || where.isHit(row)) {
                                    if (groupBy) {
                                        groupBy.groupRow(row, aggregates);
                                    }
                                    else if (aggregates) {
                                        aggregates.accumulateTable(row);
                                    }
                                    else if (selectDistinct) {
                                        selectDistinct.groupRow(row);
                                    }
                                    else {
                                        if (select) {
                                            row = select.processRow(row);
                                        }
                                        res.push(row);
                                        if (exitAfterFirstHit) {
                                            return false;
                                        }
                                    }
                                }
                            }, requiresCopy);
                        }

                        if (groupBy) {
                            res = groupBy.computeGroupAggregates(aggregates, having, (method === "exists" || method === "find"));
                        }
                        else if (aggregates) {
                            res = aggregates.computeTable(having);
                        }
                        else if (selectDistinct) {
                            res = selectDistinct.getDistinct();
                        }

                        if (res.length > 0) {
                            if (orderBy) {
                                orderBy.sort(res);
                            }
                            if (skip !== undefined) {
                                res = (take === undefined) ? res.slice(skip) :
                                      (take < 0) ? res.slice(Math.max(res.length + take, 0), res.length)
                                                           : res = res.slice(skip, skip + take);
                            }
                            // If the use chose to iterate the results rather than receive an array, call the specified function.
                            // _Todo: Not sure if worth doing, but if there is no orderBy, skip or take specified then we could 
                            //        callback as each item is finalized.
                            if (iterateCallback) {
                                for (var i = 0; i < res.length; i++) {
                                    if (iterateCallback(res[i], i) === false) {
                                        break;
                                    }
                                }
                                if (onIterateCompleteCallback) {
                                    onIterateCompleteCallback();
                                }
                                return;
                            }
                        }

                        return res;
                    },
                    execUpdate: function (updatef, replaceWith) {
                        var f;
                        processQueue();
                        if (replaceWith) {
                            // Determine whether we're replacing with a single object or an aliased object containing one or more replacers.
                            var updatesByTableIndex = (function () {
                                var res = [], tableIndex;
                                for (var i in replaceWith) {
                                    tableIndex = tables.getIndexOfAlias(i);
                                    if (tableIndex === -1) {
                                        if (res.length === 0) {
                                            res.push({ tableIndex: -1, replaceWith: replaceWith });
                                            break;
                                        }
                                        else {
                                            throw new JSQLError("Invalid update method; the alias doesn't exist.", [{ key: "Alias", value: i }]);
                                        }
                                    }
                                    else {
                                        res.push({ tableIndex: tableIndex, items: tables.getTables()[tableIndex].items, replaceWith: replaceWith[i] });
                                    }
                                }
                                return res;
                            })();
                            if (updatesByTableIndex.length === 1 && updatesByTableIndex[0].tableIndex === -1) {
                                // .update({ id: 10, name: ... })
                                if (tables.hasJoins()) {
                                    throw new JSQLError("Invalid update method; the table has joins but an alias was not specified for the 'replaceWith' object.");
                                }
                                f = functioner.create(function (row) {
                                    for (var i in row) {
                                        row[i] = replaceWith[i];
                                    }
                                }, "update", true);
                            }
                            else {
                                // .update({ alias1: { id: 10, name: ... }, alias2: { id: 10, name: ... }, ...)
                                // Because the table is aliased, we can replace the object(s) instead of replacing each individual prop value.
                                (tables.hasJoins() ? tables.join : tables.iterateT1)(function (row, itemIndices) {
                                    if (!where || where.isHit(row)) {
                                        utils.each(updatesByTableIndex, function (u) {
                                            u.items[itemIndices[u.tableIndex]] = u.replaceWith;
                                        });
                                    }
                                });
                                return;
                            }
                        }
                        else {
                            f = functioner.create(updatef, "update", true);
                        }
                        (tables.hasJoins() ? tables.join : tables.iterateT1)(function (row) {
                            if (!where || where.isHit(row)) {
                                f.exec(row);
                            }
                        });
                    },
                    execDelete: function (aliases) {

                        processQueue();

                        // Single table

                        if (!tables.hasJoins()) {
                            tables.iterateT1Reverse(function (items, item, i) {
                                if (!where || where.isHit(item)) {
                                    items.splice(i, 1);
                                }
                            });
                            return;
                        }

                        // Join

                        if (aliases.length === 0) {
                            throw new JSQLError("Invalid delete method; at least one alias must be specified where there is a join.");
                        }

                        utils.each(aliases, function (alias, i) {
                            var normalized = tables.normalizeAlias(alias);
                            var tableIndex = tables.getIndexOfAlias(normalized);
                            if (tableIndex === -1) {
                                throw new JSQLError("Invalid delete method; the alias doesn't exist.", [{ key: "Alias", value: alias }]);
                            }
                            aliases[i] = { alias: normalized, tableIndex: tableIndex, rowsToDelete: [] };
                        });

                        tables.join(function (row, itemIndices) {
                            if (!where || where.isHit(row)) {
                                utils.each(aliases, function (a) {
                                    if (a.rowsToDelete.indexOf(itemIndices[a.tableIndex]) < 0) {
                                        a.rowsToDelete.push(itemIndices[a.tableIndex]);
                                    }
                                });
                            }
                        });

                        var tabs = tables.getTables();
                        utils.each(aliases, function (a) {
                            var items = tabs[a.tableIndex].items;
                            for (var i = a.rowsToDelete.length - 1; i > -1; i--) {
                                items.splice(a.rowsToDelete[i], 1);
                            }
                        });

                    }
                };
            })();

            return {

                from: function () {
                    /// <signature>
                    /// <summary>Specifies the first table.</summary>
                    /// <param name="items" type="Array | Object" elementType="PlainObject">An array of key/value pair objects that 
                    /// represents the table -or- an object that implements a getItems() method that returns an array of such items.</param>
                    /// <param name="alias" type="String">A table alias. This is required when a join method is employed.</param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    /// <signature>
                    /// <summary>Specifies the first table.</summary>
                    /// <param name="items" type="Array | Object" elementType="PlainObject">An array of key/value pair objects that 
                    /// represents the table -or- an object that implements a getItems() method that returns an array of such items.</param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "from", args: arguments });
                },
                join: function () {
                    /// <signature>
                    /// <summary>Specifies a join table; if the relationship, specified by the 'on' argument, resolves to false, 
                    /// the row is not returned.</summary>
                    /// <param name="items" type="Array | Object" elementType="PlainObject">An array of key/value pair objects that 
                    /// represents the table -or- an object that implements a getItems() method that returns an array of such items.</param>
                    /// <param name="alias" type="String">A table alias.</param>
                    /// <param name="on" type="Function | String">Specifies the relationship between the join table and previous tables. A parameter 
                    /// array consisting of one or more of the following:
                    /// <para>A Function that returns a Boolean value. e.g. function (x) { return x.t2.t1id === x.t1.id; } -OR-</para>
                    /// <para>A String expression that returns a Boolean value. e.g. "x.t2.t1id === x.t1.id", "x => x.t2.t1id === x.t1.id"</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "join", args: arguments });
                },
                leftjoin: function () {
                    /// <signature>
                    /// <summary>Specifies a left join table; if the relationship, specified by the 'on' argument, resolves to false, 
                    /// the row is still returned with the property values set to null for this table. (Where there is no data in this table, 
                    /// only the previous table values are returned because it's impossible to determine the property names of this table. 
                    /// Instead the alias property will have a null value. e.g. { t1: { id: 10, ... }, t2: null }).
                    /// </summary>
                    /// <param name="items" type="Array | Object" elementType="PlainObject">An array of key/value pair objects that 
                    /// represents the table -or- an object that implements a getItems() method that returns an array of such items.</param>
                    /// <param name="alias" type="String">A table alias.</param>
                    /// <param name="on" type="Function | String">Specifies the relationship between the join table and previous tables. A parameter 
                    /// array consisting of one or more of the following:
                    /// <para>A Function that returns a Boolean value. e.g. function (x) { return x.t2.t1id === x.t1.id; } -OR-</para>
                    /// <para>A String expression that returns a Boolean value. e.g. "x.t2.t1id === x.t1.id", "x => x.t2.t1id === x.t1.id"</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "leftjoin", args: arguments });
                },
                select: function () {
                    /// <signature>
                    /// <summary>Specifies which columns to select from the tables(s). If aggregating the whole table, either don't 
                    /// specify a select statement or specify an empty select. e.g. select().sum("x.id").
                    /// <para>The generation of property names follows the same rules as options.aggregateColumnName when set to 
                    /// true.</para>
                    /// </summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. select({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. select(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. select(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. select("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>A special selector '*' to select all items from all tables or all items from a particular table.
                    /// e.g. select("*", ...), select("t1.*", "t4.*", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. select(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    if (arguments.length > 0) {
                        return actions.add(this, { name: "select", args: arguments, type: "selector" });
                    }
                    return this;
                },
                selectDistinct: function () {
                    /// <signature>
                    /// <summary>Specifies which columns to select from the tables(s) and returns unique rows. To use aggregate 
                    /// functions, use the groupBy method.
                    /// <para>The generation of property names follows the same rules as options.aggregateColumnName when set to 
                    /// true.</para>
                    /// </summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. select({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. select(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. select(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. select("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>A special selector '*' to select all items from all tables or all items from a particular table.
                    /// e.g. select("*", ...), select("t1.*", "t4.*", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. select(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "selectDistinct", args: arguments, type: "selector" });
                },
                groupBy: function () {
                    /// <signature>
                    /// <summary>Specifies one or more columns to group the results by. Specify aggregates separately with the 
                    /// aggregate methods.
                    /// <para>The generation of property names follows the same rules as options.aggregateColumnName when set to 
                    /// true.</para>
                    /// </summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. groupBy({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. groupBy(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. groupBy(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. groupBy("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. groupBy(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "groupBy", args: arguments, type: "selector" });
                },
                having: function () {
                    /// <signature>
                    /// <summary>Specifies which aggregate rows should be returned.</summary>
                    /// <param name="filter" type="Function | String">A parameter array consisting of one or more of the following:
                    /// <para>A Function that returns a Boolean value. 
                    ///  e.g. groupBy("x.t1.id").sum("x.t2.price * x.t2.qty[total]").having(function (x) { return x.total > 500; }, ...) -OR-</para>
                    /// <para>A String expression that returns a Boolean value. 
                    /// e.g. groupBy("x.t1.id").sum("x.t2.price * x.t2.qty[total]").having("x.total > 500", ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "having", args: arguments, type: "filter" });
                },
                where: function () {
                    /// <signature>
                    /// <summary>Specifies which rows should be returned.</summary>
                    /// <param name="filter" type="Function | String">A parameter array consisting of one or more of the following:
                    /// <para>A Function that returns a Boolean value. e.g. function (x) { return x.id > 10; } -OR-</para>
                    /// <para>A String expression that returns a Boolean value. e.g. "x.price * x.qty === 300.50", "x => x.price * x.qty === 300.50"</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "where", args: arguments, type: "filter" });
                },
                agg: function () {
                    /// <signature>
                    /// <summary>Aggregates all the values, distinct values or a group of values, in the expression using the 
                    /// specified user defined function.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    ///
                    /// <param name="aggregator" type="Function | String">A function, represented by a Function or String expression, 
                    /// that is passed one Object argument, { values: [All the values], count: [The total number of values], total: [The sum of the values], 
                    ///  min: [The minimum value], max: [The maximum value] }, and returns an aggregate value for all the values, 
                    /// distinct values or group of values.
                    /// <para>&#160;</para>
                    /// <para>The function can be specified as follows:</para>
                    /// <para>A Function. e.g. function (x) { return x.total / x.count; } -OR-</para>
                    /// <para>A String expression. e.g. "x.total / x.count", "x => x.total / x.count"</para>
                    /// </param>
                    ///
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. sum({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. sum(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. sum(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. sum("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. sum(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    var func = Array.prototype.slice.call(arguments, 0, 1);
                    return actions.add(this, {
                        name: "agg",
                        func: func.length > 0 ? func[0] : null,
                        args: Array.prototype.slice.call(arguments, 1)
                    });
                },
                count: function () {
                    /// <signature>
                    /// <summary>Returns the total number of items, distinct items or a group of items. Null values are ignored unless '*' is specified.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and 
                    /// functions (represented by a Function or String expression) or the special selector '*'.
                    /// e.g. count({ id: function (x) { return x.t1.id; }, total: "x.t2.price * x.t2.qry", all: "*", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. count(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. count(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. count("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>A special selector '*' to count all items including nulls.
                    /// e.g. count("*", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. sum(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "count", func: function (x) { return x.count; }, args: (arguments.length === 0) ? ["*"] : arguments });
                },
                sum: function () {
                    /// <signature>
                    /// <summary>Returns the sum of all the values, distinct values or a group of values in the expression. This method can 
                    /// be used with any type and will use the javascript convention for adding the two values together. Null values are ignored.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. sum({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. sum(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. sum(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. sum("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. sum(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "sum", func: function (x) { return x.total; }, args: arguments });
                },
                max: function () {
                    /// <signature>
                    /// <summary>Returns the maximum of all the values, or only the distinct values, in the expression. This method can 
                    /// be used with any type and will use the javascript convention determining the maximum of two values. Null values are ignored.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. max({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. max(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. max(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. max("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. max(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "max", func: function (x) { return x.max; }, args: arguments });
                },
                min: function () {
                    /// <signature>
                    /// <summary>Returns the minimum of all the values, or only the distinct values, in the expression. This method can 
                    /// be used with any type and will use the javascript convention determining the minimum of two values. Null values are ignored.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. max({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. max(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. max(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. max("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. max(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "min", func: function (x) { return x.min; }, args: arguments });
                },
                avg: function () {
                    /// <signature>
                    /// <summary>Returns the average of all the values, or only the distinct values, in the expression. This method can 
                    /// be used with any type but will return NaN if not used with a Number type. Null values are ignored.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. max({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. max(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. max(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. max("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. max(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "avg", func: function (x) { return x.total === null ? null : x.count === 0 ? 0 : x.total / x.count; }, args: arguments });
                },
                varp: function () {
                    /// <signature>
                    /// <summary>Returns the statistical variance for the population for all values, or only the distinct values, 
                    /// in the expression. This method can be used with any type but will return NaN if not used with a Number type. 
                    /// Null values are ignored.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. varp({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. varp(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. varp(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. varp("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. varp(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "varp", func: function (x) { return formulas.variance(x, true); }, args: arguments });
                },
                variance: function () {
                    /// <signature>
                    /// <summary>Returns the statistical variance of all values, or only the distinct values, 
                    /// in the expression. This method can be used with any type but will return NaN if not used with a Number type. 
                    /// Null values are ignored.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. variance({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. variance(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. variance(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. variance("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. variance(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "variance", func: function (x) { return formulas.variance(x, false); }, args: arguments });
                },
                stdevp: function () {
                    /// <signature>
                    /// <summary>Returns the statistical standard deviation for the population for all values, or only the distinct values, 
                    /// in the expression. This method can be used with any type but will return NaN if not used with a Number type. 
                    /// Null values are ignored.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. stdevp({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. stdevp(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. stdevp(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. stdevp("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. stdevp(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "stdevp", func: function (x) { return formulas.stdev(x, true); }, args: arguments });
                },
                stdev: function () {
                    /// <signature>
                    /// <summary>Returns the statistical standard deviation of all values, or only the distinct values, 
                    /// in the expression. This method can be used with any type but will return NaN if not used with a Number type. 
                    /// Null values are ignored.
                    /// <para>Where a property name is not specified, through an Object property name or square brackets, it will 
                    /// be generated depending on the value of options.aggregateColumnName.</para></summary>
                    /// <param name="selector" type="PlainObject | Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>An Object that contains pairs of property names and expressions (represented by a Function or String expression).
                    /// e.g. stdev({ id: function (x) { return x.t1.id; }, qty: "x => x.t2.qty", total: "x.t2.price * x.t2.qry", ... }) -OR-</para>
                    /// <para>A Function that returns a value.
                    /// e.g. stdev(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A Function that returns an Object that contains pairs of property names and values.
                    /// e.g. stdev(function (x) { return { id: x.t1.id, price: x.t2.price, ... }; }, ... ) -OR-</para>
                    /// <para>A String expression, optionally suffixed with a property name enclosed in square brackets.
                    /// e.g. stdev("x.t1.id", "x => x.t2.qty * x.t2.price[total]", ...) -OR-</para>
                    /// <para>An Array, String, Number or Null constant.
                    /// e.g. stdev(100, "Constant", null, ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "stdev", func: function (x) { return formulas.stdev(x, false); }, args: arguments });
                },
                orderBy: function () {
                    /// <signature>
                    /// <summary>Specifies how the results will be ordered.</summary>
                    /// <param name="expression" type="Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>A Function that returns a value.
                    /// e.g. orderBy(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A String expression that returns a value.
                    /// e.g. orderBy("x.t1.id", "x => x.t2.qty * x.t2.price", ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "orderBy", desc: false, args: arguments });
                },
                orderByDesc: function () {
                    /// <signature>
                    /// <summary>Specifies how the results will be ordered in descending order.</summary>
                    /// <param name="expression" type="Function | String">
                    /// A parameter array consisting of one or more of the following:
                    /// <para>A Function that returns a value.
                    /// e.g. orderByDesc(function (x) { return x.t2.qty * x.t2.price; }, ... ) -OR-</para>
                    /// <para>A String expression that returns a value.
                    /// e.g. orderBy("x.t1.id", "x => x.t2.qty * x.t2.price", ...)</para>
                    /// </param>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    return actions.add(this, { name: "orderBy", desc: true, args: arguments });
                },
                update: function () {
                    /// <signature>
                    /// <summary>Updates all or a subset of items depending on whether a 'where' clause has been specified in the query.
                    /// <para>Any query methods other than 'from', 'join', 'leftjoin' and 'where' are ignored.</para></summary>
                    /// <param name="updater" type="Function | String">Either one of the following:
                    /// <para>A Function that modifies property values. e.g. function (x) { x.t2.name = 'new name'; } -OR-</para>
                    /// <para>A String expression that modifies property values. e.g. "x.t2.name = 'new name'", "x => x.t2.name = 'new name'"</para>
                    /// </param>
                    /// </signature>
                    /// <signature>
                    /// <summary>Updates all or a subset of items depending on whether a 'where' clause has been specified in the query.
                    /// <para>Any query methods other than 'from', 'join', 'leftjoin' and 'where' are ignored.</para></summary>
                    /// <param name="replaceWith" type="Object">Either one of the following:
                    /// <para>A plain key/value pair object that will replace the selected item(s). 
                    /// e.g. "{ id: 10, name: "foo", ... }" -OR-</para>
                    /// <para>A plain key/value pair object containing a replacement for one or more table aliases. 
                    /// e.g. "{ alias1: { id: 10, name: "foo", ... }, alias2: { name: "bar", ... }, ... }"</para>
                    /// </param>
                    /// </signature>
                    var updatef, replaceWith;
                    if (arguments.length === 0) {
                        throw new JSQLError("Invalid arguments.", [{ key: "Method", value: "update" }]);
                    }
                    if (utils.isFunction(arguments[0]) || utils.isString(arguments[0])) {
                        updatef = arguments[0];
                    }
                    else {
                        replaceWith = arguments[0];
                    }
                    actions.execUpdate(updatef, replaceWith);
                    // _Todo: optional parameter to specify that there is at most one result so that we can exit after the first update.
                    //        Non trivial because if the where filter is based on T1 and joins are being updated then we would expect
                    //        to exit only after all joins have been updated not after the first item.
                },
                remove: function () {
                    /// <signature>
                    /// <summary>Deletes all or a subset of items depending on whether a 'where' clause has been specified in the 
                    /// query. Use this overload to delete items where one or more 'join' clauses are specified.
                    /// <para>Any query methods other than 'from', 'join', 'leftjoin' and 'where' are ignored.</para></summary>
                    /// <param name="aliases" type="String">A parameter array containing one or more aliases that specify from which 
                    /// table(s) to delete the items.</param>
                    /// </signature>
                    /// <signature>
                    /// <summary>Deletes all or a subset of items, depending on whether a 'where' clause has been specified in 
                    /// the query. Use this overload to delete items from a single table where a 'join' clause has not been specified.
                    /// <para>Any query methods other than 'from', 'join', 'leftjoin' and 'where' are ignored.</para></summary>
                    /// </signature>
                    actions.execDelete(Array.prototype.slice.call(arguments, 0));
                    // _Todo: optional parameter to specify that there is at most one result so that we can exit after the first delete.
                    //        Non trivial - See update().
                },
                exists: function () {
                    /// <signature>
                    /// <summary>Executes the query and returns true when the first item is found; otherwise false.
                    /// <para>Execution is halted as soon as an item is found.</para>
                    /// <para>If an 'orderBy' clause is specified, it is ignored. If no 'having' clause is specified, a 'groupBy' 
                    /// clause, 'select' clause, 'selectDistinct' clause and any aggregates are also ignored.</para></summary>
                    /// <returns type="Boolean" />
                    /// </signature>
                    return actions.execQry("exists").length > 0;
                },
                find: function (scalar) {
                    /// <signature>
                    /// <summary>Executes the query and returns the first item, if found; otherwise null.
                    /// <para>Execution is halted as soon as an item is found.</para>
                    /// <para>If an 'orderBy' clause is specified, it is ignored. If you want the first item based on a 
                    /// particular order then use 'top(1)'.</para></summary>
                    /// <param name="scalar" type="Boolean | String">Specify one of the following values:
                    /// <para>true to return the value of the first property in the item, if an item was found; otherwise null.</para>
                    /// <para>A property name to return the property value, if an item was found; otherwise null.
                    /// An error is thrown if the property doesn't exist on the returned item.</para>
                    /// </param>
                    /// <returns type="Number | String | Array | null" />
                    /// </signature>
                    /// <signature>
                    /// <summary>Executes the query and returns the first item, if found; otherwise null.
                    /// <para>Execution is halted as soon as an item is found.</para>
                    /// <para>If an 'orderBy' clause is specified, it is ignored. If you want the first item based on a 
                    /// particular order then use 'top(1)'.</para></summary>
                    /// <returns type="Object | null" />
                    /// </signature>
                    var items = actions.execQry("find");
                    if (items.length > 0) {
                        if (scalar) {
                            for (var p in items[0]) {
                                if (scalar === true || p === scalar) {
                                    return items[0][p];
                                }
                            }
                            throw new JSQLError("Invalid scalar; the property '" + scalar + "' was not found on the returned object.");
                        }
                        return items[0];
                    }
                    return null;
                },
                toArray: function () {
                    /// <signature>
                    /// <summary>Executes the query and returns the results. If no results are found, an empty Array is returned.</summary>
                    /// <returns type="Array" />
                    /// </signature>
                    return actions.execQry("toArray");
                },
                iterate: function (callback, onComplete) {
                    /// <signature>
                    /// <summary>Executes the query and iterates each item in the results, calling back the specified function with 
                    /// the item.</summary>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// </signature>
                    /// <signature>
                    /// <summary>Executes the query and iterates each item in the results, calling back the specified function with 
                    /// the item.</summary>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// <param name="onComplete" type="Function">A function to call when the iteration is complete.</param>
                    /// </signature>
                    actions.execQry("toArray", callback, onComplete);
                },
                skipTake: function () {
                    /// <signature>
                    /// <summary>Executes the query and iterates a subset of the results, calling back the specified 
                    /// function with each item.</summary>
                    /// <param name="skip" type="Number">An integer greater than or equal to zero that specifies how many rows of 
                    /// the results to ignore.</param>
                    /// <param name="take" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// <param name="onComplete" type="Function">A function to call when the iteration is complete.</param>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and iterates a subset of the results, calling back the specified 
                    /// function with each item.</summary>
                    /// <param name="skip" type="Number">An integer greater than or equal to zero that specifies how many rows of 
                    /// the results to ignore.</param>
                    /// <param name="take" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and iterates a subset of the results, calling back the specified 
                    /// function with each item.</summary>
                    /// <param name="skip" type="Number">An integer greater than or equal to zero that specifies how many rows of 
                    /// the results to ignore.</param>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// <param name="onComplete" type="Function">A function to call when the iteration is complete.</param>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and iterates a subset of the results, calling back the specified 
                    /// function with each item.</summary>
                    /// <param name="skip" type="Number">An integer greater than or equal to zero that specifies how many rows of 
                    /// the results to ignore.</param>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and returns part of the results.</summary>
                    /// <param name="skip" type="Number">An integer greater than or equal to zero that specifies how many rows of 
                    /// the results to ignore.</param>
                    /// <param name="take" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <returns type="Array" />
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and returns part of the results.</summary>
                    /// <param name="skip" type="Number">An integer greater than or equal to zero that specifies how many rows of 
                    /// the results to ignore.</param>
                    /// <returns type="Array" />
                    /// </signature>
                    var skip, take, iterator, onComplete;
                    try {
                        skip = utils.parseInteger(arguments[0], 0);
                        if (arguments.length == 2) {
                            if (utils.isFunction(arguments[1])) {
                                iterator = arguments[1];
                            }
                            else {
                                take = utils.parseInteger(arguments[1], 1);
                            }
                        }
                        else if (arguments.length > 2) {
                            if (!utils.isFunction(arguments[2])) {
                                throw new Error();
                            }
                            if (arguments.length === 3) {
                                if (utils.isFunction(arguments[1])) {
                                    iterator = arguments[1];
                                    onComplete = arguments[2];
                                }
                                else {
                                    take = utils.parseInteger(arguments[1], 1);
                                    iterator = arguments[2];
                                }
                            }
                            else if (arguments.length > 3) {
                                take = utils.parseInteger(arguments[1], 1);
                                if (!utils.isFunction(arguments[3])) {
                                    throw new Error();
                                }
                                iterator = arguments[2];
                                onComplete = arguments[3];
                            }
                        }
                    } catch (e) {
                        throw new JSQLError("Invalid arguments.", [{ key: "Method", value: "skipTake" }]);
                    }
                    return actions.execQry("skipTake", iterator, onComplete, skip, take);
                },
                top: function (n, callback, onComplete) {
                    /// <signature>
                    /// <summary>Executes the query and iterates a subset of the results, calling back the specified 
                    /// function with each item.</summary>
                    /// <param name="n" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// <param name="onComplete" type="Function">A function to call when the iteration is complete.</param>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and iterates a subset of the results, calling back the specified 
                    /// function with each item.</summary>
                    /// <param name="n" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and returns a subset of the results.</summary>
                    /// <param name="n" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <returns type="Array" />
                    /// </signature>
                    try {
                        n = utils.parseInteger(n, 1);
                        if ((callback !== undefined && !utils.isFunction(callback)) || (onComplete !== undefined && !utils.isFunction(onComplete))) {
                            throw new Error();
                        }
                    } catch (e) {
                        throw new JSQLError("Invalid arguments.", [{ key: "Method", value: "top" }]);
                    }
                    return actions.execQry("top", callback, onComplete, 0, n);
                },
                bottom: function (n, callback, onComplete) {
                    /// <signature>
                    /// <summary>Executes the query and iterates, starting from the bottom, a subset of the results, calling back 
                    /// the specified function with each item.</summary>
                    /// <param name="n" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// <param name="onComplete" type="Function">A function to call when the iteration is complete.</param>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and iterates, starting from the bottom, a subset of the results, calling back 
                    /// the specified function with each item.</summary>
                    /// <param name="n" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <param name="callback" type="Function">A function to process each iteration of the results. The first parameter 
                    /// is the item, the second the index.</param>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>Executes the query and returns a subset of the results, starting from the bottom.</summary>
                    /// <param name="n" type="Number">An integer greater than zero that specifies how many rows of 
                    /// the results to return.</param>
                    /// <returns type="Array" />
                    /// </signature>
                    try {
                        n = utils.parseInteger(n, 1);
                        if ((callback !== undefined && !utils.isFunction(callback)) || (onComplete !== undefined && !utils.isFunction(onComplete))) {
                            throw new Error();
                        }
                    } catch (e) {
                        throw new JSQLError("Invalid arguments.", [{ key: "Method", value: "bottom" }]);
                    }
                    return actions.execQry("bottom", callback, onComplete, null, -n);
                },
                __internalSet: function (q) {
                    actions.set(q);
                },
                extend: function () {
                    /// <signature>
                    /// <summary>Creates a copy of the query; applying additional methods to the source query will not effect 
                    /// the copy, and vice versa.</summary>
                    /// <returns type="jSQL.qry" />
                    /// </signature>
                    var copy = jSQL.qry();
                    copy.__internalSet(actions.copy());
                    return copy;
                }
            };
        }
    };
})();