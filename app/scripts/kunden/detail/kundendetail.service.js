'use strict';

/**
 */
angular.module('openolitor-admin')
  .factory('KundenDetailService', ['$http', 'appConfig',
    function($http, appConfig) {
      var service = {
        deletePerson: deletePerson,
        disableLogin: disableLogin,
        enableLogin: enableLogin,
        sendEinladung: sendEinladung,
        changeRolle: changeRolle,
        resetOtp: resetOtp
      };

      return service;

      function deletePerson(kundeId, personId) {
        return $http.delete(appConfig.get().API_URL + 'kunden/' + kundeId + '/personen/' + personId);
      };

      function disableLogin(kundeId, personId) {
        return $http.post(appConfig.get().API_URL + 'kunden/' + kundeId + '/personen/' + personId + '/aktionen/logindeaktivieren');
      };

      function enableLogin(kundeId, personId) {
        return $http.post(appConfig.get().API_URL + 'kunden/' + kundeId + '/personen/' + personId + '/aktionen/loginaktivieren');
      };

      function sendEinladung(kundeId, personId) {
        return $http.post(appConfig.get().API_URL + 'kunden/' + kundeId + '/personen/' + personId + '/aktionen/einladungsenden');
      };

      function resetOtp(kundeId, personId) {
        return $http.post(appConfig.get().API_URL + 'kunden/' + kundeId + '/personen/' + personId + '/aktionen/reset_otp');
      };

      function changeRolle(kundeId, personId, rolle) {
        return $http.post(appConfig.get().API_URL + 'kunden/' + kundeId + '/personen/' + personId + '/aktionen/rollewechseln', '"' + rolle + '"');
      };
    }
  ]);
