'use strict';

/**
 */
angular.module('openolitor')
  .controller('ZahlungsImportsController', ['$scope', '$rootScope', '$filter',
    '$routeParams',
    '$http',
    '$location',
    '$uibModal',
    'gettext',
    'ZahlungsImportsModel',
    'ZahlungsEingaengeModel',
    'EnumUtil',
    'API_URL',
    'msgBus',
    'Upload',
    function($scope, $rootScope, $filter, $routeParams, $http, $location, $uibModal,
      gettext, ZahlungsImportsModel, ZahlungsEingaengeModel, EnumUtil, API_URL, msgBus, Upload) {
      $scope.loading = false;

      msgBus.onMsg('EntityModified', $rootScope, function(event, msg) {
        if (msg.entity === 'ZahlungsImport') {
          $rootScope.$apply();
        }
      });

      $scope.isExisting = function() {
        return angular.isDefined($scope.zahlungsImport) && angular.isDefined($scope.zahlungsImport.id);
      };

      $scope.delete = function() {
        return $scope.zahlungsImport.$delete;
      };

      $scope.uploadZahlungsImportFile = function(file) {
        if (!file) {
          return;
        }
        Upload.upload({
          url: API_URL + 'zahlungsimports',
          data: {
            file: file
          }
        }).then(function(response) {
          console.log('Success: ', response.data);
        }, function(errorResponse) {
          console.log('Error status: ' + errorResponse.status);
        });
      };

      if ($routeParams.id) {
        ZahlungsImportsModel.get({
          id: $routeParams.id
        }, function(result) {
          $scope.zahlungsImport = result;
        });
      }

      $scope.zahlungsEingangErledigen = function(zahlungsEingang) {
        ZahlungsEingaengeModel.erledigen({
          zahlungsImportId: $scope.zahlungsImport.id,
          id: zahlungsEingang.id,
          bemerkung: zahlungsEingang.bemerkung
        }, function(result) {
          console.log('erledigt', result);
        });
      };

      $scope.automatischErledigen = function() {
        var entities = $scope.zahlungsImport.zahlungsEingaenge.filter(function(z) {
          return z.status === 'Ok';
        });
        ZahlungsEingaengeModel.automatischErledigen({
            zahlungsImportId: $scope.zahlungsImport.id,
          },
          entities,
          function(result) {
            console.log('auto erledigt', result);
          });
      };
    }
  ]);