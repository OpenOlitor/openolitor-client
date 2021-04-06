'use strict';

/**
 */
angular.module('openolitor-admin')
  .controller('OpenOlitorRootController', ['$scope', '$rootScope',
    'ServerService', 'ProjektService', 'gettextCatalog', 'amMoment',
    '$location', 'msgBus', 'checkSize', '$window', '$timeout', 'BUILD_NR',
    'appConfig', 'cssInjector', '$route',
    'ooAuthService', '$cookies', 'moment', 'dialogService',
    function($scope, $rootScope, ServerService, ProjektService,
      gettextCatalog, amMoment, $location, msgBus, checkSize, $window,
      $timeout, BUILD_NR, appConfig, cssInjector, $route,
      ooAuthService, $cookies, moment, dialogService) {
      angular.element($window).bind('resize', function() {
        checkSize();
      });

      $rootScope.viewId = 'Init';

      $scope.currentPathContains = function(pathJunk) {
        var currentUrl = $location.url();
        if(currentUrl.indexOf('?') !== -1) {
          return currentUrl.indexOf('/' + pathJunk + '?') !== -1;
        } else {
          return currentUrl === ('/' + pathJunk) || currentUrl.indexOf('/' + pathJunk + '/') !== -1;
        }
      };

      $scope.getCurrentViewId = function() {
        return $rootScope.viewId;
      };

      $scope.loadedProjectLoggedInOnce = false;
      $scope.loaded = false;

      //initial launch
      checkSize();

      $scope.connected = false;
      $scope.showConnectionErrorMessage = false;

      var unwatchLoggedIn = $scope.$watch(function() {
        return ooAuthService.getUser();
      }, function(user) {
        $scope.loggedIn = ooAuthService.isUserLoggedIn(user);
        $scope.user = user;
        $scope.unwatchStaticServerInfo = $scope.$watch(ServerService.getStaticServerInfo,
          function(info) {
            if (!angular.isUndefined(info)) {
              $scope.serverInfo = info;
              $scope.connected = true;
            }
          });
        if ($scope.loggedIn) {
          $scope.secondFactorType = ooAuthService.getSecondFactorType();
          ProjektService.resolveProjekt(false, !$scope.loadedProjectLoggedInOnce).then(function(projekt) {
            $scope.loadedProjectLoggedInOnce = true;
            $scope.projekt = projekt;
            $rootScope.projekt = projekt;
            $scope.checkWelcomeMessage();
          });
        } else {
          ProjektService.resolveProjekt(true).then(function(projekt) {
            $scope.projekt = projekt;
            $rootScope.projekt = projekt;
          });
        }
      });

      $timeout(function() {
        $scope.menushow[angular.element('.sidebar-nav .active').parent()
          .attr(
            'activate-id')] = true;
      }, 1);

      $scope.buildNr = BUILD_NR;
      $scope.sendStats = false;

      $scope.loadAppConfig = function(count) {
        if(appConfig.isLoaded()) {
          $scope.env = appConfig.get().ENV;
          $scope.version = appConfig.get().version;
          $scope.API_URL = appConfig.get().API_URL;
          $scope.sendStats = appConfig.get().sendStats;
          $scope.loaded = true;
          ServerService.initialize();


        } else {
          if(count < 100) {
            $timeout(function() {
              $scope.loadAppConfig(count++);
            }, 100);
          }
        }
      };

      $scope.loadAppConfig(0);

      msgBus.onMsg('WebSocketClosed', $rootScope, function(event, msg) {
        $scope.connected = false;
        $scope.messagingSocketClosedReason = msg.reason;
        if (angular.isUndefined($scope.messagingSocketClosedSetter)) {
          $scope.messagingSocketClosedSetter = $timeout(function() {
            $scope.showConnectionErrorMessage = true;
            $scope.messagingSocketClosedSetter = undefined;
          }, 30000);
        }
        $scope.$apply();
      });

      msgBus.onMsg('WebSocketOpen', $rootScope, function() {
        $scope.connected = true;
        $scope.showConnectionErrorMessage = false;
        if (!angular.isUndefined($scope.messagingSocketClosedSetter) &&
          !angular.isUndefined($scope.messagingSocketClosedSetter.close)) {
          $scope.messagingSocketClosedSetter.close();
          $scope.messagingSocketClosedSetter = undefined;
        }
        $scope.messagingSocketClosedReason = '';
        $scope.$apply();
      });

      $scope.changeLang = function(lang) {
        if (!angular.isUndefined(lang)) {

          msgBus.emitMsg({
            type: 'ChangeLang',
            reason: lang
          });
          $scope.storeActiveLang(lang);
          $scope.$emit('languageChanged');
          moment.locale(lang);
        }
      };

      msgBus.onMsg('ChangeLang', $rootScope, function(event, msg) {
        gettextCatalog.setCurrentLanguage(msg.reason);
      });

      $scope.displayActiveLang = function() {
        switch(gettextCatalog.getCurrentLanguage()){
          case 'en_US': return 'en';
          case 'cs_CZ': return 'cs';
          case 'es_ES': return 'es';
          case 'hu_HU': return 'hu';
          default: return(gettextCatalog.getCurrentLanguage());
        }
      };

      $scope.activeLang = function() {
        return gettextCatalog.getCurrentLanguage();
      };

      $scope.storedActiveLang = function() {
        return $cookies.get('activeLang');
      };

      $scope.storeActiveLang = function(lang) {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 3650);
        $cookies.put('activeLang', lang, {'expires':expireDate});
      };

      if (angular.isUndefined($scope.storedActiveLang())) {
        var lang = $window.navigator.language || $window.navigator.userLanguage;
        if (lang.startsWith('de-CH')) {
          $scope.changeLang('de_CH');
        } else if (lang.startsWith('de-DE')) {
          $scope.changeLang('de_DE');
        } else if (lang.startsWith('de')) {
          $scope.changeLang('de_DE');
        } else if (lang.startsWith('fr-BE')) {
          $scope.changeLang('fr_BE');
        } else if (lang.startsWith('fr-CH')) {
          $scope.changeLang('fr_CH');
        } else if (lang.startsWith('fr')) {
          $scope.changeLang('fr_CH');
        } else if (lang.startsWith('en')) {
          $scope.changeLang('en');
        } else if (lang.startsWith('es')) {
          $scope.changeLang('es');
        } else if (lang.startsWith('cs')) {
          $scope.changeLang('cs');
        } else if (lang.startsWith('hu')) {
          $scope.changeLang('hu');
        } else {
          $scope.changeLang('en');
        }
      } else {
        $scope.changeLang($scope.storedActiveLang());
      }

      $scope.checkWelcomeMessage = function() {
        if ($scope.projekt.welcomeMessage2) {
          dialogService.displayDialogOkAbort(
            $scope.projekt.welcomeMessage2,
            function() {},
            'Mitteilung',
            true,
            'Schliessen'
          );
        }
      };

      $scope.$on('destroy', function() {
        unwatchLoggedIn();
        if($scope.unwatchStaticServerInfo) {
          $scope.unwatchStaticServerInfo();
        }
      });

      cssInjector.add(appConfig.get().API_URL + 'ressource/style/admin');
    }
  ]);
