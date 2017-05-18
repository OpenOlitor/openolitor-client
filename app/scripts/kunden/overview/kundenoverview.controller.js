'use strict';

/**
 */
angular.module('openolitor-admin')
  .controller('KundenOverviewController', ['$q', '$scope', '$filter', '$location',
    'KundenOverviewModel', 'NgTableParams', 'KundentypenService', 'OverviewCheckboxUtil', 'VorlagenService', 'localeSensitiveComparator', 'EmailUtil', 'lodash', 'FilterQueryUtil',
    function($q, $scope, $filter, $location, KundenOverviewModel, NgTableParams,
      KundentypenService, OverviewCheckboxUtil, VorlagenService, localeSensitiveComparator, EmailUtil, _, FilterQueryUtil) {

      $scope.entries = [];
      $scope.filteredEntries = [];
      $scope.loading = false;
      $scope.model = {};

      $scope.kundentypen = [];
      $scope.$watch(KundentypenService.getKundentypen,
        function(list) {
          if (list) {
            angular.forEach(list, function(item) {
              //check if system or custom kundentyp, use only id
              var id = (item.kundentyp) ? item.kundentyp :
                item;
              $scope.kundentypen.push({
                'id': id,
                'title': id
              });
            });
            $scope.tableParams.reload();
          }
        });

      $scope.search = {
        query: '',
        queryQuery: '',
        filterQuery: ''
      };

      $scope.hasData = function() {
        return $scope.entries !== undefined;
      };

      $scope.checkboxes = {
        checked: false,
        checkedAny: false,
        items: {},
        css: '',
        ids: []
      };

      // watch for check all checkbox
      $scope.$watch(function() {
        return $scope.checkboxes.checked;
      }, function(value) {
        OverviewCheckboxUtil.checkboxWatchCallback($scope, value);
      });

      $scope.projektVorlagen = function() {
        return VorlagenService.getVorlagen('VorlageKundenbrief');
      };

      // watch for data checkboxes
      $scope.$watch(function() {
        return $scope.checkboxes.items;
      }, function() {
        OverviewCheckboxUtil.dataCheckboxWatchCallback($scope);
      }, true);

      $scope.closeBericht = function() {
        $scope.showGenerateReport = false;
      };

      $scope.actions = [{
        labelFunction: function() {
          return 'Kunde erstellen';
        },
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-plus',
        onExecute: function() {
          return $location.path('/kunden/new');
        }
      }, {
        label: 'Kundenbrief',
        noEntityText: true,
        iconClass: 'fa fa-file',
        onExecute: function() {
          $scope.showGenerateReport = true;
          return true;
        },
        isDisabled: function() {
          return !$scope.checkboxes.checkedAny;
        }
      }, {
        label: 'Email versenden',
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-envelope',
        onExecute: function() {
          var emailAddresses = _($scope.filteredEntries)
            .keyBy('id')
            .at($scope.checkboxes.ids)
            .flatMap('ansprechpersonen')
            .map('email')
            .value();

          EmailUtil.toMailToBccLink(emailAddresses);
          return true;
        },
        isDisabled: function() {
          return !$scope.checkboxes.checkedAny;
        }
      }];

      if (!$scope.tableParams) {
        //use default tableParams
        $scope.tableParams = new NgTableParams({ // jshint ignore:line
          page: 1,
          count: 10,
          sorting: {
            bezeichnung: 'asc'
          },
          filter: {
            typen: ''
          }
        }, {
          filterDelay: 0,
          groupOptions: {
            isExpanded: true
          },
          exportODSModel: KundenOverviewModel,
          exportODSFilter: function() {
            return {
              f: $scope.search.filterQuery
            };
          },
          getData: function(params) {
            if (!$scope.entries) {
              return;
            }
            // use build-in angular filter
            var filteredData = $filter('filter')($scope.entries, $scope.search.queryQuery);
            // also filter by ngtable filters
            filteredData = $filter('filter')(filteredData, params.filter());
            var orderedData = $filter('filter')(filteredData, params.filter());
            orderedData = params.sorting ?
              $filter('orderBy')(orderedData, params.orderBy(), false, localeSensitiveComparator) :
              orderedData;

            $scope.filteredEntries = filteredData;

            params.total(orderedData.length);
            return orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
          }

        });
      }

      function search() {
        if ($scope.loading) {
          return;
        }
        $scope.tableParams.reload();

        $scope.loading = true;
        $scope.entries = KundenOverviewModel.query({
          f: $scope.search.filterQuery
        }, function() {
          $scope.tableParams.reload();
          $scope.loading = false;
          $location.search('q', $scope.search.query);
        });

      }

      $scope.toggleShowAll = function() {
        $scope.showAll = !$scope.showAll;
        $scope.tableParams.reload();
      };

      var existingQuery = $location.search().q;
      if (existingQuery) {
        $scope.search.query = existingQuery;
      }

      $scope.$watch('search.query', function() {
        $scope.search.filterQuery = FilterQueryUtil.transform($scope.search
          .query);
        $scope.search.queryQuery = FilterQueryUtil.withoutFilters($scope.search
          .query);
        search();
      }, true);

    }
  ]);
