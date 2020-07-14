'use strict';

/**
 */
angular.module('openolitor-admin')
  .controller('TourenOverviewController', ['$scope', '$rootScope', '$filter',
    'TourenService', 'TourenModel', 'NgTableParams', '$location', 'lodash', 'EmailUtil',
    'OverviewCheckboxUtil', 'gettext',
    function($scope, $rootScope, $filter, TourenService, TourenModel, NgTableParams, $location, _, EmailUtil, OverviewCheckboxUtil,
      gettext) {
      $rootScope.viewId = 'L-Tou';

      $scope.entries = [];
      $scope.filteredEntries = [];
      $scope.loading = false;

      $scope.search = {
        query: ''
      };

      $scope.model = {};

      $scope.checkboxes = {
        checked: false,
        checkedAny: false,
        items: {},
        css: '',
        ids: []
      };

      $scope.hasData = function() {
        return $scope.entries !== undefined;
      };

      // watch for check all checkbox
      $scope.$watch(function() {
        return $scope.checkboxes.checked;
      }, function(value) {
        OverviewCheckboxUtil.checkboxWatchCallback($scope, value);
        $scope.updateChecked();
      });

      // watch for data checkboxes
      $scope.$watch(function() {
        return $scope.checkboxes.items;
      }, function() {
        OverviewCheckboxUtil.dataCheckboxWatchCallback($scope);
      }, true);

      $scope.updateChecked = function() {
        var activeCheckboxes = _.pickBy($scope.checkboxes.items, function(value, key) {
          return value;
        });
        $scope.tourenIdsMailing = _($scope.filteredEntries)
          .keyBy('id')
          .at(Object.keys(activeCheckboxes))
          .map('id')
          .value();
      };

      if (!$scope.tableParams) {
        //use default tableParams
        $scope.tableParams = new NgTableParams({ // jshint ignore:line
          page: 1,
          count: 10,
          sorting: {
            name: 'asc'
          }
        }, {
          filterDelay: 0,
          groupOptions: {
            isExpanded: true
          },
          getData: function(params) {
            if (!$scope.entries) {
              return;
            }
            // use build-in angular filter
            var dataSet = $filter('filter')($scope.entries, $scope.search.query);
            // also filter by ngtable filters
            dataSet = $filter('filter')(dataSet, params.filter());
            dataSet = params.sorting ?
              $filter('orderBy')(dataSet, params.orderBy()) :
              dataSet;

            $scope.filteredEntries = dataSet;

            params.total(dataSet.length);
            return dataSet.slice((params.page() - 1) * params.count(), params.page() * params.count());
          }

        });
      }

      function search() {
        if ($scope.loading) {
          return;
        }
        $scope.tableParams.reload();
      }

      function load() {
        if ($scope.loading) {
          return;
        }

        $scope.loading = true;
        $scope.entries = TourenModel.query({
          q: $scope.query
        }, function() {
          $scope.tableParams.reload();
          $scope.loading = false;
        });
      }

      $scope.$watch('search.query', function() {
        search();
      }, true);

      load();

      $scope.actions = [{
        labelFunction: function() {
          return gettext('Tour erstellen');
        },
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-plus',
        onExecute: function() {
          return $location.path('/touren/new');
        }
      }, {
        label: gettext('E-Mail an Kunden versenden'),
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-envelope',
        onExecute: function() {
          TourenModel.personen({
            f: 'id=' + $scope.checkboxes.ids + ';'
          }, function(personen) {
            var emailAddresses = _.map(personen, 'email');
            EmailUtil.toMailToBccLink(emailAddresses);
          });

          return true;
        },
        isDisabled: function() {
          return !$scope.checkboxes.checkedAny;
        }
      }, {
        label: gettext('E-Mail Formular'),
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-envelope',
        onExecute: function() {
          $scope.url = 'mailing/sendEmailToTourSubscribers';
          $scope.message = gettext('Wenn Sie folgende Label einfügen, werden sie durch den entsprechenden Wert ersetzt: \n {{person.anrede}} \n {{person.vorname}} \n {{person.name}} \n {{person.rolle}} \n {{person.kundeId}} \n {{tour.name}} \n {{tour.beschreibung}}');
          $scope.showCreateEMailDialog = true;
          return true;
        },
        isDisabled: function() {
          return !$scope.checkboxes.checkedAny;
        }
      }];
    }
  ]);
