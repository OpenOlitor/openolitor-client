'use strict';

var regexIso8601 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?$/;
// Matches YYYY-MM-ddThh:mm:ss.sssZ where .sss is optional
//var regexIso8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/

function convertDateStringsToDates(input) {
  // Ignore things that aren't objects.
  if (typeof input !== 'object') {
    return input;
  }

  for (var key in input) {
    if (!input.hasOwnProperty(key)) {
      continue;
    }

    var value = input[key];
    var match;
    // Check for string properties which look like dates.
    if (typeof value === 'string' && (match = value.match(regexIso8601))) {
      var milliseconds = Date.parse(match[0]);
      if (!isNaN(milliseconds)) {
        input[key] = new Date(milliseconds);
      }
    } else if (typeof value === 'object') {
      // Recurse into object
      input[key] = convertDateStringsToDates(value);
    }
  }
  return input;
}

function addExtendedEnumValue(id, labelLong, labelShort, value) {
  return {
    id: id,
    label: {
      long: labelLong,
      short: labelShort
    },
    value: value
  };
}

/* This is a pseudo-function in order to enable gettext-extractor to find the translations that need to be done in the constants.
   As described in https://github.com/rubenv/angular-gettext/issues/67
*/
function gettext(string) {
  return string;
}

/**
 */
angular
  .module('openolitor-admin', [
    'ngAnimate',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngTable',
    'ngFileSaver',
    'ngCookies',
    'ngPasswordStrength',
    'ngMessages',
    'angular.filter',
    'angular-toArrayFilter',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'color.picker',
    'ipCookie',
    'frapontillo.bootstrap-switch',
    'gettext',
    'ngHamburger',
    'angularMoment',
    'ngFileUpload',
    'ngLodash',
    'angular-sortable-view',
    'angular.css.injector',
    'angular-toArrayFilter',
    'mm.iban',
    'piwik',
    'openolitor-core',
    'ngQuill'
  ])
  .constant('BUILD_NR', '@@BUILD_NR')
  .constant('LIEFERRHYTHMEN', {
    WOECHENTLICH: gettext('Woechentlich'),
    ZWEIWOECHENTLICH: gettext('Zweiwoechentlich'),
    MONATLICH: gettext('Monatlich'),
    UNREGELMAESSIG: gettext('Unregelmaessig')
  })
  .constant('RHYTHMEN', {
    TAEGLICH: gettext('Täglich'),
    WOECHENTLICH: gettext('Wöchentlich'),
    ZWEIWOECHENTLICH: gettext('Zweiwöchentlich'),
    MONATLICH: gettext('Monatlich'),
    UNREGELMAESSIG: gettext('Unregelmaessig')
  })
  .constant('PREISEINHEITEN', {
    //JAHR: 'Jahr',
    //QUARTAL: 'Quartal',
    //MONAT: 'Monat',
    LIEFERUNG: gettext('Lieferung')
    //ABO: 'Aboende'
  })
  .constant('VERTRIEBSARTEN', {
    DEPOTLIEFERUNG: gettext('Depotlieferung'),
    HEIMLIEFERUNG: gettext('Heimlieferung'),
    POSTLIEFERUNG: gettext('Postlieferung')
  })
  .constant('LAUFZEITEINHEITEN', {
    UNBESCHRAENKT: gettext('Unbeschraenkt'),
    LIEFERUNGEN: gettext('Lieferungen'),
    MONATE: gettext('Monate')
  })
  .constant('FRISTEINHEITEN', {
    MONATE: gettext('Monate'),
    WOCHEN: gettext('Wochen')
  })
  .constant('ANREDE', {
    KEINE: addExtendedEnumValue(undefined, gettext('Keine'), gettext('-')),
    HERR: addExtendedEnumValue('Herr', gettext('Herr'), gettext('Hr.')),
    FRAU: addExtendedEnumValue('Frau', gettext('Frau'), gettext('Fr.'))
  })
  .constant('PAYMENT_TYPES', {
    ANDERER: gettext('Anderer'),
    DIRECT_DEBIT: gettext('DirectDebit'),
    TRANSFER: gettext('Transfer')
  })
  .constant('ABOTYPEN', {
    DEPOTLIEFERUNGABO: gettext('DepotlieferungAbo'),
    HEIMLIEFERUNGABO: gettext('HeimlieferungAbo'),
    POSTLIEFERUNGABO: gettext('PostlieferungAbo')
  })
  .constant('LIEFERSTATUS', {
    UNGEPLANT: gettext('Ungeplant'),
    OFFEN: gettext('Offen'),
    ABGESCHLOSSEN: gettext('Abgeschlossen'),
    VERRECHNET: gettext('Verrechnet')
  })
  .constant('BESTELLSTATUS', {
    ABGESCHLOSSEN: gettext('Abgeschlossen'),
    VERRECHNET: gettext('Verrechnet')
  })
  .constant('RECHNUNGSTATUS', {
    ERSTELLT: gettext('Erstellt'),
    VERSCHICKT: gettext('Verschickt'),
    BEZAHLT: gettext('Bezahlt'),
    MAHNUNG_VERSCHICKT: gettext('MahnungVerschickt'),
    STORNIERT: gettext('Storniert')
  })
  .constant('RECHNUNGSPOSITIONSSTATUS', {
    OFFEN: gettext('Offen'),
    ZUGEWIESEN: gettext('Zugewiesen'),
    BEZAHLT: gettext('Bezahlt'),
    STORNIERT: gettext('Storniert')
  })
  .constant('KORBSTATUS', {
    WIRDGELIEFERT: gettext('WirdGeliefert'),
    GELIEFERT: gettext('Geliefert'),
    FAELLTAUSABWESEND: gettext('FaelltAusAbwesend'),
    FAELLTAUSSALDOZUTIEF: gettext('FaelltAusSaldoZuTief'),
    FAELLTAUSGEKUENDIGT: gettext('FaelltAusGekuendigt')
  })
  .constant('LIEFEREINHEIT', {
    STUECK: addExtendedEnumValue('Stueck', gettext('Stück'), gettext('St.')),
    BUND: addExtendedEnumValue('Bund', gettext('Bund'), gettext('Bu.')),
    GRAMM: addExtendedEnumValue('Gramm', gettext('Gramm'), gettext('gr')),
    KILOGRAMM: addExtendedEnumValue(
      'Kilogramm',
      gettext('Kilogramm'),
      gettext('kg')
    ),
    LITER: addExtendedEnumValue('Liter', gettext('Liter'), gettext('l')),
    PORTION: addExtendedEnumValue(
      'Portion',
      gettext('Portion'),
      gettext('Por.')
    )
  })
  .constant('ARBEITSEINSATZSTATUS', {
    INVORBEREITUNG: gettext('InVorbereitung'),
    BEREIT: gettext('Bereit'),
    ABGESAGT: gettext('Abgesagt'),
    ARCHIVIERT: gettext('Archiviert')
  })
  .constant('ABOTYPEN_ARRAY', [
    'DepotlieferungAbo',
    'HeimlieferungAbo',
    'PostlieferungAbo'
  ])
  .constant('WAEHRUNG', {
    CHF: addExtendedEnumValue(
      'CHF',
      gettext('Schweizer Franken'),
      gettext('CHF')
    ),
    EUR: addExtendedEnumValue('EUR', gettext('Euro'), gettext('EUR')),
    USD: addExtendedEnumValue('USD', gettext('US Dollar'), gettext('USD')),
    GBP: addExtendedEnumValue(
      'GBP',
      gettext('Britisches Pfund'),
      gettext('GBP')
    ),
    CAD: addExtendedEnumValue(
      'CAD',
      gettext('Kanadischer Dollar'),
      gettext('CAD')
    )
  })
  .constant('LIEFERZEITPUNKTE', {
    MONTAG: addExtendedEnumValue('Montag', gettext('Montag'), gettext('MO'), 1),
    DIENSTAG: addExtendedEnumValue(
      'Dienstag',
      gettext('Dienstag'),
      gettext('DI'),
      2
    ),
    MITTWOCH: addExtendedEnumValue(
      'Mittwoch',
      gettext('Mittwoch'),
      gettext('MI'),
      3
    ),
    DONNERSTAG: addExtendedEnumValue(
      'Donnerstag',
      gettext('Donnerstag'),
      gettext('DO'),
      4
    ),
    FREITAG: addExtendedEnumValue(
      'Freitag',
      gettext('Freitag'),
      gettext('FR'),
      5
    ),
    SAMSTAG: addExtendedEnumValue(
      'Samstag',
      gettext('Samstag'),
      gettext('SA'),
      6
    ),
    SONNTAG: addExtendedEnumValue(
      'Sonntag',
      gettext('Sonntag'),
      gettext('SO'),
      7
    )
  })
  .constant('MONATE', {
    JANUAR: addExtendedEnumValue(
      'Januar',
      gettext('Januar'),
      gettext('Jan'),
      1
    ),
    FEBRUAR: addExtendedEnumValue(
      'Februar',
      gettext('Februar'),
      gettext('Feb'),
      2
    ),
    MAERZ: addExtendedEnumValue('Maerz', gettext('März'), gettext('Mar'), 3),
    APRIL: addExtendedEnumValue('April', gettext('April'), gettext('Apr'), 4),
    MAI: addExtendedEnumValue('Mai', gettext('Mai'), gettext('Mai'), 5),
    JUNI: addExtendedEnumValue('Juni', gettext('Juni'), gettext('Jun'), 6),
    JULI: addExtendedEnumValue('Juli', gettext('Juli'), gettext('Jul'), 7),
    AUGUST: addExtendedEnumValue(
      'August',
      gettext('August'),
      gettext('Aug'),
      8
    ),
    SEPTEMBER: addExtendedEnumValue(
      'September',
      gettext('September'),
      gettext('Sep'),
      9
    ),
    OKTOBER: addExtendedEnumValue(
      'Oktober',
      gettext('Oktober'),
      gettext('Okt'),
      10
    ),
    NOVEMBER: addExtendedEnumValue(
      'November',
      gettext('November'),
      gettext('Nov'),
      11
    ),
    DEZEMBER: addExtendedEnumValue(
      'Dezember',
      gettext('Dezember'),
      gettext('Dez'),
      12
    )
  })
  .constant('PENDENZSTATUS', {
    AUSSTEHEND: gettext('Ausstehend'),
    ERLEDIGT: gettext('Erledigt'),
    LIEFERINFORMATION: gettext('Lieferinformation'),
    NICHTERLEDIGT: gettext('NichtErledigt')
  })
  .constant('ZAHLUNGSEXPORTSTATUS', {
    SENT: gettext('Sent'),
    CREATED: gettext('Created'),
    ARCHIVED: gettext('Archived')
  })
  .constant('AUSLIEFERUNGSTATUS', {
    ERFASST: gettext('Erfasst'),
    AUSGELIEFERT: gettext('Ausgeliefert')
  })
  .constant('ROLLE', {
    KUNDE: gettext('Kunde'),
    ADMINISTRATOR: gettext('Administrator')
  })
  .constant('EINSATZEINHEIT', {
    STUNDEN: gettext('Stunden'),
    HALBTAGE: gettext('Halbtage'),
    TAGE: gettext('Tage'),
    PUNKTE: gettext('Punkte')
  })
  .constant('ZEITRAUM', {
    AB_HEUTE: addExtendedEnumValue('D', gettext('Ab Heute'), gettext('Ab Heute')),
    NUR_HEUTE: addExtendedEnumValue('d',gettext('Nur Heute'),gettext('Nur Heute')),
    DIESE_WOCHE: addExtendedEnumValue('w',gettext('Diese Woche'),gettext('Diese Woche')),
    DIESEN_MONAT: addExtendedEnumValue('M',gettext('Diesen Monat'),gettext('Diesen Monat'))
  })
  .constant('USER_ROLES', {
    Guest: 'Guest',
    Administrator: 'Administrator',
    Kunde:'Kunde'
  })
  .constant('SECOND_FACTOR_TYPES', {
    OTP: addExtendedEnumValue('otp', gettext('One-Time-Password (OTP)'), gettext('OTP')),
    EMAIL: addExtendedEnumValue('email', gettext('E-Mail'), gettext('E-Mail'))
  })
  .constant('uiDatetimePickerConfig', {
    dateFormat: 'dd.MM.yyyy HH:mm',
    defaultTime: '08:00:00',
    html5Types: {
      date: 'dd.MM.yyyy',
      'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
      month: 'MMM yyyy'
    },
    initialPicker: 'date',
    reOpenDefault: false,
    enableDate: true,
    enableTime: true,
    buttonBar: {
      show: true,
      now: {
        show: false,
        text: gettext('Jetzt'),
        cls: 'btn-sm btn-default'
      },
      today: {
        show: false,
        text: gettext('Heute'),
        cls: 'btn-sm btn-default'
      },
      clear: {
        show: true,
        text: gettext('Löschen'),
        cls: 'btn-sm btn-default'
      },
      date: {
        show: true,
        text: gettext('Datum'),
        cls: 'btn-sm btn-default'
      },
      time: {
        show: true,
        text: gettext('Zeit'),
        cls: 'btn-sm btn-default'
      },
      close: {
        show: true,
        text: gettext('Schliessen'),
        cls: 'btn-sm btn-default'
      },
      cancel: {
        show: false,
        text: gettext('Abbrechen'),
        cls: 'btn-sm btn-default'
      }
    },
    closeOnDateSelection: true,
    closeOnTimeNow: true,
    appendToBody: false,
    altInputFormats: [],
    ngModelOptions: {},
    saveAs: false,
    readAs: false
  })
  .run(function($rootScope, $location) {
    $rootScope.location = $location;
  })
  .service('appConfig', ['$http', function($http) {
    var loaded = false;
    var configData = {
    };
    configData = getConfig();
    loaded = true;
    return {
      get: function() {
        return configData;
      },
      isLoaded: function() {
        return loaded;
      }
    };
  }])
  .run(function(appConfig) {
    appConfig.get();
  })
  .factory('checkSize', [
    '$rootScope',
    '$window',
    function($rootScope, $window) {
      return function() {
        if ($window.innerWidth >= 1200) {
          $rootScope.tgState = true;
        }
      };
    }
  ])
  .factory('exportTable', [
    'FileSaver',
    function(FileSaver) {
      return function(tableController, fileName) {
        tableController.exportODS(function(file) {
          FileSaver.saveAs(file.response, fileName);
        });
      };
    }
  ])
  .factory('localeSensitiveComparator', function() {
    var isString = function(value) {
      return typeof value.value === 'string';
    };

    var isNumber = function(value) {
      return typeof value.value === 'number';
    };

    var isBoolean = function(value) {
      return typeof value.value === 'boolean';
    };

    return function(v1, v2) {
      if (isString(v1) && isString(v2)) {
        return v1.value.localeCompare(v2.value);
      }

      if ((isNumber(v1) && isNumber(v2)) || (isBoolean(v1) && isBoolean(v2))) {
        return v1.value - v2.value;
      }

      if (angular.isUndefined(v1.value) && !angular.isUndefined(v2.value)) {
        return -1;
      }

      if (angular.isUndefined(v2.value) && !angular.isUndefined(v1.value)) {
        return 1;
      }

      // If we don't get strings, numbers or booleans, just compare by index
      return v1.index < v2.index ? -1 : 1;
    };
  })
  .factory('exportODSModuleFunction', function() {
    return {
      params: {
        exportType: '.ods'
      },
      method: 'GET',
      responseType: 'arraybuffer',
      cache: true,
      transformResponse: function(data) {
        var file;
        if (data) {
          file = new Blob([data], {
            type: 'application/vnd.oasis.opendocument.spreadsheet'
          });
        }
        return {
          response: file
        };
      }
    };
  })
  .factory('cloneObj', function() {
    return function(obj) {
      return angular.copy(obj);
    };
  })
  .factory('msgBus', [
    '$rootScope',
    function($rootScope) {
      var msgBus = {};
      msgBus.emitMsg = function(msg) {
        $rootScope.$emit(msg.type, msg);
      };
      msgBus.onMsg = function(msg, scope, func) {
        var unbind = $rootScope.$on(msg, func);
        scope.$on('$destroy', unbind);
      };
      return msgBus;
    }
  ])
  .run(['ooClientMessageService', '$timeout', function(clientMessageService, $timeout) {
    $timeout(function() {
      console.log('Start clientMessageService');
      clientMessageService.start();
    }, 1000);
  }])
  .config([
    'ngTableFilterConfigProvider',
    function(ngTableFilterConfigProvider) {
      ngTableFilterConfigProvider.setConfig({
        aliasUrls: {
          boolean: 'scripts/utils/ng-table/ng-table-boolean-filter.html'
        }
      });
    }
  ])
  .config([
    '$httpProvider',
    function($httpProvider) {
      $httpProvider.defaults.transformResponse.push(function(responseData) {
        return convertDateStringsToDates(responseData);
      });
    }
  ])
  .config([
    '$locationProvider',
    function($locationProvider) {
      $locationProvider.hashPrefix('');
    }
  ])
  .config([
    '$qProvider',
    function($qProvider) {
      $qProvider.errorOnUnhandledRejections(false);
    }
  ])
    .constant('NG_QUILL_CONFIG', {
    /*
     * @NOTE: this config/output is not localizable.
     */
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],     // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],         // outdent/indent                    // text direction
        [{ 'header': [1, 2, 3, 4, false] }],
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'align': [] }],
        ['link', 'image', 'video'],                         // link and image, video
        ['clean'],                                         // remove formatting button
      ]
    },
    theme: 'snow',
    debug: 'warn',
    placeholder: '',
    readOnly: false,
    bounds: document.body,
    scrollContainer: null
  })
  .config([
    'ngQuillConfigProvider',
    'NG_QUILL_CONFIG',

    function (ngQuillConfigProvider, NG_QUILL_CONFIG) {
      ngQuillConfigProvider.set(NG_QUILL_CONFIG);
    }
  ])
  .run([
    'alertService',
    '$rootScope',
    function(alertService, $rootScope) {
      $rootScope.$removeAlert = alertService.removeAlert();
      var Block = Quill.import('blots/block');
      Block.tagName = 'DIV';
      Quill.register(Block, true);
    }
  ])
  .config([
    '$provide',
    function($provide) {
      $provide.decorator('$exceptionHandler', [
        '$log',
        '$injector',
        function($log, $injector) {
          return function(exception) {
            // using the injector to retrieve services, otherwise circular dependency
            var alertService = $injector.get('alertService');
            alertService.addAlert('error', exception.message);
            // log error default style
            $log.error.apply($log, arguments);
          };
        }
      ]);
    }
  ])
  .factory('errbitErrorInterceptor', function(
    $q,
    $injector
  ) {
    return {
      responseError: function(rejection) {
        var appConfig = $injector.get('appConfig');
        /*jshint -W117 */
        var airbrake = new airbrakeJs.Client({
          projectId: 1,
          host: appConfig.get().AIRBREAK_URL,
          projectKey: appConfig.get().AIRBREAK_API_KEY
        });
        /*jshint +W117 */
        airbrake.addFilter(function(notice) {
          notice.context.environment = appConfig.get().ENV;
          notice.context.version = appConfig.get().VERSION;
          return notice;
        });
        var message = 'Error: ';
        if (
          !angular.isUndefined(rejection.config) &&
          !angular.isUndefined(rejection.config.url)
        ) {
          message += rejection.config.url;
        }
        airbrake.notify(message);
        return $q.reject(rejection);
      }
    };
  })
  .factory('loggedOutInterceptor', function($q, alertService, $window) {
    return {
      responseError: function(rejection) {
        var status = rejection.status;
        if (status === 400) {
          alertService.addAlert(
            'error',
            gettext('Problem beim Aufruf einer Serverfunktion:'),
            rejection.data
          );
        } else if (status === 401) {
          alertService.removeAllAlerts();
          $window.location = '#/logout';
          return;
        }
        return $q.reject(rejection);
      }
    };
  })
  .config([
    '$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('loggedOutInterceptor');
      $httpProvider.interceptors.push('errbitErrorInterceptor');
    }
  ])
  .filter('custNumber', function($filter, LIEFEREINHEIT) {
    return function(number, einheit) {
      if (LIEFEREINHEIT.KILOGRAMM.id === einheit) {
        //return $filter.number(number, digits);
        return Number(number).toFixed(3);
      } else if (
        LIEFEREINHEIT.STUECK.id === einheit ||
        LIEFEREINHEIT.BUND.id === einheit ||
        LIEFEREINHEIT.PORTION.id === einheit
      ) {
        return Number(number).toFixed(1);
      } else if (LIEFEREINHEIT.GRAMM.id === einheit) {
        return Number(number).toFixed(0);
      } else if (LIEFEREINHEIT.LITER.id === einheit) {
        return Number(number).toFixed(2);
      } else {
        return number;
      }
    };
  })
  .filter('fromNow', function(moment) {
    return function(input) {
      return moment(input).fromNow();
    };
  })
  .filter('dateRange', function(moment) {
    function isMidnight(mom) {
      // The moment at midnight
      var mmtMidnight = mom.clone().startOf('day');

      // Difference in minutes == 0 => midnight
      return mom.diff(mmtMidnight, 'minutes') === 0;
    }

    return function(items, from, to, attribute) {
      var result = [];
      if (!angular.isUndefined(items) && items.length > 0) {
        var toPlusOne = to;
        var momTo = moment(to);
        if (isMidnight(momTo)) {
          toPlusOne = momTo.add(1, 'days');
        }
        for (var i = 0; i < items.length; i++) {
          var itemDate = items[i][attribute];
          if (!angular.isUndefined(attribute)) {
            itemDate = items[i][attribute];
          }
          if (angular.isUndefined(to) && angular.isUndefined(from)) {
            result.push(items[i]);
          } else if (angular.isUndefined(to) && itemDate >= from) {
            result.push(items[i]);
          } else if (angular.isUndefined(from) && itemDate <= toPlusOne) {
            result.push(items[i]);
          } else if (itemDate >= from && itemDate <= toPlusOne) {
            result.push(items[i]);
          }
        }
      }
      return result;
    };
  })
  .filter('lastElement', function() {
    return function(input, property) {
      if (!input) {
        return;
      }
      if (angular.isArray(input)) {
        if (!input[input.length - 1]) {
          return;
        } else if (property) {
          return input[input.length - 1][property];
        } else {
          return input[input.length - 1];
        }
      }
      if (input && property) {
        return input[property];
      } else {
        return input;
      }
    };
  })
  .filter('firstElement', function() {
    return function(input, property) {
      if (!input) {
        return;
      }
      if (angular.isArray(input)) {
        if (!input[0]) {
          return;
        } else if (property) {
          return input[0][property];
        } else {
          return input[0];
        }
      }
      if (input && property) {
        return input[property];
      } else {
        return input;
      }
    };
  })
  .filter('notIn', function() {
    return function(items, property, elements) {
      var filtered = [];
      if (!items) {
        return filtered;
      }
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var val = item[property];
        if (elements.indexOf(val) < 0) {
          filtered.push(item);
        }
      }
      return filtered;
    };
  })
  .filter('countOcc', function() {
    return function(items) {
      var filtered = {};
      if (!items) {
        return filtered;
      }
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!angular.isUndefined(filtered[item])) {
          filtered[item] = filtered[item] + 1;
        } else {
          filtered[item] = 1;
        }
      }
      return filtered;
    };
  })
  .config([
    '$routeProvider', 'USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider
        .when('/', {
          redirectTo: '/dashboard'
        })
        .when('/dashboard', {
          templateUrl: 'scripts/dashboard/dashboard.html',
          controller: 'DashboardController',
          name: 'Dashboard',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/abotypen', {
          templateUrl: 'scripts/abotypen/overview/abotypenoverview.html',
          name: 'AbotypenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/abotypen/new', {
          templateUrl: 'scripts/abotypen/detail/abotypendetail.html',
          controller: 'AbotypenDetailController',
          name: 'AbotypenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/abotypen/:id', {
          templateUrl: 'scripts/abotypen/detail/abotypendetail.html',
          controller: 'AbotypenDetailController',
          name: 'AbotypenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/zusatzAbotypen/new', {
          templateUrl: 'scripts/abotypen/detail/abotypendetail.html',
          controller: 'AbotypenDetailController',
          name: 'ZusatzabotypenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/zusatzAbotypen/:id', {
          templateUrl: 'scripts/abotypen/detail/abotypendetail.html',
          controller: 'AbotypenDetailController',
          name: 'ZusatzabotypenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/kunden', {
          templateUrl: 'scripts/kunden/overview/kundenoverview.html',
          controller: 'KundenOverviewController',
          name: 'KundenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/kunden/new', {
          templateUrl: 'scripts/kunden/detail/kundendetail.html',
          controller: 'KundenDetailController',
          name: 'KundeDetail',
          access: USER_ROLES.Administrator
        })
        .when('/kunden/:id', {
          templateUrl: 'scripts/kunden/detail/kundendetail.html',
          controller: 'KundenDetailController',
          name: 'KundeDetail',
          access: USER_ROLES.Administrator
        })
        .when('/kunden/:kundeId/abos/:id', {
          templateUrl: 'scripts/abos/detail/abosdetail.html',
          controller: 'AbosDetailController',
          name: 'AbosDetail',
          access: USER_ROLES.Administrator
        })
        .when('/personen', {
          templateUrl: 'scripts/personen/overview/personenoverview.html',
          controller: 'PersonenOverviewController',
          name: 'PersonenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/produzenten', {
          templateUrl: 'scripts/produzenten/overview/produzentenoverview.html',
          controller: 'ProduzentenOverviewController',
          name: 'ProduzentenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/produzenten/new', {
          templateUrl: 'scripts/produzenten/detail/produzentendetail.html',
          controller: 'ProduzentenDetailController',
          name: 'ProduzentenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/produzenten/:id', {
          templateUrl: 'scripts/produzenten/detail/produzentendetail.html',
          controller: 'ProduzentenDetailController',
          name: 'ProduzentenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/produzenten/:produzentId/abos/:id', {
          templateUrl: 'scripts/abos/detail/abosdetail.html',
          controller: 'AbosDetailController',
          name: 'AbosDetail',
          access: USER_ROLES.Administrator
        })
        .when('/einkaufsrechnungen', {
          templateUrl: 'scripts/einkaufsrechnungen/overview/einkaufsrechnungenoverview.html',
          controller: 'EinkaufsrechnungenOverviewController',
          name: 'EinkaufsrechnungenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/produkte', {
          templateUrl: 'scripts/produkte/overview/produkteoverview.html',
          controller: 'ProdukteOverviewController',
          name: 'ProdukteOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/depots', {
          templateUrl: 'scripts/depots/overview/depotsoverview.html',
          controller: 'DepotsOverviewController',
          name: 'DepotsOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/depots/:id', {
          templateUrl: 'scripts/depots/detail/depotsdetail.html',
          controller: 'DepotsDetailController',
          name: 'DepotsDetail',
          access: USER_ROLES.Administrator
        })
        .when('/abos', {
          templateUrl: 'scripts/abos/overview/abosoverview.html',
          controller: 'AbosOverviewController',
          name: 'AbosOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/zusatzabos', {
          templateUrl: 'scripts/abos/overview/zusatzabosoverview.html',
          controller: 'ZusatzabosOverviewController',
          name: 'ZusatzabosOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/abos/:id', {
          templateUrl: 'scripts/abos/detail/abosdetail.html',
          controller: 'AbosDetailController',
          name: 'AbosDetail',
          access: USER_ROLES.Administrator
        })
        .when('/touren', {
          templateUrl: 'scripts/touren/overview/tourenoverview.html',
          controller: 'TourenOverviewController',
          name: 'TourenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/touren/:id', {
          templateUrl: 'scripts/touren/detail/tourendetail.html',
          controller: 'TourenDetailController',
          name: 'TourenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/pendenzen', {
          templateUrl: 'scripts/pendenzen/overview/pendenzenoverview.html',
          controller: 'PendenzenOverviewController',
          name: 'PendenzenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/lieferplanung', {
          templateUrl: 'scripts/lieferplanungen/overview/lieferplanungoverview.html',
          controller: 'LieferplanungOverviewController',
          name: 'LieferplanungOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/lieferplanung/:id', {
          templateUrl: 'scripts/lieferplanungen/detail/lieferplanungdetail.html',
          controller: 'LieferplanungDetailController',
          name: 'LieferplanungDetail',
          access: USER_ROLES.Administrator
        })
        .when('/depotauslieferungen', {
          templateUrl: 'scripts/auslieferungen/overview/depotauslieferungenoverview.html',
          controller: 'AuslieferungenOverviewController',
          name: 'DepotAuslieferungenOverview',
          model: 'Depot',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/depotauslieferungen/:id', {
          templateUrl: 'scripts/auslieferungen/detail/depotauslieferungdetail.html',
          controller: 'AuslieferungDetailController',
          name: 'DepotAuslieferungDetail',
          model: 'Depot',
          access: USER_ROLES.Administrator
        })
        .when('/tourauslieferungen', {
          templateUrl: 'scripts/auslieferungen/overview/tourauslieferungenoverview.html',
          controller: 'AuslieferungenOverviewController',
          name: 'TourAuslieferungenOverview',
          model: 'Tour',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/tourauslieferungen/:id', {
          templateUrl: 'scripts/auslieferungen/detail/tourauslieferungdetail.html',
          controller: 'AuslieferungDetailController',
          name: 'TourAuslieferungDetail',
          model: 'Tour',
          access: USER_ROLES.Administrator
        })
        .when('/postauslieferungen', {
          templateUrl: 'scripts/auslieferungen/overview/postauslieferungenoverview.html',
          controller: 'AuslieferungenOverviewController',
          name: 'PostAuslieferungenOverview',
          model: 'Post',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/postauslieferungen/:id', {
          templateUrl: 'scripts/auslieferungen/detail/postauslieferungdetail.html',
          controller: 'AuslieferungDetailController',
          name: 'PostAuslieferungDetail',
          model: 'Post',
          access: USER_ROLES.Administrator
        })
        .when('/rechnungen', {
          templateUrl: 'scripts/rechnungen/overview/rechnungenoverview.html',
          controller: 'RechnungenOverviewController',
          name: 'RechnungenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/rechnungen/new', {
          templateUrl: 'scripts/rechnungen/detail/rechnungendetail.html',
          controller: 'RechnungenDetailController',
          name: 'RechnungenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/rechnungen/:id', {
          templateUrl: 'scripts/rechnungen/detail/rechnungendetail.html',
          controller: 'RechnungenDetailController',
          name: 'RechnungenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/rechnungspositionen', {
          templateUrl: 'scripts/rechnungspositionen/overview/rechnungspositionenoverview.html',
          controller: 'RechnungsPositionenOverviewController',
          name: 'RechnungsPositionenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/kunden/:kundeId/rechnungen/new', {
          templateUrl: 'scripts/rechnungen/detail/rechnungendetail.html',
          controller: 'RechnungenDetailController',
          name: 'RechnungenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/kunden/:kundeId/abos/:aboId/rechnungen/new', {
          templateUrl: 'scripts/rechnungen/detail/rechnungendetail.html',
          controller: 'RechnungenDetailController',
          name: 'RechnungenDetail',
          access: USER_ROLES.Administrator
        })
        .when('/zahlungsimports', {
          templateUrl: 'scripts/zahlungsimports/overview/zahlungsimportsoverview.html',
          controller: 'ZahlungsImportsOverviewController',
          name: 'ZahlungsImportsOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/zahlungsimports/new', {
          templateUrl: 'scripts/zahlungsimports/import/zahlungsimports.html',
          controller: 'ZahlungsImportsController',
          name: 'ZahlungsImports',
          access: USER_ROLES.Administrator
        })
        .when('/zahlungsimports/:id', {
          templateUrl: 'scripts/zahlungsimports/import/zahlungsimports.html',
          controller: 'ZahlungsImportsController',
          name: 'ZahlungsImports',
          access: USER_ROLES.Administrator
        })
        .when('/zahlungsexports', {
          templateUrl: 'scripts/zahlungsexports/overview/zahlungsexportsoverview.html',
          controller: 'ZahlungsExportsOverviewController',
          name: 'ZahlungsExportsOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/zahlungsexports/new', {
          templateUrl: 'scripts/zahlungsexports/import/zahlungsexports.html',
          controller: 'ZahlungsExportsController',
          name: 'ZahlungsExports',
          access: USER_ROLES.Administrator
        })
        .when('/zahlungsexports/:id', {
          templateUrl: 'scripts/zahlungsexports/import/zahlungsexports.html',
          controller: 'ZahlungsExportsController',
          name: 'ZahlungsExports',
          access: USER_ROLES.Administrator
        })
        .when('/kundentypen', {
          templateUrl: 'scripts/projekt/settings/kundentypen.html',
          controller: 'ProjektSettingsController',
          name: 'ProjektSettings',
          access: USER_ROLES.Administrator
        })
        .when('/personCategories', {
          templateUrl: 'scripts/projekt/settings/personCategories.html',
          controller: 'ProjektSettingsController',
          name: 'ProjektSettings',
          access: USER_ROLES.Administrator
        })
        .when('/produktkategorien', {
          templateUrl: 'scripts/projekt/settings/produktkategorien.html',
          controller: 'ProjektSettingsController',
          name: 'ProjektSettings',
          access: USER_ROLES.Administrator
        })
        .when('/arbeitskategorien', {
          templateUrl: 'scripts/projekt/settings/arbeitskategorien.html',
          controller: 'ProjektSettingsController',
          name: 'ProjektSettings',
          access: USER_ROLES.Administrator
        })
        .when('/projektsettings', {
          templateUrl: 'scripts/projekt/settings/projektsettings.html',
          controller: 'ProjektSettingsController',
          name: 'ProjektSettings',
          access: USER_ROLES.Administrator
        })
        .when('/reportvorlagen', {
          templateUrl: 'scripts/reportvorlagen/reportvorlagenoverview.html',
          controller: 'ReportvorlagenOverviewController',
          name: 'ReportvorlagenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/mailvorlagen', {
          templateUrl: 'scripts/mailvorlagen/mailvorlagenoverview.html',
          controller: 'MailvorlagenOverviewController',
          name: 'MailvorlagenOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/reports', {
          templateUrl: 'scripts/reports/overview/reportsoverview.html',
          controller: 'ReportsOverviewController',
          name: 'ReportsOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/reports', {
          templateUrl: 'scripts/reports/overview/reportsoverview.html',
          controller: 'ReportsOverviewController',
          name: 'ReportsOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        })
        .when('/reports/:id', {
          templateUrl: 'scripts/reports/detail/reportsdetail.html',
          controller: 'ReportsDetailController',
          name: 'ReportsDetail',
          access: USER_ROLES.Administrator
        })
        .when('/reports/new', {
          templateUrl: 'scripts/reports/detail/reportsdetail.html',
          controller: 'ReportsDetailController',
          name: 'ReportsDetail',
          access: USER_ROLES.Administrator
        })
        .when('/arbeitsangebote', {
          templateUrl: 'scripts/arbeitsangebote/overview/arbeitsangeboteoverview.html',
          controller: 'ArbeitsangeboteOverviewController',
          name: 'ArbeitsangeboteOverview',
          access: USER_ROLES.Administrator
        })
        .when('/arbeitsangebote/new', {
          templateUrl: 'scripts/arbeitsangebote/detail/arbeitsangebotedetail.html',
          controller: 'ArbeitsangeboteDetailController',
          name: 'ArbeitsangeboteDetail',
          access: USER_ROLES.Administrator
        })
        .when('/arbeitsangebote/:id', {
          templateUrl: 'scripts/arbeitsangebote/detail/arbeitsangebotedetail.html',
          controller: 'ArbeitsangeboteDetailController',
          name: 'ArbeitsangeboteDetail',
          access: USER_ROLES.Administrator
        })
        .when('/arbeitseinsaetze', {
          templateUrl: 'scripts/arbeitseinsaetze/overview/arbeitseinsaetzeoverview.html',
          controller: 'ArbeitseinsaetzeOverviewController',
          name: 'ArbeitseinsaetzeOverview',
          access: USER_ROLES.Administrator
        })
        .when('/arbeitseinsatzabrechnung', {
          templateUrl: 'scripts/arbeitseinsatzabrechnung/overview/arbeitseinsatzabrechnungoverview.html',
          controller: 'ArbeitseinsatzabrechnungOverviewController',
          name: 'ArbeitseinsatzabrechnungOverview',
          access: USER_ROLES.Administrator
        })
        .when('/journal', {
          templateUrl: 'scripts/journal/overview/journaloverview.html',
          controller: 'JournalOverviewController',
          name: 'JournalOverview',
          access: USER_ROLES.Administrator,
          reloadOnSearch: false
        });
    }
  ]);
